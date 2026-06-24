package com.datn.dms.controllers;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.datn.dms.dtos.auth.response.LoginResponse;
import com.datn.dms.dtos.auth.response.LogoutResponse;
import com.datn.dms.dtos.auth.response.RegisterResponse;
import com.datn.dms.exception.GlobalExceptionHandler;
import com.datn.dms.services.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new AuthController(authService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .addPlaceholderValue("app.prefix", "/api/v1")
                .build();
        SecurityContextHolder.clearContext();
    }

    @Test
    void loginReturnsToken() throws Exception {
        when(authService.login(any())).thenReturn(LoginResponse.builder()
                .tokenType("Bearer")
                .accessToken("access-token")
                .expiresIn(3600)
                .refreshToken("refresh-token")
                .build());

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"secret\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Login successfully"))
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.accessToken").value("access-token"));

        verify(authService).login(any());
    }

    @Test
    void logoutReturnsSuccess() throws Exception {
        when(authService.handleLogout(any())).thenReturn(LogoutResponse.builder().success(true).build());

        mockMvc.perform(post("/api/v1/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"refresh-token\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Logout successfully!"));

        verify(authService).handleLogout(any());
    }

    @Test
    void registerReturnsCreatedApiCode() throws Exception {
        when(authService.register(any())).thenReturn(RegisterResponse.builder().success(true).build());

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"new-user\",\"password\":\"secret\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.message").value("Register successfully"))
                .andExpect(jsonPath("$.data.success").value(true));

        verify(authService).register(any());
    }

    @Test
    void googleLoginReturnsToken() throws Exception {
        when(authService.googleLogin(any())).thenReturn(LoginResponse.builder().accessToken("google-token").build());

        mockMvc.perform(post("/api/v1/auth/google-login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"credential\":\"credential\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Google Login successfully"))
                .andExpect(jsonPath("$.data.accessToken").value("google-token"));

        verify(authService).googleLogin(any());
    }

    @Test
    void getRolesReadsAuthoritiesFromSecurityContext() throws Exception {
        SecurityContextHolder.getContext().setAuthentication(new TestingAuthenticationToken(
                "admin", null, java.util.List.of(new SimpleGrantedAuthority("ADMIN"), new SimpleGrantedAuthority("USER"))));

        mockMvc.perform(get("/api/v1/auth/roles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Get roles successfully"))
                .andExpect(jsonPath("$.data.roles", containsInAnyOrder("ADMIN", "USER")));
    }

    @Test
    void changePasswordCallsService() throws Exception {
        mockMvc.perform(put("/api/v1/auth/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"oldPassword\":\"old\",\"newPassword\":\"new\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Change password successfully"));

        verify(authService).changePassword(any());
    }
}
