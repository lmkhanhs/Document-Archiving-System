package com.datn.dms.configuations;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.socket.*;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import jakarta.websocket.ContainerProvider;
import jakarta.websocket.WebSocketContainer;

import java.io.IOException;
import java.util.Queue;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentLinkedQueue;

/**
 * WebSocket proxy handler: relay messages giữa frontend client và Python AI server.
 *
 * Flow:
 *   Frontend ──WS──→ Spring Boot (this handler) ──WS──→ Python:8000
 *   Frontend ←─WS──  Spring Boot (this handler) ←─WS──  Python:8000
 */
@Slf4j
public class SummarizeWebSocketHandler extends TextWebSocketHandler {

    private static final int MAX_MESSAGE_SIZE = 50 * 1024 * 1024; // 50 MB
    private final String pythonWsUrl;

    /**
     * @param aiBaseUrl  VD: http://localhost:8000
     * @param pythonPath VD: /ws/summarize hoặc /ws/summarize-text
     */
    public SummarizeWebSocketHandler(String aiBaseUrl, String pythonPath) {
        this.pythonWsUrl = aiBaseUrl.replace("http://", "ws://")
                                     .replace("https://", "wss://")
                + pythonPath;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession clientSession) throws Exception {
        log.info("Frontend WebSocket connected: {} → proxy toi {}", clientSession.getId(), pythonWsUrl);

        // Tăng buffer size cho client session (frontend → Spring Boot)
        clientSession.setTextMessageSizeLimit(MAX_MESSAGE_SIZE);
        clientSession.setBinaryMessageSizeLimit(MAX_MESSAGE_SIZE);

        // Tạo queue để buffer messages từ frontend trong khi chờ kết nối Python
        Queue<TextMessage> pendingMessages = new ConcurrentLinkedQueue<>();
        clientSession.getAttributes().put("pendingMessages", pendingMessages);

        // Cấu hình WebSocket container với buffer size lớn cho kết nối tới Python
        WebSocketContainer wsContainer = ContainerProvider.getWebSocketContainer();
        wsContainer.setDefaultMaxTextMessageBufferSize(MAX_MESSAGE_SIZE);
        wsContainer.setDefaultMaxBinaryMessageBufferSize(MAX_MESSAGE_SIZE);

        // Tạo connection tới Python AI server
        StandardWebSocketClient pythonClient = new StandardWebSocketClient(wsContainer);

        CompletableFuture<WebSocketSession> future = pythonClient.execute(
                new TextWebSocketHandler() {
                    @Override
                    public void handleTextMessage(WebSocketSession pythonSession, TextMessage message) throws IOException {
                        // Relay message từ Python → Frontend
                        if (clientSession.isOpen()) {
                            clientSession.sendMessage(message);
                        }
                    }

                    @Override
                    public void handleTransportError(WebSocketSession pythonSession, Throwable exception) throws Exception {
                        log.error("Lỗi kết nối tới Python server: {}", exception.getMessage());
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
                try {
                    clientSession.sendMessage(new TextMessage(
                            "{\"type\":\"error\",\"message\":\"Không thể kết nối tới AI server\"}"
                    ));
                    clientSession.close(CloseStatus.SERVER_ERROR);
                } catch (IOException e) {
                    log.error("Lỗi khi đóng client session: {}", e.getMessage());
                }
            } else {
                // Lưu python session vào attributes
                clientSession.getAttributes().put("pythonSession", pythonSession);
                log.info("Kết nối tới Python AI server thành công: {}", pythonWsUrl);

                // Flush tất cả pending messages đã được buffer
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
        // Forward message từ Frontend → Python
        WebSocketSession pythonSession = (WebSocketSession) clientSession.getAttributes().get("pythonSession");

        if (pythonSession != null && pythonSession.isOpen()) {
            pythonSession.sendMessage(message);
            log.debug("Forwarded message từ frontend tới Python server");
        } else {
            // Python session chưa sẵn sàng → buffer message lại
            @SuppressWarnings("unchecked")
            Queue<TextMessage> pending = (Queue<TextMessage>) clientSession.getAttributes().get("pendingMessages");
            if (pending != null) {
                pending.add(message);
                log.info("Python session chưa sẵn sàng, buffered message (queue size: {})", pending.size());
            } else {
                log.warn("Python session chưa sẵn sàng và không có pending queue");
                clientSession.sendMessage(new TextMessage(
                        "{\"type\":\"error\",\"message\":\"AI server chưa sẵn sàng, vui lòng thử lại\"}"
                ));
            }
        }
    }

    @Override
    public void handleTransportError(WebSocketSession clientSession, Throwable exception) throws Exception {
        log.error("Lỗi WebSocket từ frontend: {}", exception.getMessage());

        // Đóng python session nếu có
        WebSocketSession pythonSession = (WebSocketSession) clientSession.getAttributes().get("pythonSession");
        if (pythonSession != null && pythonSession.isOpen()) {
            pythonSession.close(CloseStatus.SERVER_ERROR);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession clientSession, CloseStatus status) throws Exception {
        log.info("Frontend WebSocket closed: {}", status);

        // Đóng python session khi frontend disconnect
        WebSocketSession pythonSession = (WebSocketSession) clientSession.getAttributes().get("pythonSession");
        if (pythonSession != null && pythonSession.isOpen()) {
            pythonSession.close(status);
        }
    }
}
