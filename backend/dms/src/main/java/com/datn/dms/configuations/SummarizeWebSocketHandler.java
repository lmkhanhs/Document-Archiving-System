package com.datn.dms.configuations;

import com.datn.dms.entities.FileEntity;
import com.datn.dms.entities.SummaryEntity;
import com.datn.dms.emuns.SummaryStatus;
import com.datn.dms.entities.UserEntity;
import com.datn.dms.repositories.FileRepository;
import com.datn.dms.repositories.SummaryRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.socket.*;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import jakarta.websocket.ContainerProvider;
import jakarta.websocket.WebSocketContainer;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.Queue;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentLinkedQueue;

@Slf4j
public class SummarizeWebSocketHandler extends TextWebSocketHandler {

    private static final int MAX_MESSAGE_SIZE = 50 * 1024 * 1024; // 50 MB
    private final String pythonWsUrl;
    private final SummaryRepository summaryRepository;
    private final FileRepository fileRepository;
    private final ObjectMapper objectMapper;
    private final boolean isTextSummary;
    private final String uploadDir;

    public SummarizeWebSocketHandler(String aiBaseUrl, String pythonPath,
                                     SummaryRepository summaryRepository,
                                     FileRepository fileRepository,
                                     ObjectMapper objectMapper,
                                     String uploadDir) {
        this.pythonWsUrl = aiBaseUrl.replace("http://", "ws://")
                .replace("https://", "wss://")
                + pythonPath;
        this.summaryRepository = summaryRepository;
        this.fileRepository = fileRepository;
        this.objectMapper = objectMapper;
        this.isTextSummary = pythonPath.contains("-text");
        this.uploadDir = uploadDir;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession clientSession) throws Exception {
        log.info("Frontend WebSocket connected: {} → proxy toi {}", clientSession.getId(), pythonWsUrl);

        clientSession.setTextMessageSizeLimit(MAX_MESSAGE_SIZE);
        clientSession.setBinaryMessageSizeLimit(MAX_MESSAGE_SIZE);

        Queue<TextMessage> pendingMessages = new ConcurrentLinkedQueue<>();
        clientSession.getAttributes().put("pendingMessages", pendingMessages);
        clientSession.getAttributes().put("summaryBuilder", new StringBuilder());
        clientSession.getAttributes().put("startTime", System.currentTimeMillis());

        WebSocketContainer wsContainer = ContainerProvider.getWebSocketContainer();
        wsContainer.setDefaultMaxTextMessageBufferSize(MAX_MESSAGE_SIZE);
        wsContainer.setDefaultMaxBinaryMessageBufferSize(MAX_MESSAGE_SIZE);

        StandardWebSocketClient pythonClient = new StandardWebSocketClient(wsContainer);

        CompletableFuture<WebSocketSession> future = pythonClient.execute(
                new TextWebSocketHandler() {
                    @Override
                    public void handleTextMessage(WebSocketSession pythonSession, TextMessage message) throws IOException {
                        if (clientSession.isOpen()) {
                            clientSession.sendMessage(message);
                            handlePythonMessage(clientSession, message);
                        }
                    }

                    @Override
                    public void handleTransportError(WebSocketSession pythonSession, Throwable exception) throws Exception {
                        log.error("Lỗi kết nối tới Python server: {}", exception.getMessage());
                        markSummaryAsFailed(clientSession);
                        if (clientSession.isOpen()) {
                            clientSession.sendMessage(new TextMessage(
                                    "{\"type\":\"error\",\"message\":\"Lỗi kết nối tới AI server\"}"
                            ));
                            clientSession.close(CloseStatus.SERVER_ERROR);
                        }
                    }

                    @Override
                    public void afterConnectionClosed(WebSocketSession pythonSession, CloseStatus status) throws Exception {
                        log.info("Python WebSocket closed: {}", status);
                        if (clientSession.isOpen()) {
                            clientSession.close(status);
                        }
                    }
                },
                pythonWsUrl
        );

        future.whenComplete((pythonSession, throwable) -> {
            if (throwable != null) {
                log.error("Không thể kết nối tới Python AI server: {}", throwable.getMessage());
                markSummaryAsFailed(clientSession);
                try {
                    clientSession.sendMessage(new TextMessage(
                            "{\"type\":\"error\",\"message\":\"Không thể kết nối tới AI server\"}"
                    ));
                    clientSession.close(CloseStatus.SERVER_ERROR);
                } catch (IOException e) {
                    log.error("Lỗi khi đóng client session: {}", e.getMessage());
                }
            } else {
                clientSession.getAttributes().put("pythonSession", pythonSession);
                log.info("Kết nối tới Python AI server thành công: {}", pythonWsUrl);

                @SuppressWarnings("unchecked")
                Queue<TextMessage> pending = (Queue<TextMessage>) clientSession.getAttributes().get("pendingMessages");
                if (pending != null) {
                    TextMessage msg;
                    while ((msg = pending.poll()) != null) {
                        try {
                            pythonSession.sendMessage(msg);
                            log.debug("Flushed buffered message tới Python server");
                        } catch (IOException e) {
                            log.error("Lỗi khi flush pending message: {}", e.getMessage());
                        }
                    }
                }
            }
        });
    }

