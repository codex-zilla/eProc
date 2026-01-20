package com.zilla.eproc.repository;

import com.zilla.eproc.model.ProjectScope;
import com.zilla.eproc.model.ScopeCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectScopeRepository extends JpaRepository<ProjectScope, Long> {

    /**
     * Find all scopes for a project.
     */
    List<ProjectScope> findByProjectId(Long projectId);

    /**
     * Find included scopes only.
     */
    List<ProjectScope> findByProjectIdAndIsIncludedTrue(Long projectId);

    /**
     * Find scope by project and category.
     */
    Optional<ProjectScope> findByProjectIdAndCategory(Long projectId, ScopeCategory category);
}
