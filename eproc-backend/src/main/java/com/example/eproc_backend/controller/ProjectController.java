package com.example.eproc_backend.controller;

import com.example.eproc_backend.dto.ProjectDTO;
import com.example.eproc_backend.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProjectDTO>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @PostMapping
    @PreAuthorize("hasRole('PROJECT_MANAGER')")
    public ResponseEntity<ProjectDTO> createProject(@RequestBody ProjectDTO dto) {
        return ResponseEntity.ok(projectService.createProject(dto));
    }
}
