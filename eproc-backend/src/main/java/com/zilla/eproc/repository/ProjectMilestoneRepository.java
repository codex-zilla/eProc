package com.zilla.eproc.repository;

import com.zilla.eproc.model.MilestoneStatus;
import com.zilla.eproc.model.ProjectMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProjectMilestoneRepository extends JpaRepository<ProjectMilestone, Long> {

    /**
     * Find all milestones for a project.
     */
    List<ProjectMilestone> findByProjectIdOrderByDeadlineAsc(Long projectId);

    /**
     * Find milestones by status.
     */
    List<ProjectMilestone> findByProjectIdAndStatus(Long projectId, MilestoneStatus status);

    /**
     * Find overdue milestones (deadline passed but not completed).
     */
    @Query("SELECT m FROM ProjectMilestone m WHERE m.project.id = :projectId AND m.deadline < :today AND m.status != 'COMPLETED'")
    List<ProjectMilestone> findOverdueMilestones(@Param("projectId") Long projectId, @Param("today") LocalDate today);

    /**
     * Find upcoming milestones within a certain number of days.
     */
    @Query("SELECT m FROM ProjectMilestone m WHERE m.project.id = :projectId AND m.deadline BETWEEN :today AND :endDate AND m.status != 'COMPLETED' ORDER BY m.deadline ASC")
    List<ProjectMilestone> findUpcomingMilestones(
            @Param("projectId") Long projectId,
            @Param("today") LocalDate today,
            @Param("endDate") LocalDate endDate);
}
