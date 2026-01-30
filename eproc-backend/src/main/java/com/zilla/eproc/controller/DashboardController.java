package com.zilla.eproc.controller;

import com.zilla.eproc.dto.EngineerDashboardDTO;
import com.zilla.eproc.dto.ManagerDashboardDTO;
import com.zilla.eproc.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for dashboard statistics.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * Get dashboard statistics for an engineer.
     */
    @GetMapping("/engineer")
    @PreAuthorize("hasRole('ENGINEER')")
    public ResponseEntity<EngineerDashboardDTO> getEngineerDashboard(Authentication authentication) {
        String email = authentication.getName();
        EngineerDashboardDTO dashboard = dashboardService.getEngineerDashboard(email);
        return ResponseEntity.ok(dashboard);
    }

    /**
     * Get dashboard statistics for a project owner.
     */
    @GetMapping("/manager")
    @PreAuthorize("hasRole('PROJECT_OWNER')")
    public ResponseEntity<ManagerDashboardDTO> getManagerDashboard(Authentication authentication) {
        String email = authentication.getName();
        ManagerDashboardDTO dashboard = dashboardService.getManagerDashboard(email);
        return ResponseEntity.ok(dashboard);
    }
}
