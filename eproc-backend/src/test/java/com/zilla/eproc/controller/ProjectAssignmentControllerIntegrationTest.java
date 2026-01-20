package com.zilla.eproc.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zilla.eproc.dto.CreateAssignmentRequest;
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

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ProjectAssignmentControllerIntegrationTest {

        @Autowired
        private MockMvc mockMvc;
        @Autowired
        private ObjectMapper objectMapper;
        @Autowired
        private UserRepository userRepository;
        @Autowired
        private ProjectRepository projectRepository;
        @Autowired
        private ProjectAssignmentRepository assignmentRepository;
        @Autowired
        private PasswordEncoder passwordEncoder;
        @Autowired
        private JwtUtil jwtUtil;

        private String bossToken;
        private String engineerToken;
        private User boss;
        private User engineer;
        private Project project;

        @BeforeEach
        void setUp() {
                assignmentRepository.deleteAll();
                projectRepository.deleteAll();
                userRepository.deleteAll();

                // Create Boss (PROJECT_MANAGER)
                boss = User.builder()
                                .email("boss@test.com")
                                .passwordHash(passwordEncoder.encode("password"))
                                .name("Boss")
                                .role(Role.PROJECT_MANAGER)
                                .build();
                boss = userRepository.save(boss);
                bossToken = jwtUtil.generateToken(boss.getEmail(), Role.PROJECT_MANAGER.name());

                // Create Engineer with ERB number
                engineer = User.builder()
                                .email("engineer@test.com")
                                .passwordHash(passwordEncoder.encode("password"))
                                .name("Engineer")
                                .role(Role.ENGINEER)
                                .erbNumber("ERB-12345")
                                .build();
                engineer = userRepository.save(engineer);
                engineerToken = jwtUtil.generateToken(engineer.getEmail(), Role.ENGINEER.name());

                // Create Project owned by boss
                project = Project.builder()
                                .name("Test Project")
                                .owner("Client")
                                .boss(boss)
                                .status(ProjectStatus.ACTIVE)
                                .isActive(true)
                                .build();
                project = projectRepository.save(project);
        }

        @Test
        void addTeamMember_success() throws Exception {
                CreateAssignmentRequest request = CreateAssignmentRequest.builder()
                                .userId(engineer.getId())
                                .role("SITE_ENGINEER")
                                .responsibilityLevel("FULL")
                                .startDate(LocalDate.now())
                                .build();

                mockMvc.perform(post("/api/projects/{projectId}/team", project.getId())
                                .header("Authorization", "Bearer " + bossToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.userId", is(engineer.getId().intValue())))
                                .andExpect(jsonPath("$.role", is("SITE_ENGINEER")))
                                .andExpect(jsonPath("$.responsibilityLevel", is("FULL")));
        }

        @Test
        void addTeamMember_failsWithoutAuth() throws Exception {
                CreateAssignmentRequest request = CreateAssignmentRequest.builder()
                                .userId(engineer.getId())
                                .role("SITE_ENGINEER")
                                .startDate(LocalDate.now())
                                .build();

                mockMvc.perform(post("/api/projects/{projectId}/team", project.getId())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isForbidden());
        }

        @Test
        void addTeamMember_failsIfNotBoss() throws Exception {
                CreateAssignmentRequest request = CreateAssignmentRequest.builder()
                                .userId(engineer.getId())
                                .role("SITE_ENGINEER")
                                .startDate(LocalDate.now())
                                .build();

                mockMvc.perform(post("/api/projects/{projectId}/team", project.getId())
                                .header("Authorization", "Bearer " + engineerToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isForbidden());
        }

        @Test
        void getProjectTeam_returnsList() throws Exception {
                // First add a team member
                ProjectAssignment assignment = ProjectAssignment.builder()
                                .project(project)
                                .user(engineer)
                                .role(ProjectRole.SITE_ENGINEER)
                                .responsibilityLevel(ResponsibilityLevel.FULL)
                                .startDate(LocalDate.now())
                                .isActive(true)
                                .build();
                assignmentRepository.save(assignment);

                mockMvc.perform(get("/api/projects/{projectId}/team", project.getId())
                                .header("Authorization", "Bearer " + bossToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(1)))
                                .andExpect(jsonPath("$[0].role", is("SITE_ENGINEER")));
        }

        @Test
        void removeTeamMember_success() throws Exception {
                // First add a team member
                ProjectAssignment assignment = ProjectAssignment.builder()
                                .project(project)
                                .user(engineer)
                                .role(ProjectRole.SITE_ENGINEER)
                                .responsibilityLevel(ResponsibilityLevel.FULL)
                                .startDate(LocalDate.now())
                                .isActive(true)
                                .build();
                assignment = assignmentRepository.save(assignment);

                mockMvc.perform(delete("/api/projects/{projectId}/team/{assignmentId}",
                                project.getId(), assignment.getId())
                                .header("Authorization", "Bearer " + bossToken))
                                .andExpect(status().isNoContent());
        }
}
