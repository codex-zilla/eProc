package com.zilla.eproc.repository;

import com.zilla.eproc.model.DocumentStatus;
import com.zilla.eproc.model.DocumentType;
import com.zilla.eproc.model.ProjectDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectDocumentRepository extends JpaRepository<ProjectDocument, Long> {

    /**
     * Find all documents for a project.
     */
    List<ProjectDocument> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    /**
     * Find documents by type.
     */
    List<ProjectDocument> findByProjectIdAndType(Long projectId, DocumentType type);

    /**
     * Find documents by status.
     */
    List<ProjectDocument> findByProjectIdAndStatus(Long projectId, DocumentStatus status);

    /**
     * Find approved documents only.
     */
    List<ProjectDocument> findByProjectIdAndStatusOrderByCreatedAtDesc(Long projectId, DocumentStatus status);
}
