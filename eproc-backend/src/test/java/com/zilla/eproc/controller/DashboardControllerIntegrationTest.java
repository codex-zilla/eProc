package com.zilla.eproc.controller;

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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration test for DashboardController.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class DashboardControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private SiteRepository siteRepository;
    @Autowired
    private RequestRepository requestRepository;
    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    private String accountantToken;
    private String engineerToken;
    private User accountant;

    @BeforeEach
    void setUp() {
        refreshTokenRepository.deleteAll();
        purchaseOrderRepository.deleteAll();
        requestRepository.deleteAll();
        projectRepository.deleteAll();
        userRepository.deleteAll();

        // Create Accountant
        accountant = createUser("acc@test.com", Role.ACCOUNTANT, "Accountant User");
        accountantToken = jwtUtil.generateToken(accountant.getEmail(), accountant.getRole().name());

        // Create Engineer
        User engineer = createUser("eng@test.com", Role.ENGINEER, "Engineer User");
        engineerToken = jwtUtil.generateToken(engineer.getEmail(), engineer.getRole().name());
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
    void getAccountantDashboard_withAccountantToken_returnsDashboardData() throws Exception {
        // Create basic project
        Project project = Project.builder()
                .name("Test Project")
                .owner(accountant) // Reusing user as owner for simplicity
                .budgetTotal(BigDecimal.valueOf(100000))
                .currency("TZS")
                .status(ProjectStatus.ACTIVE)
                .isActive(true)
                .build();
        project = projectRepository.save(project);

        // Create basic site
        Site site = Site.builder()
                .name("Test Site")
                .project(project)
                .location("Mwanza")
                .isActive(true)
                .build();
        site = siteRepository.save(site);

        // Create a Request
        Request request = Request.builder()
                .project(project)
                .site(site)
                .createdBy(accountant)
                .title("Office Supplies")
                .status(RequestStatus.APPROVED)
                .build();
        request = requestRepository.save(request);

        // Create a PO
        PurchaseOrder po = PurchaseOrder.builder()
                .poNumber("PO-001")
                .project(project)
                .request(request) // Add the required request
                .createdBy(accountant)
                .status(PurchaseOrderStatus.OPEN)
                .totalValue(BigDecimal.valueOf(10000))
                .vendorName("Test Vendor")
                .build();
        purchaseOrderRepository.save(po);

        // Call dashboard API
        mockMvc.perform(get("/api/dashboard/accountant")
                .header("Authorization", "Bearer " + accountantToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stats", notNullValue()))
                .andExpect(jsonPath("$.stats.totalPOsCount", is(1)))
                .andExpect(jsonPath("$.stats.openPOsCount", is(1)))
                .andExpect(jsonPath("$.stats.totalCommittedValue", is(10000.0)))
                .andExpect(jsonPath("$.budgetOverview", hasSize(1)))
                .andExpect(jsonPath("$.budgetOverview[0].projectName", is("Test Project")))
                .andExpect(jsonPath("$.recentPOs", hasSize(1)))
                .andExpect(jsonPath("$.recentPOs[0].poNumber", is("PO-001")))
                .andExpect(jsonPath("$.recentDeliveries", hasSize(0)))
                .andExpect(jsonPath("$.monthlySpend", hasSize(6)))
                .andExpect(jsonPath("$.alerts", notNullValue()));
    }

    @Test
    void getAccountantDashboard_withEngineerToken_returnsForbidden() throws Exception {
        mockMvc.perform(get("/api/dashboard/accountant")
                .header("Authorization", "Bearer " + engineerToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}
