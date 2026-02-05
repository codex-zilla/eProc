package com.zilla.eproc.service;

import com.zilla.eproc.dto.CreateMaterialItemDTO;
import com.zilla.eproc.dto.CreateRequestDTO;
import com.zilla.eproc.dto.RequestResponseDTO;
import com.zilla.eproc.exception.ForbiddenException;
import com.zilla.eproc.exception.ResourceNotFoundException;
import com.zilla.eproc.model.*;
import com.zilla.eproc.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RequestServiceTest {

    @Mock
    private RequestRepository requestRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private SiteRepository siteRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RequestAuditLogRepository auditLogRepository;

    @InjectMocks
    private RequestService requestService;

    private User testEngineer;
    private Project testProject;
    private Site testSite;
    private CreateRequestDTO testRequestDTO;

    @BeforeEach
    void setUp() {
        testEngineer = new User();
        testEngineer.setId(1L);
        testEngineer.setEmail("engineer@test.com");
        testEngineer.setName("Test Engineer");
        testEngineer.setRole(Role.ENGINEER);

        testProject = new Project();
        testProject.setId(1L);
        testProject.setName("Test Project");
        testProject.setTeamAssignments(new ArrayList<>());

        User owner = new User();
        owner.setId(2L);
        testProject.setOwner(owner);

        ProjectAssignment assignment = new ProjectAssignment();
        assignment.setUser(testEngineer);
        assignment.setRole(ProjectRole.SITE_ENGINEER);
        testProject.getTeamAssignments().add(assignment);

        testSite = new Site();
        testSite.setId(1L);
        testSite.setName("Test Site");

        // Create test DTO
        CreateMaterialItemDTO material = CreateMaterialItemDTO.builder()
                .name("Cement")
                .quantity(BigDecimal.valueOf(100))
                .measurementUnit("bag")
                .rateEstimate(BigDecimal.valueOf(25000))
                .rateEstimateType("ENGINEER_ESTIMATE")
                .resourceType("MATERIAL")
                .build();

        testRequestDTO = CreateRequestDTO.builder()
                .projectId(1L)
                .siteId(1L)
                .title("Foundation Works")
                .plannedStartDate(LocalDateTime.now())
                .plannedEndDate(LocalDateTime.now().plusDays(7))
                .emergencyFlag(false)
                .additionalDetails("Foundation concrete works")
                .items(List.of(material))
                .build();
    }

    @Test
    @DisplayName("Should create request successfully")
    void shouldCreateRequestSuccessfully() {
        // Arrange
        when(userRepository.findByEmail(testEngineer.getEmail()))
                .thenReturn(Optional.of(testEngineer));
        when(projectRepository.findById(1L))
                .thenReturn(Optional.of(testProject));
        when(siteRepository.findById(1L))
                .thenReturn(Optional.of(testSite));
        when(requestRepository.existsByBoqReferenceCode(anyString()))
                .thenReturn(false);
        when(requestRepository.saveAll(anyList()))
                .thenAnswer(invocation -> {
                    List<Request> requests = invocation.getArgument(0);
                    requests.forEach(r -> r.setId(1L));
                    return requests;
                });

        // Act
        List<RequestResponseDTO> result = requestService.createRequests(
                List.of(testRequestDTO),
                testEngineer.getEmail());

        // Assert
        assertThat(result).hasSize(1);
        RequestResponseDTO response = result.get(0);
        assertThat(response.getTitle()).isEqualTo("Foundation Works");
        assertThat(response.getPriority()).isEqualTo(Priority.NORMAL);
        assertThat(response.getStatus()).isEqualTo(RequestStatus.SUBMITTED);
        assertThat(response.getBoqReferenceCode()).matches("BOQ-\\d{4}-\\d{3}");

        verify(requestRepository).saveAll(anyList());
    }

    @Test
    @DisplayName("Should set HIGH priority when emergency flag is true")
    void shouldSetHighPriorityForEmergency() {
        // Arrange
        testRequestDTO.setEmergencyFlag(true);

        when(userRepository.findByEmail(testEngineer.getEmail()))
                .thenReturn(Optional.of(testEngineer));
        when(projectRepository.findById(1L))
                .thenReturn(Optional.of(testProject));
        when(siteRepository.findById(1L))
                .thenReturn(Optional.of(testSite));
        when(requestRepository.existsByBoqReferenceCode(anyString()))
                .thenReturn(false);
        when(requestRepository.saveAll(anyList()))
                .thenAnswer(invocation -> {
                    List<Request> requests = invocation.getArgument(0);
                    requests.forEach(r -> r.setId(1L));
                    return requests;
                });

        // Act
        List<RequestResponseDTO> result = requestService.createRequests(
                List.of(testRequestDTO),
                testEngineer.getEmail());

        // Assert
        assertThat(result.get(0).getPriority()).isEqualTo(Priority.HIGH);
    }

    @Test
    @DisplayName("Should throw ForbiddenException when user not assigned to project")
    void shouldThrowExceptionWhenUserNotAssigned() {
        // Arrange
        testProject.setTeamAssignments(new ArrayList<>()); // Remove assignments

        when(userRepository.findByEmail(testEngineer.getEmail()))
                .thenReturn(Optional.of(testEngineer));
        when(projectRepository.findById(1L))
                .thenReturn(Optional.of(testProject));

        // Act & Assert
        assertThatThrownBy(() -> requestService.createRequests(
                List.of(testRequestDTO),
                testEngineer.getEmail()))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("not assigned to this project");
    }

    @Test
    @DisplayName("Should generate unique BOQ codes for multiple requests")
    void shouldGenerateUniqueBOQCodes() {
        // Arrange
        CreateRequestDTO request2 = CreateRequestDTO.builder()
                .projectId(1L)
                .siteId(1L)
                .title("Second Request")
                .plannedStartDate(LocalDateTime.now())
                .plannedEndDate(LocalDateTime.now().plusDays(7))
                .items(testRequestDTO.getItems())
                .build();

        when(userRepository.findByEmail(testEngineer.getEmail()))
                .thenReturn(Optional.of(testEngineer));
        when(projectRepository.findById(1L))
                .thenReturn(Optional.of(testProject));
        when(siteRepository.findById(1L))
                .thenReturn(Optional.of(testSite));
        when(requestRepository.existsByBoqReferenceCode(anyString()))
                .thenReturn(false);
        when(requestRepository.saveAll(anyList()))
                .thenAnswer(invocation -> {
                    List<Request> requests = invocation.getArgument(0);
                    for (int i = 0; i < requests.size(); i++) {
                        requests.get(i).setId((long) (i + 1));
                    }
                    return requests;
                });

        // Act
        List<RequestResponseDTO> result = requestService.createRequests(
                List.of(testRequestDTO, request2),
                testEngineer.getEmail());

        // Assert
        assertThat(result).hasSize(2);
        String code1 = result.get(0).getBoqReferenceCode();
        String code2 = result.get(1).getBoqReferenceCode();
        assertThat(code1).matches("BOQ-\\d{4}-\\d{3}");
        assertThat(code2).matches("BOQ-\\d{4}-\\d{3}");
        assertThat(code1).isNotEqualTo(code2);
    }

    @Test
    @DisplayName("Should get request by ID successfully")
    void shouldGetRequestById() {
        // Arrange
        Request request = Request.builder()
                .id(1L)
                .project(testProject)
                .site(testSite)
                .createdBy(testEngineer)
                .title("Test Request")
                .status(RequestStatus.SUBMITTED)
                .priority(Priority.NORMAL)
                .boqReferenceCode("BOQ-2024-001")
                .materials(new ArrayList<>())
                .auditLogs(new ArrayList<>())
                .build();

        when(requestRepository.findById(1L))
                .thenReturn(Optional.of(request));
        when(userRepository.findByEmail(testEngineer.getEmail()))
                .thenReturn(Optional.of(testEngineer));

        // Act
        RequestResponseDTO result = requestService.getRequestById(1L, testEngineer.getEmail());

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Test Request");
        assertThat(result.getBoqReferenceCode()).isEqualTo("BOQ-2024-001");
    }

    @Test
    @DisplayName("Should throw exception when request not found")
    void shouldThrowExceptionWhenRequestNotFound() {
        // Arrange
        when(requestRepository.findById(999L))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> requestService.getRequestById(999L, testEngineer.getEmail()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Request not found");
    }

    @Test
    @DisplayName("Should get my requests successfully")
    void shouldGetMyRequests() {
        // Arrange
        Request request = Request.builder()
                .id(1L)
                .project(testProject)
                .site(testSite)
                .createdBy(testEngineer)
                .title("My Request")
                .materials(new ArrayList<>())
                .build();

        when(userRepository.findByEmail(testEngineer.getEmail()))
                .thenReturn(Optional.of(testEngineer));
        when(requestRepository.findByCreatedByIdOrderByCreatedAtDesc(testEngineer.getId()))
                .thenReturn(List.of(request));

        // Act
        List<RequestResponseDTO> result = requestService.getMyRequests(testEngineer.getEmail());

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("My Request");
    }
}
