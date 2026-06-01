package com.datn.dms.configuations;

import com.datn.dms.repositories.FileRepository;
import com.datn.dms.repositories.SummaryRepository;
import com.datn.dms.repositories.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final String aiBaseUrl;
    private final String uploadDir;
    private final SummaryRepository summaryRepository;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final JwtDecodeCustomize jwtDecoder;

    public WebSocketConfig(
            @Value("${app.ai.base-url}") String aiBaseUrl,
            @Value("${app.storage.upload-dir:uploads}") String uploadDir,
            SummaryRepository summaryRepository,
            FileRepository fileRepository,
            UserRepository userRepository,
            ObjectMapper objectMapper,
            JwtDecodeCustomize jwtDecoder) {
        this.aiBaseUrl = aiBaseUrl;
        this.uploadDir = uploadDir;
        this.summaryRepository = summaryRepository;
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.jwtDecoder = jwtDecoder;
    }

    /**
     * Tăng giới hạn kích thước message WebSocket lên 50MB
     * để hỗ trợ gửi file base64-encoded qua WebSocket.
     */
    @Bean
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        container.setMaxTextMessageBufferSize(50 * 1024 * 1024);   // 50 MB
        container.setMaxBinaryMessageBufferSize(50 * 1024 * 1024); // 50 MB
        return container;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        JwtWebSocketInterceptor interceptor = new JwtWebSocketInterceptor(jwtDecoder, userRepository);

        // Proxy WebSocket cho tóm tắt từ file
        registry.addHandler(
                new SummarizeWebSocketHandler(aiBaseUrl, "/ws/summarize", summaryRepository, fileRepository, objectMapper, uploadDir),
                "/ws/summarize"
        )
        .addInterceptors(interceptor)
        .setAllowedOrigins("*");

        // Proxy WebSocket cho tóm tắt từ văn bản
        registry.addHandler(
                new SummarizeWebSocketHandler(aiBaseUrl, "/ws/summarize-text", summaryRepository, fileRepository, objectMapper, uploadDir),
                "/ws/summarize-text"
        )
        .addInterceptors(interceptor)
        .setAllowedOrigins("*");
    }
}
