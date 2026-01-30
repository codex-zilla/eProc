package com.zilla.eproc.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zilla.eproc.dto.*;
import com.zilla.eproc.model.*;
import com.zilla.eproc.repository.*;
import com.zilla.eproc.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration test for ProjectController including project scoping and engineer
 * assignment.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ProjectControllerIntegrationTest {

        @Autowired
        private MockMvc mockMvc;
        @Autowired
        private ObjectMapper objectMapper;
        @Autowired
        private UserRepository userRepository;
        @Autowired
        private ProjectRepository projectRepository;
        @Autowired
        private PasswordEncoder passwordEncoder;
        @Autowired
        private JwtUtil jwtUtil;

        private String pm1Token;
        private String pm2Token;

        private Long userId_PM1;

        @BeforeEach
        void setUp() {
                projectRepository.deleteAll();
                userRepository.deleteAll();

                // Create PM 1 (Owner 1)
                User pm1 = createUser("pm1@test.com", Role.PROJECT_OWNER, "Boss 1");
                userId_PM1 = pm1.getId();
                pm1Token = jwtUtil.generateToken(pm1.getEmail(), pm1.getRole().name());

                // Create PM 2 (Owner 2)
                User pm2 = createUser("pm2@test.com", Role.PROJECT_OWNER, "Boss 2");
                pm2Token = jwtUtil.generateToken(pm2.getEmail(), pm2.getRole().name());

                // Create Engineer 1
                createUser("eng1@test.com", Role.ENGINEER, "Eng 1");

                // Create Engineer 2
                createUser("eng2@test.com", Role.ENGINEER, "Eng 2");

                // Create Accountant
                // Create System Admin
                createUser("admin@test.com", Role.SYSTEM_ADMIN, "Admin");
        }

        private User createUser(String email, Role role, String name) {
                User user = new User();
                user.setEmail(email);
                user.setPasswordHash(passwordEncoder.encode("password"));
                user.setRole(role);
                user.setName(name);
                user.setActive(true);
                return userRepository.save(user);
        }

        @Test
        void createProject_setsBossCorrectly() throws Exception {
                ProjectDTO dto = ProjectDTO.builder()
                                .name("Project Alpha")
                                .budgetTotal(BigDecimal.valueOf(10000))
                                .currency("USD")
                                .build();

                mockMvc.perform(post("/api/projects")
                                .header("Authorization", "Bearer " + pm1Token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.name", is("Project Alpha")))
                                .andExpect(jsonPath("$.ownerEmail", is("pm1@test.com")))
                                .andExpect(jsonPath("$.status", is("ACTIVE")));
        }

        @Test
        void getProjects_isScopedByRole() throws Exception {
                // PM1 creates a project
                createProjectForBoss(userId_PM1, "PM1 Project");

                // PM2 creates a project
                createProjectForBoss(userRepository.findByEmail("pm2@test.com").get().getId(),
                                "PM2 Project");

                // PM1 should only see P1
                mockMvc.perform(get("/api/projects")
                                .header("Authorization", "Bearer " + pm1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(1)))
                                .andExpect(jsonPath("$[0].name", is("PM1 Project")));

                // PM2 should only see P2
                mockMvc.perform(get("/api/projects")
                                .header("Authorization", "Bearer " + pm2Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(1)))
                                .andExpect(jsonPath("$[0].name", is("PM2 Project")));
        }

        // Removed legacy engineer assignment tests (assignEngineer,
        // updateStatus_releasesEngineer, getAvailableEngineers)
        // as they are no longer applicable with the new ProjectAssignment model.

        private Project createProjectForBoss(Long bossId, String name) {
                User boss = userRepository.findById(bossId).orElseThrow();
                Project p = Project.builder()
                                .name(name)
                                .owner(boss)
                                .budgetTotal(BigDecimal.valueOf(1000))
                                .currency("USD")
                                .status(ProjectStatus.ACTIVE)
                                .isActive(true)
                                .build();
                return projectRepository.save(p);
        }
}
