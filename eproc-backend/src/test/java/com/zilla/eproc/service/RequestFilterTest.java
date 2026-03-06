package com.zilla.eproc.service;

import com.zilla.eproc.dto.RequestResponseDTO;
import com.zilla.eproc.model.*;
import com.zilla.eproc.repository.ProjectAssignmentRepository;
import com.zilla.eproc.repository.RequestRepository;
import com.zilla.eproc.repository.UserRepository;
import com.zilla.eproc.repository.ProjectRepository;
import com.zilla.eproc.repository.PurchaseOrderItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RequestFilterTest {

        @Mock
        private RequestRepository requestRepository;

        @Mock
        private UserRepository userRepository;

        @Mock
        private ProjectAssignmentRepository projectAssignmentRepository;

        @Mock
        private ProjectRepository projectRepository;

        @Mock
        private ProjectSecurityService projectSecurityService;

        @Mock
        private PurchaseOrderItemRepository purchaseOrderItemRepository;

        @InjectMocks
        private RequestService requestService;

        // ... setup ...

        @Test
        @DisplayName("Should allow assigned user to view project requests")
        void shouldAllowAssignedUserToViewProjectRequests() {
                // Arrange
                when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
                when(projectRepository.findById(project1.getId())).thenReturn(Optional.of(project1));
                when(projectSecurityService.hasProjectAccess(testUser.getEmail(), project1.getId())).thenReturn(true);
                when(requestRepository.findByProjectIdOrderByCreatedAtDesc(project1.getId()))
                                .thenReturn(List.of(approvedRequest, pendingRequest));

                when(purchaseOrderItemRepository.findByRequestId(anyLong())).thenReturn(List.of());

                // Act
                List<RequestResponseDTO> result = requestService.getProjectRequests(project1.getId(),
                                testUser.getEmail());

                // Assert
                assertThat(result).hasSize(2);
        }

        private User testUser;
        private Project project1;
        private Site site1;
        private Request approvedRequest;
        private Request pendingRequest;

        @BeforeEach
        void setUp() {
                testUser = new User();
                testUser.setId(1L);
                testUser.setEmail("user@test.com");
                testUser.setRole(Role.MANAGER);

                project1 = new Project();
                project1.setId(10L);
                project1.setName("Project 1");

                site1 = new Site();
                site1.setId(100L);
                site1.setName("Site 1");

                User owner = new User();
                owner.setId(2L);
                project1.setOwner(owner);

                approvedRequest = Request.builder()
                                .id(1L)
                                .project(project1)
                                .site(site1)
                                .status(RequestStatus.APPROVED)
                                .createdBy(testUser)
                                .materials(new ArrayList<>())
                                .auditLogs(new ArrayList<>())
                                .build();

                pendingRequest = Request.builder()
                                .id(2L)
                                .project(project1)
                                .site(site1)
                                .status(RequestStatus.PENDING)
                                .createdBy(testUser)
                                .materials(new ArrayList<>())
                                .auditLogs(new ArrayList<>())
                                .build();
        }

        @Test
        @DisplayName("Should filter requests by status APPROVED")
        void shouldFilterByStatus() {
                // Arrange
                when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));

                ProjectAssignment assignment = new ProjectAssignment();
                assignment.setProject(project1);
                when(projectAssignmentRepository.findByUserIdAndIsActiveTrue(testUser.getId()))
                                .thenReturn(List.of(assignment));

                when(requestRepository.findByProjectIdInOrderByCreatedAtDesc(List.of(10L)))
                                .thenReturn(List.of(approvedRequest, pendingRequest));

                when(purchaseOrderItemRepository.findByRequestId(anyLong())).thenReturn(List.of());

                // Act
                List<RequestResponseDTO> result = requestService.getAllManagerRequests(
                                testUser.getEmail(),
                                RequestStatus.APPROVED,
                                null,
                                null,
                                false);

                // Assert
                assertThat(result).hasSize(1);
                assertThat(result.get(0).getId()).isEqualTo(approvedRequest.getId());
                assertThat(result.get(0).getStatus()).isEqualTo(RequestStatus.APPROVED);
        }
}
