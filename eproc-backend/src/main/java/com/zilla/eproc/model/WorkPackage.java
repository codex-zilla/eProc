package com.zilla.eproc.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "work_packages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "site_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Site site;

    @Column(nullable = false)
    private String name;

    private String stage;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}
