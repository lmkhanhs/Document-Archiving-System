package com.datn.dms.controllers;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.datn.dms.dtos.users.response.DetailUserResponse;
import com.datn.dms.dtos.users.response.InfoUserResponse;
import com.datn.dms.dtos.users.response.RegistrationGrowthResponse;
import com.datn.dms.dtos.users.response.UserDistributionResponse;
import com.datn.dms.dtos.users.response.UserStatisticsResponse;
import com.datn.dms.exception.GlobalExceptionHandler;
import com.datn.dms.services.ActiveUserService;
import com.datn.dms.services.UserService;
import com.datn.dms.utils.AuthenticationUtills;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInfo;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private ActiveUserService activeUserService;

    @Mock
    private AuthenticationUtills authenticationUtills;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new UserController(userService, activeUserService, authenticationUtills))
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .addPlaceholderValue("app.prefix", "/api/v1")
                .build();
    }

    @AfterEach
    void logTestCompleted(TestInfo testInfo) {
        System.out.printf("%n[USER_CONTROLLER_TEST] PASSED: %s%n", testInfo.getDisplayName());
    }

    @Test
    void pingUpdatesCurrentUserActivity() throws Exception {
        when(authenticationUtills.getUserName()).thenReturn("admin");

        mockMvc.perform(post("/api/v1/users/ping"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Ping successful"));

        verify(activeUserService).ping("admin");
    }

    @Test
    void getActiveUsersReturnsList() throws Exception {
        when(activeUserService.getActiveUsers()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/users/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Active users retrieved successfully"))
                .andExpect(jsonPath("$.data").isArray());

        verify(activeUserService).getActiveUsers();
    }

    @Test
    void getInfoUserReturnsCurrentUserInfo() throws Exception {
        when(userService.getInfoUser()).thenReturn(infoUser());

        mockMvc.perform(get("/api/v1/users/info"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("User info retrieved successfully"))
                .andExpect(jsonPath("$.data.username").value("admin"));

        verify(userService).getInfoUser();
    }

    @Test
    void getMeReturnsUserDetail() throws Exception {
        when(userService.getDetailUser()).thenReturn(detailUser());

        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("User detail retrieved successfully"))
                .andExpect(jsonPath("$.data.username").value("admin"));

        verify(userService).getDetailUser();
    }

    @Test
    void updateProfileReturnsUpdatedProfile() throws Exception {
        when(userService.updateProfile(any())).thenReturn(detailUser());

        mockMvc.perform(put("/api/v1/users/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Admin User\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Profile updated successfully"))
                .andExpect(jsonPath("$.data.username").value("admin"));

        verify(userService).updateProfile(any());
    }

    @Test
    void updateAvatarReturnsUpdatedProfile() throws Exception {
        when(userService.updateAvatar(any())).thenReturn(detailUser());

        mockMvc.perform(multipart("/api/v1/users/avatar")
                        .file(new MockMultipartFile("file", "avatar.png", "image/png", "avatar".getBytes()))
                        .with(request -> { request.setMethod("PUT"); return request; }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Avatar updated successfully"));

        verify(userService).updateAvatar(any());
    }

    @Test
    void getAllUsersReturnsList() throws Exception {
        when(userService.getAllUsers(any(Pageable.class))).thenReturn(List.of(infoUser()));

        mockMvc.perform(get("/api/v1/users?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Users retrieved successfully"))
                .andExpect(jsonPath("$.data[0].username").value("admin"));

        verify(userService).getAllUsers(any(Pageable.class));
    }

    @Test
    void searchUsersReturnsList() throws Exception {
        when(userService.searchUsers("adm")).thenReturn(List.of(infoUser()));

        mockMvc.perform(get("/api/v1/users/search").param("keyword", "adm"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Users retrieved successfully"))
                .andExpect(jsonPath("$.data[0].username").value("admin"));

        verify(userService).searchUsers("adm");
    }

    @Test
    void filterUsersReturnsList() throws Exception {
        when(userService.filterUsers("ADMIN", "active")).thenReturn(List.of(infoUser()));

        mockMvc.perform(get("/api/v1/users/filter")
                        .param("role", "ADMIN")
                        .param("status", "active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Users filtered successfully"))
                .andExpect(jsonPath("$.data[0].username").value("admin"));

        verify(userService).filterUsers("ADMIN", "active");
    }

    @Test
    void updateRolesReturnsUpdatedUser() throws Exception {
        when(userService.updateRoles(1L, "ADMIN")).thenReturn(infoUser());

        mockMvc.perform(put("/api/v1/users/1/roles").param("roleName", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("User roles updated successfully"))
                .andExpect(jsonPath("$.data.username").value("admin"));

        verify(userService).updateRoles(1L, "ADMIN");
    }

    @Test
    void updateStatusReturnsUpdatedUser() throws Exception {
        when(userService.updateStatus(1L, true)).thenReturn(infoUser());

        mockMvc.perform(put("/api/v1/users/1/status").param("isActive", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("User status updated successfully"));

        verify(userService).updateStatus(1L, true);
    }

    @Test
    void deleteAndRestoreUserCallService() throws Exception {
        mockMvc.perform(delete("/api/v1/users/1/soft"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User soft deleted successfully"));
        verify(userService).softDeleteUser(1L);

        mockMvc.perform(delete("/api/v1/users/1/hard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User hard deleted successfully"));
        verify(userService).hardDeleteUser(1L);

        mockMvc.perform(put("/api/v1/users/1/restore"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User restored successfully"));
        verify(userService).restoreUser(1L);
    }

    @Test
    void getSoftDeletedUsersReturnsList() throws Exception {
        when(userService.getSoftDeletedUsers()).thenReturn(List.of(infoUser()));

        mockMvc.perform(get("/api/v1/users/deleted"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Soft deleted users retrieved successfully"))
                .andExpect(jsonPath("$.data[0].username").value("admin"));

        verify(userService).getSoftDeletedUsers();
    }

    @Test
    void getStatisticsEndpointsReturnData() throws Exception {
        when(userService.getUserStatistics()).thenReturn(UserStatisticsResponse.builder().totalUsers(10L).build());
        when(userService.getUserDistribution()).thenReturn(UserDistributionResponse.builder().build());
        when(userService.getRegistrationGrowth(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(RegistrationGrowthResponse.builder().build());
        when(activeUserService.getActiveUserCount()).thenReturn(3);

        mockMvc.perform(get("/api/v1/users/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get user statistics successfully"));
        verify(userService).getUserStatistics();

        mockMvc.perform(get("/api/v1/users/distribution"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get user distribution successfully"));
        verify(userService).getUserDistribution();

        mockMvc.perform(get("/api/v1/users/registration-growth")
                        .param("startDate", "2026-01-01")
                        .param("endDate", "2026-01-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Get registration growth successfully"));
        verify(userService).getRegistrationGrowth(LocalDate.parse("2026-01-01"), LocalDate.parse("2026-01-31"));

        mockMvc.perform(get("/api/v1/users/active-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Active users retrieved successfully"))
                .andExpect(jsonPath("$.data").value(3));
        verify(activeUserService).getActiveUserCount();
    }

    private InfoUserResponse infoUser() {
        InfoUserResponse response = new InfoUserResponse();
        response.setId(1L);
        response.setUsername("admin");
        response.setActive(true);
        return response;
    }

    private DetailUserResponse detailUser() {
        DetailUserResponse response = new DetailUserResponse();
        response.setId(1L);
        response.setUsername("admin");
        response.setFullName("Admin User");
        return response;
    }
}
