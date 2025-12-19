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
        private String eng1Token;

        private Long userId_PM1;
        private Long userId_Eng1;

        @BeforeEach
        void setUp() {
                projectRepository.deleteAll();
                userRepository.deleteAll();

                // Create PM 1 (Boss 1)
                User pm1 = createUser("pm1@test.com", Role.PROJECT_MANAGER, "Boss 1");
                userId_PM1 = pm1.getId();
                pm1Token = jwtUtil.generateToken(pm1.getEmail(), pm1.getRole().name());

                // Create PM 2 (Boss 2)
                User pm2 = createUser("pm2@test.com", Role.PROJECT_MANAGER, "Boss 2");
                pm2Token = jwtUtil.generateToken(pm2.getEmail(), pm2.getRole().name());

                // Create Engineer 1
                User eng1 = createUser("eng1@test.com", Role.ENGINEER, "Eng 1");
                userId_Eng1 = eng1.getId();
                eng1Token = jwtUtil.generateToken(eng1.getEmail(), eng1.getRole().name());

                // Create Engineer 2
                createUser("eng2@test.com", Role.ENGINEER, "Eng 2");

                // Create Accountant
                createUser("acct@test.com", Role.ACCOUNTANT, "Accountant");
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
                                .andExpect(jsonPath("$.bossEmail", is("pm1@test.com")))
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

        @Test
        void assignEngineer_success() throws Exception {
                Project p1 = createProjectForBoss(userId_PM1, "PM1 Project");

                AssignEngineerDTO assignDto = new AssignEngineerDTO();
                assignDto.setEngineerId(userId_Eng1);

                // PM1 assigns Eng1 to P1
                mockMvc.perform(patch("/api/projects/" + p1.getId() + "/engineer")
                                .header("Authorization", "Bearer " + pm1Token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(assignDto)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.engineerEmail", is("eng1@test.com")));

                // Verify Engineer sees the project
                mockMvc.perform(get("/api/projects")
                                .header("Authorization", "Bearer " + eng1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(1)))
                                .andExpect(jsonPath("$[0].name", is("PM1 Project")));
        }

        @Test
        void assignEngineer_failsIfAlreadyAssigned() throws Exception {
                // Setup: Eng1 assigned to P1 (Active)
                Project p1 = createProjectForBoss(userId_PM1, "PM1 Project");
                p1.setEngineer(userRepository.findById(userId_Eng1).get());
                projectRepository.save(p1);

                // Try to assign Eng1 to P2
                Project p2 = createProjectForBoss(userId_PM1, "PM1 Project 2");

                AssignEngineerDTO assignDto = new AssignEngineerDTO();
                assignDto.setEngineerId(userId_Eng1);

                mockMvc.perform(patch("/api/projects/" + p2.getId() + "/engineer")
                                .header("Authorization", "Bearer " + pm1Token) // Same boss, different project
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(assignDto)))
                                .andExpect(status().isConflict()); // Should be error due to existing assignment
                // Note: Exception might map to 500 or 409 depending on global handler, assuming
                // generic error for now
                // Actually IllegalStateException usually maps to 500, let's update test
                // expectation if needed or add handler
                // Code throws IllegalStateException
        }

        @Test
        void getAvailableEngineers_excludesActiveEngineers() throws Exception {
                // Eng1 is assigned to active project
                Project p1 = createProjectForBoss(userId_PM1, "Active Project");
                p1.setEngineer(userRepository.findById(userId_Eng1).get());
                projectRepository.save(p1);

                // Eng2 is free

                mockMvc.perform(get("/api/projects/available-engineers")
                                .header("Authorization", "Bearer " + pm1Token))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(1)))
                                .andExpect(jsonPath("$[0].email", is("eng2@test.com")));
        }

        @Test
        void updateStatus_releasesEngineer() throws Exception {
                // Setup: Eng1 assigned to P1 (Active)
                Project p1 = createProjectForBoss(userId_PM1, "PM1 Project");
                p1.setEngineer(userRepository.findById(userId_Eng1).get());
                projectRepository.save(p1);

                // Verify Eng1 not available
                mockMvc.perform(get("/api/projects/available-engineers")
                                .header("Authorization", "Bearer " + pm1Token))
                                .andExpect(jsonPath("$", hasSize(1))) // Only Eng2 available
                                .andExpect(jsonPath("$[0].email", is("eng2@test.com")));

                // Complete the project
                UpdateProjectStatusDTO statusDto = new UpdateProjectStatusDTO();
                statusDto.setStatus("COMPLETED");

                mockMvc.perform(patch("/api/projects/" + p1.getId() + "/status")
                                .header("Authorization", "Bearer " + pm1Token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(statusDto)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.status", is("COMPLETED")));

                // Verify Eng1 is now available
                mockMvc.perform(get("/api/projects/available-engineers")
                                .header("Authorization", "Bearer " + pm1Token))
                                .andExpect(jsonPath("$", hasSize(2))); // Both avail
        }

        @SuppressWarnings("deprecation")
        private Project createProjectForBoss(Long bossId, String name) {
                User boss = userRepository.findById(bossId).orElseThrow();
                Project p = Project.builder()
                                .name(name)
                                .boss(boss)
                                .owner(boss.getEmail())
                                .budgetTotal(BigDecimal.valueOf(1000))
                                .currency("USD")
                                .status(ProjectStatus.ACTIVE)
                                .isActive(true)
                                .build();
                return projectRepository.save(p);
        }
}
