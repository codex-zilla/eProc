package com.example.eproc_backend.repository;

import com.example.eproc_backend.model.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SiteRepository extends JpaRepository<Site, Long> {
    List<Site> findByProjectIdAndIsActiveTrue(Long projectId);

    List<Site> findByIsActiveTrue();
}
