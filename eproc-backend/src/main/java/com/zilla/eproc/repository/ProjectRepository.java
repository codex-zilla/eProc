package com.zilla.eproc.repository;

import com.zilla.eproc.model.Project;
import com.zilla.eproc.model.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByIsActiveTrue();

    /**
     * Find all projects owned by a specific boss/project manager.
     */
    List<Project> findByBossId(Long bossId);

    /**
     * Find active projects owned by a specific boss.
     */
    List<Project> findByBossIdAndStatus(Long bossId, ProjectStatus status);

    /**
     * Find all projects assigned to a specific engineer.
     */
    List<Project> findByEngineerId(Long engineerId);

    /**
     * Find a project by engineer and status.
     * Used to check if engineer already has an ACTIVE project.
     */
    Optional<Project> findByEngineerIdAndStatus(Long engineerId, ProjectStatus status);

    /**
     * Find active projects owned by a boss with isActive=true.
     */
    List<Project> findByBossIdAndIsActiveTrue(Long bossId);

    /**
     * Find active projects assigned to an engineer with isActive=true.
     */
    List<Project> findByEngineerIdAndIsActiveTrue(Long engineerId);
}
