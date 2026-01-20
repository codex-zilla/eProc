package com.zilla.eproc.repository;

import com.zilla.eproc.model.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SiteRepository extends JpaRepository<Site, Long> {
    List<Site> findByProjectIdAndIsActiveTrue(Long projectId);

    List<Site> findByIsActiveTrue();

    List<Site> findByProjectEngineerIdAndIsActiveTrue(Long engineerId);

    List<Site> findByProjectBossIdAndIsActiveTrue(Long bossId);
}
