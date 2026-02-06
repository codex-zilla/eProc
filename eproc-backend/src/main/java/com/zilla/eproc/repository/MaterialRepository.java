package com.zilla.eproc.repository;

import com.zilla.eproc.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {

    /**
     * Find all materials by request ID.
     */
    List<Material> findByRequestId(Long requestId);

    /**
     * Find all materials by request ID ordered by resource type and name.
     */
    List<Material> findByRequestIdOrderByResourceTypeAscNameAsc(Long requestId);
}
