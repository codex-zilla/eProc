package com.zilla.eproc.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zilla.eproc.dto.ApprovalActionDTO;
import com.zilla.eproc.dto.CreateMaterialRequestDTO;
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
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class RequestControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private SiteRepository siteRepository;
    @Autowired
    private MaterialRepository materialRepository;
    @Autowired
    private MaterialRequestRepository requestRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;

    private String engineerToken;
    private String pmToken;
    private Long siteId;
    private Long materialId;

    @SuppressWarnings("deprecation")
    @BeforeEach
    void setUp() {
        requestRepository.deleteAll();
        materialRepository.deleteAll();
        siteRepository.deleteAll();
        projectRepository.deleteAll();
        userRepository.deleteAll();

        // Create Users
        User engineer = new User();
        engineer.setEmail("eng@test.com");
        engineer.setPasswordHash(passwordEncoder.encode("password"));
        engineer.setName("Engineer");
        engineer.setRole(Role.ENGINEER);
        userRepository.save(engineer);
        engineerToken = jwtUtil.generateToken(engineer.getEmail(), Role.ENGINEER.name());

        User pm = new User();
        pm.setEmail("pm@test.com");
        pm.setPasswordHash(passwordEncoder.encode("password"));
        pm.setName("PM");
        pm.setRole(Role.PROJECT_MANAGER);
        userRepository.save(pm);
        pmToken = jwtUtil.generateToken(pm.getEmail(), Role.PROJECT_MANAGER.name());

        // Create Project & Site
        Project project = new Project();
        project.setName("Test Project");
        project.setOwner("Client");
        project.setBoss(pm); // ADR: Set boss
        project.setEngineer(engineer); // ADR: Assign engineer
        project.setStatus(ProjectStatus.ACTIVE); // ADR: Active status
        project.setCurrency("USD");
        project.setBudgetTotal(BigDecimal.valueOf(100000));
        projectRepository.save(project);

        Site site = new Site();
        site.setProject(project);
        site.setName("Test Site");
        site.setLocation("Loc");
        site.setBudgetCap(BigDecimal.valueOf(50000));
        siteRepository.save(site);
        siteId = site.getId();

        // Create Material
        Material material = new Material();
        material.setName("Test Material");
        material.setCategory(MaterialCategory.CEMENT);
        material.setDefaultUnit(MaterialUnit.BAG);
        material.setReferencePrice(BigDecimal.valueOf(10));
        materialRepository.save(material);
        materialId = material.getId();
    }

    @Test
    void createRequest_withCatalogMaterial_success() throws Exception {
        CreateMaterialRequestDTO dto = new CreateMaterialRequestDTO();
        dto.setSiteId(siteId);
        dto.setMaterialId(materialId);
        dto.setQuantity(BigDecimal.valueOf(100.0));
        dto.setPlannedUsageStart(LocalDateTime.now().plusDays(1));
        dto.setPlannedUsageEnd(LocalDateTime.now().plusDays(2));

        mockMvc.perform(post("/api/requests")
                .header("Authorization", "Bearer " + engineerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.materialName", is("Test Material")));
    }

    @Test
    void createRequest_withManualMaterial_success() throws Exception {
        CreateMaterialRequestDTO dto = new CreateMaterialRequestDTO();
        dto.setSiteId(siteId);
        dto.setManualMaterialName("Manual Item");
        dto.setManualUnit("PCS");
        dto.setManualEstimatedPrice(BigDecimal.valueOf(50));
        dto.setQuantity(BigDecimal.valueOf(10.0));
        dto.setPlannedUsageStart(LocalDateTime.now().plusDays(1));
        dto.setPlannedUsageEnd(LocalDateTime.now().plusDays(2));

        mockMvc.perform(post("/api/requests")
                .header("Authorization", "Bearer " + engineerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.manualMaterialName", is("Manual Item")));
    }

    @Test
    void createRequest_manualWithoutName_fails() throws Exception {
        CreateMaterialRequestDTO dto = new CreateMaterialRequestDTO();
        dto.setSiteId(siteId);
        // Missing materialId AND manualMaterialName
        dto.setManualUnit("PCS");
        dto.setQuantity(BigDecimal.valueOf(10.0));
        dto.setPlannedUsageStart(LocalDateTime.now().plusDays(1));
        dto.setPlannedUsageEnd(LocalDateTime.now().plusDays(2));

        mockMvc.perform(post("/api/requests")
                .header("Authorization", "Bearer " + engineerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejectRequest_requiresComment() throws Exception {
        // Create request first
        MaterialRequest request = createPendingRequest();

        ApprovalActionDTO action = new ApprovalActionDTO();
        action.setStatus(RequestStatus.REJECTED);
        // Missing comment

        mockMvc.perform(patch("/api/requests/" + request.getId() + "/status")
                .header("Authorization", "Bearer " + pmToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(action)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateRequest_onlyAllowedForRejected() throws Exception {
        MaterialRequest request = createPendingRequest();

        CreateMaterialRequestDTO updateDto = new CreateMaterialRequestDTO();
        updateDto.setSiteId(siteId);
        updateDto.setMaterialId(materialId);
        updateDto.setQuantity(BigDecimal.valueOf(50.0));
        updateDto.setPlannedUsageStart(LocalDateTime.now().plusDays(1));
        updateDto.setPlannedUsageEnd(LocalDateTime.now().plusDays(2));

        // Attempt update on PENDING request
        mockMvc.perform(put("/api/requests/" + request.getId())
                .header("Authorization", "Bearer " + engineerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isConflict()); // Or BadRequest depending on implementation
    }

    @Test
    void fullLifecycle_create_reject_update_approve() throws Exception {
        // 1. Create (Already covered, let's start with a pending request)
        MaterialRequest request = createPendingRequest();

        // 2. Reject (PM)
        ApprovalActionDTO rejectVal = new ApprovalActionDTO();
        rejectVal.setStatus(RequestStatus.REJECTED);
        rejectVal.setComment("Too expensive");

        mockMvc.perform(patch("/api/requests/" + request.getId() + "/status")
                .header("Authorization", "Bearer " + pmToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(rejectVal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("REJECTED")));

        // 3. Update (Engineer) - Fix quantity
        CreateMaterialRequestDTO updateDto = new CreateMaterialRequestDTO();
        updateDto.setSiteId(siteId);
        updateDto.setMaterialId(materialId);
        updateDto.setQuantity(BigDecimal.valueOf(50.0));
        updateDto.setPlannedUsageStart(LocalDateTime.now().plusDays(1));
        updateDto.setPlannedUsageEnd(LocalDateTime.now().plusDays(2));

        mockMvc.perform(put("/api/requests/" + request.getId())
                .header("Authorization", "Bearer " + engineerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.quantity", is(50.0)));

        // 4. Approve (PM)
        ApprovalActionDTO approveVal = new ApprovalActionDTO();
        approveVal.setStatus(RequestStatus.APPROVED);

        mockMvc.perform(patch("/api/requests/" + request.getId() + "/status")
                .header("Authorization", "Bearer " + pmToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(approveVal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("APPROVED")));
    }

    @Test
    void engineer_cannot_approve() throws Exception {
        MaterialRequest request = createPendingRequest();

        ApprovalActionDTO action = new ApprovalActionDTO();
        action.setStatus(RequestStatus.APPROVED);

        mockMvc.perform(patch("/api/requests/" + request.getId() + "/status")
                .header("Authorization", "Bearer " + engineerToken) // Wrong token
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(action)))
                .andExpect(status().isForbidden());
    }

    private MaterialRequest createPendingRequest() {
        MaterialRequest request = new MaterialRequest();
        request.setSite(siteRepository.findById(siteId).orElseThrow());
        request.setMaterial(materialRepository.findById(materialId).orElseThrow());
        request.setQuantity(BigDecimal.valueOf(100.0));
        request.setPlannedUsageStart(LocalDateTime.now().plusDays(1));
        request.setPlannedUsageEnd(LocalDateTime.now().plusDays(2));
        request.setRequestedBy(userRepository.findByEmail("eng@test.com").orElseThrow());
        request.setStatus(RequestStatus.PENDING);
        return requestRepository.save(request);
    }
}
