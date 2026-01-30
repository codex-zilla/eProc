package com.zilla.eproc.repository;

import com.zilla.eproc.model.Project;
import com.zilla.eproc.model.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByIsActiveTrue();

    /**
     * Find all projects owned by a specific owner.
     */
    List<Project> findByOwnerId(Long ownerId);

    /**
     * Find projects by owner and status.
     */
    List<Project> findByOwnerIdAndStatus(Long ownerId, ProjectStatus status);

    /**
     * Find active projects owned by an owner with isActive=true.
     */
    List<Project> findByOwnerIdAndIsActiveTrue(Long ownerId);
}
