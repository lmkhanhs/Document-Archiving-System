package com.datn.dms.entities;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "summaries")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SummaryEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id")
    FileEntity file;

    @Column(nullable = false, length = 20)
    String summaryType;

    // Nếu người dùng tóm tắt văn bản trực tiếp (TEXT), lưu văn bản gốc vào đây
    @Column(columnDefinition = "TEXT")
    String originalContent;

    @Column(nullable = false)
    String model;

    @Column(nullable = false)
    Integer originalLength;

    @Column(nullable = false)
    Integer summaryLength;

    @Column(nullable = false)
    Double duration;

    @Column(nullable = false, length = 20)
    String status;

    @Column(columnDefinition = "TEXT")
    String summaryContent;
}
