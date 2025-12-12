package com.example.eproc_backend.controller;

import com.example.eproc_backend.dto.MaterialDTO;
import com.example.eproc_backend.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MaterialDTO>> getAllMaterials() {
        return ResponseEntity.ok(materialService.getAllMaterials());
    }

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MaterialDTO>> searchMaterials(@RequestParam String q) {
        return ResponseEntity.ok(materialService.searchMaterials(q));
    }
}
