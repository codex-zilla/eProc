package com.zilla.eproc.controller;

import com.zilla.eproc.dto.SiteDTO;
import com.zilla.eproc.service.SiteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
public class SiteController {

    private final SiteService siteService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SiteDTO>> getAllSites(Principal principal) {
        return ResponseEntity.ok(siteService.getAllSites(principal.getName()));
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SiteDTO>> getSitesByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(siteService.getSitesByProject(projectId));
    }

    @PostMapping
    @PreAuthorize("hasRole('PROJECT_MANAGER')")
    public ResponseEntity<SiteDTO> createSite(@RequestBody SiteDTO dto) {
        return ResponseEntity.ok(siteService.createSite(dto));
    }
}
