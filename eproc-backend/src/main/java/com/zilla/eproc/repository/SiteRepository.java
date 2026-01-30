package com.zilla.eproc.repository;

import com.zilla.eproc.model.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SiteRepository extends JpaRepository<Site, Long> {
    List<Site> findByProjectIdAndIsActiveTrue(Long projectId);

    List<Site> findByIsActiveTrue();

    /**
     * Find sites for projects owned by a specific owner.
     */
    List<Site> findByProjectOwnerIdAndIsActiveTrue(Long ownerId);

    /**
     * Find sites for projects where a user has an active assignment.
     */
    @Query("SELECT s FROM Site s WHERE s.isActive = true AND EXISTS " +
            "(SELECT 1 FROM ProjectAssignment pa WHERE pa.project = s.project AND pa.user.id = :userId AND pa.isActive = true)")
    List<Site> findByUserAssignmentAndIsActiveTrue(@Param("userId") Long userId);
}
