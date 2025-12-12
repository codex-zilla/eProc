package com.example.eproc_backend.repository;

import com.example.eproc_backend.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByIsActiveTrue();

    List<Material> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
}
