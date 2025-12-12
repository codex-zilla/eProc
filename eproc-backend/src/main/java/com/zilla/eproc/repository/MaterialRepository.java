package com.zilla.eproc.repository;

import com.zilla.eproc.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByIsActiveTrue();

    List<Material> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
}
