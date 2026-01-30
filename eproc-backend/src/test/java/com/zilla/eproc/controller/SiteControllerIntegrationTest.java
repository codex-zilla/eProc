package com.zilla.eproc.controller;

import com.zilla.eproc.model.*;
import com.zilla.eproc.repository.*;
import com.zilla.eproc.dto.SiteDTO;
import com.zilla.eproc.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SiteControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private SiteRepository siteRepository;
    @Autowired
    private ProjectAssignmentRepository projectAssignmentRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;

    private String engineerToken;
    private String pmToken;
    private Site assignedSite;

    @BeforeEach
    void setUp() {
        siteRepository.deleteAll();
        projectAssignmentRepository.deleteAll();
        projectRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Create Users
        User engineer = saveUser("eng@test.com", Role.ENGINEER);
        engineerToken = jwtUtil.generateToken(engineer.getEmail(), Role.ENGINEER.name());

        User pm = saveUser("pm@test.com", Role.PROJECT_OWNER);
        pmToken = jwtUtil.generateToken(pm.getEmail(), Role.PROJECT_OWNER.name());

        // 2. Create Assigned Project (PM is Owner, Engineer is Assigned)
        Project assignedProject = saveProject("Assigned Project", pm);
        createAssignment(assignedProject, engineer, ProjectRole.SITE_ENGINEER);
        assignedSite = saveSite("Assigned Site", assignedProject);

        // 3. Create Unassigned Project (PM is Owner, No Engineer/Other Engineer)

    }

    @Test
    void getAllSites_authenticated_returnsList() throws Exception {
        mockMvc.perform(get("/api/sites")
                .header("Authorization", "Bearer " + pmToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())));
    }

    @Test
    void getSitesByProject_engineerAssigned_returnsSites() throws Exception {
        mockMvc.perform(get("/api/sites/project/" + assignedSite.getProject().getId())
                .header("Authorization", "Bearer " + engineerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Assigned Site")));
    }

    @Test
    void createSite_pm_success() throws Exception {
        SiteDTO dto = new SiteDTO();
        dto.setName("New Site");
        dto.setLocation("New Location");
        dto.setProjectId(assignedSite.getProject().getId());

        mockMvc.perform(post("/api/sites")
                .header("Authorization", "Bearer " + pmToken)
                .contentType("application/json")
                .content(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("New Site")));
    }

    @Test
    void createSite_engineer_forbidden() throws Exception {
        SiteDTO dto = new SiteDTO();
        dto.setName("Eng Site");
        dto.setProjectId(assignedSite.getProject().getId());

        mockMvc.perform(post("/api/sites")
                .header("Authorization", "Bearer " + engineerToken)
                .contentType("application/json")
                .content(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    private User saveUser(String email, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode("password"));
        user.setName(role.name());
        user.setRole(role);
        return userRepository.save(user);
    }

    private Project saveProject(String name, User owner) {
        Project project = new Project();
        project.setName(name);
        project.setOwner(owner);
        project.setStatus(ProjectStatus.ACTIVE);
        return projectRepository.save(project);
    }

    private void createAssignment(Project project, User user, ProjectRole role) {
        ProjectAssignment assignment = ProjectAssignment.builder()
                .project(project)
                .user(user)
                .role(role)
                .startDate(java.time.LocalDate.now())
                .isActive(true)
                .build();
        projectAssignmentRepository.save(assignment);
    }

    private Site saveSite(String name, Project project) {
        Site site = new Site();
        site.setProject(project);
        site.setName(name);
        site.setLocation("Loc");
        site.setIsActive(true);
        return siteRepository.save(site);
    }
}
