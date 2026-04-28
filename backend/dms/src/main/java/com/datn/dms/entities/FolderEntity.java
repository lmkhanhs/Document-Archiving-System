package com.datn.dms.entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "folders")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FolderEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false)
    String name;

    @Column(length = 1000)
    String path;

    // Thư mục cha (Hierarchy Pattern) - null nếu là thư mục gốc
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    FolderEntity parent;

    // Danh sách các thư mục con
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    List<FolderEntity> subFolders = new ArrayList<>();

    // Người dùng sở hữu / tạo ra thư mục này
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    UserEntity owner;

    @Column(columnDefinition = "boolean default false")
    boolean isDeleted = false;

    LocalDateTime deletedAt;

    @Builder.Default
    @OneToMany(mappedBy = "folder", cascade = CascadeType.ALL, orphanRemoval = true)
    List<FileEntity> files = new ArrayList<>();
}
