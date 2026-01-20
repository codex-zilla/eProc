package com.zilla.eproc.service;

import com.zilla.eproc.dto.CreateAssignmentRequest;
import com.zilla.eproc.dto.ProjectAssignmentDTO;
import com.zilla.eproc.exception.ForbiddenException;
import com.zilla.eproc.exception.ResourceNotFoundException;
import com.zilla.eproc.model.*;
import com.zilla.eproc.repository.ProjectAssignmentRepository;
import com.zilla.eproc.repository.ProjectRepository;
import com.zilla.eproc.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectAssignmentServiceTest {

    @Mock
    private ProjectAssignmentRepository assignmentRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProjectAssignmentService service;

    private User boss;
    private User engineer;
    private Project project;

    @BeforeEach
    void setUp() {
        boss = User.builder()
                .id(1L)
                .email("boss@test.com")
                .name("Boss")
                .role(Role.PROJECT_MANAGER)
                .build();

        engineer = User.builder()
                .id(2L)
                .email("engineer@test.com")
                .name("Engineer")
                .role(Role.ENGINEER)
                .erbNumber("ERB-12345")
                .build();

        project = Project.builder()
                .id(1L)
                .name("Test Project")
                .boss(boss)
                .status(ProjectStatus.ACTIVE)
                .build();
    }

    @Test
    void addTeamMember_success() {
        // Given
        when(userRepository.findByEmail("boss@test.com")).thenReturn(Optional.of(boss));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(userRepository.findById(2L)).thenReturn(Optional.of(engineer));
        when(assignmentRepository.existsByProjectIdAndUserIdAndRoleAndIsActiveTrue(anyLong(), anyLong(), any()))
                .thenReturn(false);
        when(assignmentRepository.save(any(ProjectAssignment.class))).thenAnswer(inv -> {
            ProjectAssignment pa = inv.getArgument(0);
            pa.setId(1L);
            return pa;
        });

        CreateAssignmentRequest request = CreateAssignmentRequest.builder()
                .userId(2L)
                .role("SITE_ENGINEER")
                .responsibilityLevel("FULL")
                .startDate(LocalDate.now())
                .build();

        // When
        ProjectAssignmentDTO result = service.addTeamMember(1L, request, "boss@test.com");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getRole()).isEqualTo("SITE_ENGINEER");
        assertThat(result.getResponsibilityLevel()).isEqualTo("FULL");
        verify(assignmentRepository).save(any(ProjectAssignment.class));
    }

    @Test
    void addTeamMember_failsIfNotBoss() {
        // Given
        User otherUser = User.builder()
                .id(3L)
                .email("other@test.com")
                .role(Role.PROJECT_MANAGER)
                .build();

        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherUser));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        CreateAssignmentRequest request = CreateAssignmentRequest.builder()
                .userId(2L)
                .role("SITE_ENGINEER")
                .startDate(LocalDate.now())
                .build();

        // When/Then
        assertThatThrownBy(() -> service.addTeamMember(1L, request, "other@test.com"))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Only the project owner can add team members");
    }

    @Test
    void addTeamMember_failsIfEngineerHasNoErb() {
        // Given
        User engineerNoErb = User.builder()
                .id(4L)
                .email("noerb@test.com")
                .name("No ERB")
                .role(Role.ENGINEER)
                .erbNumber(null)
                .build();

        when(userRepository.findByEmail("boss@test.com")).thenReturn(Optional.of(boss));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(userRepository.findById(4L)).thenReturn(Optional.of(engineerNoErb));
        when(assignmentRepository.existsByProjectIdAndUserIdAndRoleAndIsActiveTrue(anyLong(), anyLong(), any()))
                .thenReturn(false);

        CreateAssignmentRequest request = CreateAssignmentRequest.builder()
                .userId(4L)
                .role("SITE_ENGINEER")
                .startDate(LocalDate.now())
                .build();

        // When/Then
        assertThatThrownBy(() -> service.addTeamMember(1L, request, "boss@test.com"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("ERB number");
    }

    @Test
    void addTeamMember_failsIfAlreadyAssigned() {
        // Given
        when(userRepository.findByEmail("boss@test.com")).thenReturn(Optional.of(boss));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(userRepository.findById(2L)).thenReturn(Optional.of(engineer));
        when(assignmentRepository.existsByProjectIdAndUserIdAndRoleAndIsActiveTrue(1L, 2L, ProjectRole.SITE_ENGINEER))
                .thenReturn(true);

        CreateAssignmentRequest request = CreateAssignmentRequest.builder()
                .userId(2L)
                .role("SITE_ENGINEER")
                .startDate(LocalDate.now())
                .build();

        // When/Then
        assertThatThrownBy(() -> service.addTeamMember(1L, request, "boss@test.com"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already has this role");
    }

    @Test
    void getProjectTeam_returnsList() {
        // Given
        ProjectAssignment assignment = ProjectAssignment.builder()
                .id(1L)
                .project(project)
                .user(engineer)
                .role(ProjectRole.SITE_ENGINEER)
                .responsibilityLevel(ResponsibilityLevel.FULL)
                .startDate(LocalDate.now())
                .isActive(true)
                .build();

        when(userRepository.findByEmail("boss@test.com")).thenReturn(Optional.of(boss));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(assignmentRepository.findByProjectIdAndIsActiveTrue(1L)).thenReturn(List.of(assignment));

        // When
        List<ProjectAssignmentDTO> result = service.getProjectTeam(1L, "boss@test.com");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRole()).isEqualTo("SITE_ENGINEER");
    }

    @Test
    void removeTeamMember_success() {
        // Given
        ProjectAssignment assignment = ProjectAssignment.builder()
                .id(1L)
                .project(project)
                .user(engineer)
                .role(ProjectRole.SITE_ENGINEER)
                .isActive(true)
                .build();

        when(userRepository.findByEmail("boss@test.com")).thenReturn(Optional.of(boss));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment));
        when(assignmentRepository.save(any())).thenReturn(assignment);

        // When
        service.removeTeamMember(1L, 1L, "boss@test.com");

        // Then
        verify(assignmentRepository).save(argThat(a -> !a.getIsActive()));
    }
}
