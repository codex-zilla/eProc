package com.zilla.eproc.service;

import com.zilla.eproc.dto.EngineerDashboardDTO;
import com.zilla.eproc.dto.ManagerDashboardDTO;
import com.zilla.eproc.exception.ResourceNotFoundException;
import com.zilla.eproc.model.*;
import com.zilla.eproc.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for dashboard statistics.
 * Updated for Role Model Overhaul: boss → owner, uses ProjectAssignment for
 * engineer access.
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

        private final UserRepository userRepository;
        private final ProjectRepository projectRepository;
        private final MaterialRequestRepository materialRequestRepository;
        private final ProjectAssignmentRepository projectAssignmentRepository;

        /**
         * Get dashboard statistics for an engineer.
         * Engineer's projects are now determined via ProjectAssignment table.
         */
        @Transactional(readOnly = true)
        public EngineerDashboardDTO getEngineerDashboard(String email) {
                User engineer = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                // Find engineer's active project assignments
                List<ProjectAssignment> assignments = projectAssignmentRepository
                                .findByUserIdAndIsActiveTrue(engineer.getId());

                EngineerDashboardDTO.EngineerDashboardDTOBuilder builder = EngineerDashboardDTO.builder();

                if (!assignments.isEmpty()) {
                        // Take the first active assignment's project
                        Project project = assignments.get(0).getProject();
                        if (project != null && project.getStatus() == ProjectStatus.ACTIVE) {
                                builder.assignedProjectId(project.getId())
                                                .assignedProjectName(project.getName())
                                                .projectStatus(project.getStatus().name());

                                if (project.getOwner() != null) {
                                        builder.ownerName(project.getOwner().getName())
                                                        .ownerEmail(project.getOwner().getEmail());
                                }
                        }
                }

                // Get request statistics
                List<MaterialRequest> myRequests = materialRequestRepository
                                .findByRequestedByEmail(email);

                int pending = (int) myRequests.stream()
                                .filter(r -> r.getStatus() == RequestStatus.PENDING).count();
                int approved = (int) myRequests.stream()
                                .filter(r -> r.getStatus() == RequestStatus.APPROVED).count();
                int rejected = (int) myRequests.stream()
                                .filter(r -> r.getStatus() == RequestStatus.REJECTED).count();

                return builder
                                .pendingRequests(pending)
                                .approvedRequests(approved)
                                .rejectedRequests(rejected)
                                .totalRequests(myRequests.size())
                                .build();
        }

        /**
         * Get dashboard statistics for a project owner.
         */
        @Transactional(readOnly = true)
        public ManagerDashboardDTO getManagerDashboard(String email) {
                User owner = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                // Get projects owned by this user
                List<Project> myProjects = projectRepository.findByOwnerId(owner.getId());

                int activeProjects = (int) myProjects.stream()
                                .filter(p -> p.getStatus() == ProjectStatus.ACTIVE).count();
                int completedProjects = (int) myProjects.stream()
                                .filter(p -> p.getStatus() == ProjectStatus.COMPLETED).count();

                // Get team members assigned to my active projects (via ProjectAssignment)
                int assignedTeamMembers = 0;
                for (Project p : myProjects) {
                        if (p.getStatus() == ProjectStatus.ACTIVE && p.getTeamAssignments() != null) {
                                assignedTeamMembers += (int) p.getTeamAssignments().stream()
                                                .filter(pa -> Boolean.TRUE.equals(pa.getIsActive())
                                                                && pa.getRole() != ProjectRole.OWNER)
                                                .count();
                        }
                }

                // Get available engineers (by system role)
                List<User> availableEngineers = userRepository.findByRoleAndActiveTrue(Role.ENGINEER);

                // Get pending requests from my projects
                List<MaterialRequest> pendingFromMyProjects = materialRequestRepository
                                .findByProjectOwnerIdAndStatus(owner.getId(), RequestStatus.PENDING);

                // Get all requests from my projects for stats
                List<MaterialRequest> allFromMyProjects = materialRequestRepository
                                .findByProjectOwnerId(owner.getId());

                int approved = (int) allFromMyProjects.stream()
                                .filter(r -> r.getStatus() == RequestStatus.APPROVED).count();
                int rejected = (int) allFromMyProjects.stream()
                                .filter(r -> r.getStatus() == RequestStatus.REJECTED).count();

                return ManagerDashboardDTO.builder()
                                .activeProjects(activeProjects)
                                .completedProjects(completedProjects)
                                .totalProjects(myProjects.size())
                                .pendingRequests(pendingFromMyProjects.size())
                                .approvedRequests(approved)
                                .rejectedRequests(rejected)
                                .assignedEngineers(assignedTeamMembers) // Now counts all team assignments
                                .availableEngineers(availableEngineers.size())
                                .build();
        }
}
