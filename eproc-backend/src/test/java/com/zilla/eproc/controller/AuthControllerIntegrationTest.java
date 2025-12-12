package com.zilla.eproc.controller;

import com.zilla.eproc.dto.LoginRequest;
import com.zilla.eproc.dto.RegisterRequest;
import com.zilla.eproc.model.Role;
import com.zilla.eproc.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AuthController.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void register_success_returnsToken() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("engineer@test.com")
                .password("password123")
                .name("Test Engineer")
                .role(Role.ENGINEER)
                .build();

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.email", is("engineer@test.com")))
                .andExpect(jsonPath("$.role", is("ENGINEER")))
                .andExpect(jsonPath("$.name", is("Test Engineer")));
    }

    @Test
    void register_duplicateEmail_returnsBadRequest() throws Exception {
        // First registration
        RegisterRequest request = RegisterRequest.builder()
                .email("duplicate@test.com")
                .password("password123")
                .name("First User")
                .role(Role.ENGINEER)
                .build();

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // Second registration with same email
        RegisterRequest duplicateRequest = RegisterRequest.builder()
                .email("duplicate@test.com")
                .password("password456")
                .name("Second User")
                .role(Role.ACCOUNTANT)
                .build();

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(duplicateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Email already registered")));
    }

    @Test
    void register_invalidEmail_returnsValidationError() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("invalid-email")
                .password("password123")
                .name("Test User")
                .role(Role.ENGINEER)
                .build();

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.email", notNullValue()));
    }

    @Test
    void login_success_returnsToken() throws Exception {
        // First register a user
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email("login@test.com")
                .password("password123")
                .name("Login User")
                .role(Role.PROJECT_MANAGER)
                .build();

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());

        // Then login
        LoginRequest loginRequest = LoginRequest.builder()
                .email("login@test.com")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.email", is("login@test.com")))
                .andExpect(jsonPath("$.role", is("PROJECT_MANAGER")));
    }

    @Test
    void login_wrongPassword_returnsBadRequest() throws Exception {
        // First register a user
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email("wrongpass@test.com")
                .password("correctpassword")
                .name("Wrong Pass User")
                .role(Role.ACCOUNTANT)
                .build();

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());

        // Try login with wrong password
        LoginRequest loginRequest = LoginRequest.builder()
                .email("wrongpass@test.com")
                .password("wrongpassword")
                .build();

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Invalid email or password")));
    }

    @Test
    void login_userNotFound_returnsBadRequest() throws Exception {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("nonexistent@test.com")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Invalid email or password")));
    }
}
