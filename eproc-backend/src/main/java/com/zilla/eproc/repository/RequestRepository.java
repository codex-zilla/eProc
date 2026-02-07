package com.zilla.eproc.repository;

import com.zilla.eproc.model.Request;
import com.zilla.eproc.model.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {

    /**
     * Find all requests created by a specific user, ordered by creation date
     * descending.
     */
    List<Request> findByCreatedByIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find all requests created by a specific user (not ordered).
     */
    List<Request> findByCreatedById(Long userId);

    /**
     * Find all requests for a specific project, ordered by creation date
     * descending.
     */
    List<Request> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    /**
     * Find all requests for multiple projects.
     */
    List<Request> findByProjectIdIn(List<Long> projectIds);

    /**
     * Find all requests for a specific site.
     */
    List<Request> findBySiteId(Long siteId);

    /**
     * Check if a BOQ reference code already exists.
     */
    boolean existsByBoqReferenceCode(String boqReferenceCode);

    /**
     * Find all requests by status, ordered by creation date descending.
     */
    List<Request> findByStatusOrderByCreatedAtDesc(RequestStatus status);

    /**
     * Find all pending (SUBMITTED) requests for projects owned by a specific user.
     */
    List<Request> findByStatusAndProjectOwnerIdOrderByCreatedAtDesc(RequestStatus status, Long ownerId);

    /**
     * Find all requests for projects owned by a specific user.
     */
    List<Request> findByProjectOwnerIdOrderByCreatedAtDesc(Long ownerId);
}
