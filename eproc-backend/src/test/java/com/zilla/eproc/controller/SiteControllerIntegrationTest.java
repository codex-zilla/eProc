package com.zilla.eproc.controller;

import com.zilla.eproc.model.*;
import com.zilla.eproc.repository.*;
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
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;

    private String engineerToken;
    private String pmToken;
    private String otherUserToken;
    private Site assignedSite;
    private Site otherSite;

    @BeforeEach
    void setUp() {
        siteRepository.deleteAll();
        projectRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Create Users
        User engineer = saveUser("eng@test.com", Role.ENGINEER);
        engineerToken = jwtUtil.generateToken(engineer.getEmail(), Role.ENGINEER.name());

        User pm = saveUser("pm@test.com", Role.PROJECT_MANAGER);
        pmToken = jwtUtil.generateToken(pm.getEmail(), Role.PROJECT_MANAGER.name());

        User otherUser = saveUser("other@test.com", Role.ENGINEER);
        otherUserToken = jwtUtil.generateToken(otherUser.getEmail(), Role.ENGINEER.name());

        // 2. Create Assigned Project (PM is Boss, Engineer is Assigned)
        Project assignedProject = saveProject("Assigned Project", pm, engineer);
        assignedSite = saveSite("Assigned Site", assignedProject);

        // 3. Create Unassigned Project (PM is Boss, No Engineer/Other Engineer)
        Project otherProject = saveProject("Other Project", pm, null);
        otherSite = saveSite("Other Site", otherProject);
    }

    @Test
    void engineer_sees_only_assigned_sites() throws Exception {
        mockMvc.perform(get("/api/sites")
                .header("Authorization", "Bearer " + engineerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(assignedSite.getId().intValue())))
                .andExpect(jsonPath("$[0].name", is(assignedSite.getName())));
    }

    @Test
    void engineer_sees_empty_if_no_assignment() throws Exception {
        mockMvc.perform(get("/api/sites")
                .header("Authorization", "Bearer " + otherUserToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void pm_sees_only_owned_sites() throws Exception {
        // PM owns both projects
        mockMvc.perform(get("/api/sites")
                .header("Authorization", "Bearer " + pmToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    private User saveUser(String email, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode("password"));
        user.setName(role.name());
        user.setRole(role);
        return userRepository.save(user);
    }

    private Project saveProject(String name, User boss, User engineer) {
        Project project = new Project();
        project.setName(name);
        project.setBoss(boss);
        project.setEngineer(engineer);
        project.setOwner("Client");
        project.setStatus(ProjectStatus.ACTIVE);
        return projectRepository.save(project);
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