    @Override
    protected void handleTextMessage(WebSocketSession clientSession, TextMessage message) throws Exception {
        // Init summary database record on first message
        if (!clientSession.getAttributes().containsKey("summaryId")) {
            initSummaryRecord(clientSession, message.getPayload());
        }

        WebSocketSession pythonSession = (WebSocketSession) clientSession.getAttributes().get("pythonSession");

        if (pythonSession != null && pythonSession.isOpen()) {
            pythonSession.sendMessage(message);
            log.debug("Forwarded message từ frontend tới Python server");
        } else {
            @SuppressWarnings("unchecked")
            Queue<TextMessage> pending = (Queue<TextMessage>) clientSession.getAttributes().get("pendingMessages");
            if (pending != null) {
                pending.add(message);
            } else {
                clientSession.sendMessage(new TextMessage(
                        "{\"type\":\"error\",\"message\":\"AI server chưa sẵn sàng, vui lòng thử lại\"}"
                ));
            }
        }
    }

    @Override
    public void handleTransportError(WebSocketSession clientSession, Throwable exception) throws Exception {
        log.error("Lỗi WebSocket từ frontend: {}", exception.getMessage());
        markSummaryAsFailed(clientSession);

        WebSocketSession pythonSession = (WebSocketSession) clientSession.getAttributes().get("pythonSession");
        if (pythonSession != null && pythonSession.isOpen()) {
            pythonSession.close(CloseStatus.SERVER_ERROR);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession clientSession, CloseStatus status) throws Exception {
        log.info("Frontend WebSocket closed: {}", status);
        
        // If it was closed without finishing
        if (!Boolean.TRUE.equals(clientSession.getAttributes().get("summaryDone"))) {
            markSummaryAsFailed(clientSession);
        }

        WebSocketSession pythonSession = (WebSocketSession) clientSession.getAttributes().get("pythonSession");
        if (pythonSession != null && pythonSession.isOpen()) {
            pythonSession.close(status);
        }
    }

    // --- Private Helper Methods for Summary DB ---

    private void initSummaryRecord(WebSocketSession session, String payload) {
        UserEntity user = (UserEntity) session.getAttributes().get("user");
        if (user == null) {
            log.warn("Cannot save summary history: user not authenticated");
            return;
        }

        try {
            JsonNode rootNode = objectMapper.readTree(payload);
            SummaryEntity summary = new SummaryEntity();
            summary.setUser(user);
            summary.setStatus(SummaryStatus.PROCESSING.name());
            summary.setModel("BartPho");
            summary.setSummaryLength(0);
            summary.setDuration(0.0);

            if (isTextSummary) {
                summary.setSummaryType("TEXT");
                String text = rootNode.has("text") ? rootNode.get("text").asText() : "";
                summary.setOriginalContent(text);
                summary.setOriginalLength(text.split("\\s+").length);
            } else {
                summary.setSummaryType("FILE");
                String base64Content = rootNode.has("content") ? rootNode.get("content").asText() : "";
                String filename = rootNode.has("filename") ? rootNode.get("filename").asText() : "unknown";

                // Ưu tiên lấy FileEntity có sẵn nếu frontend gửi fileId (từ MyDocuments)
                boolean fileLinked = false;
                if (rootNode.has("fileId") && !rootNode.get("fileId").isNull()) {
                    try {
                        Long fileId = rootNode.get("fileId").asLong();
                        var fileOpt = fileRepository.findById(fileId);
                        if (fileOpt.isPresent()) {
                            summary.setFile(fileOpt.get());
                            summary.setOriginalLength((int) fileOpt.get().getSize().longValue());
                            fileLinked = true;
                            log.info("Linked existing FileEntity ID: {} for summary", fileId);
                        }
                    } catch (Exception e) {
                        log.warn("Could not link file by fileId: {}", e.getMessage());
                    }
                }

                // Nếu chưa liên kết được (user upload trực tiếp từ trang Summarize),
                // decode base64, lưu file vào local storage và tạo FileEntity mới
                if (!fileLinked && base64Content != null && !base64Content.isEmpty()) {
                    try {
                        FileEntity newFile = saveBase64ToFile(base64Content, filename, user);
                        if (newFile != null) {
                            summary.setFile(newFile);
                            summary.setOriginalLength((int) newFile.getSize().longValue());
                            log.info("Created new FileEntity ID: {} from uploaded file: {}", newFile.getId(), filename);
                        }
                    } catch (Exception e) {
                        log.error("Failed to save uploaded file to storage: {}", e.getMessage());
                        summary.setOriginalLength(base64Content.length());
                    }
                }
            }

            summary = summaryRepository.save(summary);
            session.getAttributes().put("summaryId", summary.getId());
            log.debug("Created SummaryEntity ID: {}", summary.getId());
        } catch (Exception e) {
            log.error("Failed to init summary record: {}", e.getMessage());
        }
    }

    /**
     * Decode base64 content (data URL format), lưu file vào thư mục uploads,
     * tạo và trả về FileEntity với đầy đủ metadata.
     */
    private FileEntity saveBase64ToFile(String base64Content, String filename, UserEntity user) throws IOException {
        // Tách phần header "data:application/pdf;base64," khỏi nội dung base64
        String pureBase64 = base64Content;
        String contentType = "application/octet-stream";

        if (base64Content.contains(",")) {
            String[] parts = base64Content.split(",", 2);
            pureBase64 = parts[1];

            // Trích xuất content type từ header, VD: "data:application/pdf;base64"
            String header = parts[0]; // "data:application/pdf;base64"
            if (header.startsWith("data:") && header.contains(";")) {
                contentType = header.substring(5, header.indexOf(";"));
            }
        }

        // Decode base64 sang byte array
        byte[] fileBytes = Base64.getDecoder().decode(pureBase64);

        // Tạo đường dẫn lưu file: uploads/users/{userId}/summaries/{uuid}{extension}
        String extension = getFileExtension(filename);
        String storedName = UUID.randomUUID() + extension;
        Path relativePath = Paths.get("users", String.valueOf(user.getId()), "summaries", storedName);
        Path destination = Paths.get(uploadDir).resolve(relativePath).normalize();

        // Tạo thư mục nếu chưa có và ghi file
        Files.createDirectories(destination.getParent());
        Files.write(destination, fileBytes);

        log.info("Saved file to: {} ({} bytes)", destination, fileBytes.length);

        // Tạo FileEntity với metadata
        FileEntity fileEntity = new FileEntity();
        fileEntity.setName(filename);
        fileEntity.setType(contentType);
        fileEntity.setSize((long) fileBytes.length);
        fileEntity.setUrl("/uploads/" + relativePath.toString().replace('\\', '/'));
        fileEntity.setOwner(user);
        fileEntity.setDeleted(false);

        return fileRepository.save(fileEntity);
    }

    private String getFileExtension(String fileName) {
        if (fileName == null) return "";
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dotIndex);
    }

