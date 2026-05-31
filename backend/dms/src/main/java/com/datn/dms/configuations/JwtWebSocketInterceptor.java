package com.datn.dms.configuations;

import com.datn.dms.entities.UserEntity;
import com.datn.dms.repositories.UserRepository;

import kotlin.internal.RequireKotlin;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class JwtWebSocketInterceptor implements HandshakeInterceptor {

    JwtDecodeCustomize jwtDecoder;
    UserRepository userRepository;  

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        if (request instanceof ServletServerHttpRequest servletRequest) {
            String token = servletRequest.getServletRequest().getParameter("token");
            if (token != null && !token.isEmpty()) {
                try {
                    Jwt jwt = jwtDecoder.decode(token);
                    String username = jwt.getSubject();
                    UserEntity user = userRepository.findByUsername(username).orElse(null);
                    if (user != null) {
                        attributes.put("user", user);
                        log.debug("WebSocket handshake authenticated for user: {}", username);
                        return true;
                    }
                } catch (Exception e) {
                    log.error("WebSocket token verification failed: {}", e.getMessage());
                }
            }
        }
        log.warn("WebSocket connection rejected: Missing or invalid token");
        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
    }
}
