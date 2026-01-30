package com.zilla.eproc.repository;

import com.zilla.eproc.model.ProjectAssignment;
import com.zilla.eproc.model.ProjectRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectAssignmentRepository extends JpaRepository<ProjectAssignment, Long> {

    /**
     * Find all active assignments for a project.
     */
    List<ProjectAssignment> findByProjectIdAndIsActiveTrue(Long projectId);

    /**
     * Find all active assignments for a user.
     */
    List<ProjectAssignment> findByUserIdAndIsActiveTrue(Long userId);

    /**
     * Find a specific assignment by project, user, and role.
     */
    Optional<ProjectAssignment> findByProjectIdAndUserIdAndRole(Long projectId, Long userId, ProjectRole role);

    /**
     * Check if a user has a specific role on a project.
     */
    boolean existsByProjectIdAndUserIdAndRoleAndIsActiveTrue(Long projectId, Long userId, ProjectRole role);

    /**
     * Check if a user has any active assignment on a project.
     */
    boolean existsByProjectIdAndUserIdAndIsActiveTrue(Long projectId, Long userId);

    /**
     * Find users with a specific role on a project.
     */
    @Query("SELECT pa FROM ProjectAssignment pa WHERE pa.project.id = :projectId AND pa.role = :role AND pa.isActive = true")
    List<ProjectAssignment> findByProjectIdAndRole(@Param("projectId") Long projectId, @Param("role") ProjectRole role);

    /**
     * Find a specific active assignment by project and user.
     * Used for authorization checks.
     */
    Optional<ProjectAssignment> findByProjectIdAndUserIdAndIsActiveTrue(Long projectId, Long userId);
}