    private void handlePythonMessage(WebSocketSession session, TextMessage message) {
        Long summaryId = (Long) session.getAttributes().get("summaryId");
        if (summaryId == null) return;

        try {
            JsonNode rootNode = objectMapper.readTree(message.getPayload());
            String type = rootNode.has("type") ? rootNode.get("type").asText() : "";

            if ("chunk".equals(type) && rootNode.has("summary")) {
                StringBuilder builder = (StringBuilder) session.getAttributes().get("summaryBuilder");
                if (builder != null) {
                    builder.append(rootNode.get("summary").asText()).append(" ");
                }
            } else if ("done".equals(type)) {
                session.getAttributes().put("summaryDone", true);
                completeSummary(session, SummaryStatus.SUCCESS.name());
            } else if ("error".equals(type)) {
                session.getAttributes().put("summaryDone", true);
                completeSummary(session, SummaryStatus.FAILED.name());
            }
        } catch (Exception e) {
            log.error("Error processing python message for summary history: {}", e.getMessage());
        }
    }

    private void markSummaryAsFailed(WebSocketSession session) {
        Long summaryId = (Long) session.getAttributes().get("summaryId");
        if (summaryId != null) {
            completeSummary(session, SummaryStatus.FAILED.name());
            session.getAttributes().remove("summaryId"); // Prevent duplicate updates
        }
    }

    private void completeSummary(WebSocketSession session, String status) {
        Long summaryId = (Long) session.getAttributes().get("summaryId");
        if (summaryId == null) return;

        summaryRepository.findById(summaryId).ifPresent(summary -> {
            summary.setStatus(status);

            if (SummaryStatus.SUCCESS.name().equals(status)) {
                StringBuilder builder = (StringBuilder) session.getAttributes().get("summaryBuilder");
                if (builder != null) {
                    String content = builder.toString().trim();
                    summary.setSummaryContent(content);
                    summary.setSummaryLength(content.split("\\s+").length); // rough word count
                }
            }

            Long startTime = (Long) session.getAttributes().get("startTime");
            if (startTime != null) {
                double duration = (System.currentTimeMillis() - startTime) / 1000.0;
                summary.setDuration(duration);
            }

            summaryRepository.save(summary);
            log.debug("Updated SummaryEntity ID: {} with status: {}", summary.getId(), status);
        });
    }
}
