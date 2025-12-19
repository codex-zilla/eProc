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
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final MaterialRequestRepository materialRequestRepository;

    /**
     * Get dashboard statistics for an engineer.
     */
    @Transactional(readOnly = true)
    public EngineerDashboardDTO getEngineerDashboard(String email) {
        User engineer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Find engineer's assigned active project
        List<Project> assignedProjects = projectRepository.findByEngineerIdAndStatus(
                engineer.getId(), ProjectStatus.ACTIVE).stream().toList();

        EngineerDashboardDTO.EngineerDashboardDTOBuilder builder = EngineerDashboardDTO.builder();

        if (!assignedProjects.isEmpty()) {
            Project project = assignedProjects.get(0);
            builder.assignedProjectId(project.getId())
                    .assignedProjectName(project.getName())
                    .projectStatus(project.getStatus().name());

            if (project.getBoss() != null) {
                builder.bossName(project.getBoss().getName())
                        .bossEmail(project.getBoss().getEmail());
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
     * Get dashboard statistics for a project manager.
     */
    @Transactional(readOnly = true)
    public ManagerDashboardDTO getManagerDashboard(String email) {
        User manager = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Get projects owned by this manager
        List<Project> myProjects = projectRepository.findByBossId(manager.getId());

        int activeProjects = (int) myProjects.stream()
                .filter(p -> p.getStatus() == ProjectStatus.ACTIVE).count();
        int completedProjects = (int) myProjects.stream()
                .filter(p -> p.getStatus() == ProjectStatus.COMPLETED).count();

        // Get engineers assigned to my projects
        int assignedEngineers = (int) myProjects.stream()
                .filter(p -> p.getEngineer() != null && p.getStatus() == ProjectStatus.ACTIVE)
                .count();

        // Get available engineers
        List<User> availableEngineers = userRepository.findAvailableEngineers();

        // Get pending requests from my projects
        List<MaterialRequest> pendingFromMyProjects = materialRequestRepository
                .findByProjectBossIdAndStatus(manager.getId(), RequestStatus.PENDING);

        // Get all requests from my projects for stats
        List<MaterialRequest> allFromMyProjects = materialRequestRepository
                .findByProjectBossId(manager.getId());

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
                .assignedEngineers(assignedEngineers)
                .availableEngineers(availableEngineers.size())
                .build();
    }
}
