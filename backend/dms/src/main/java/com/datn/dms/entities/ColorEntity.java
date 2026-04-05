package com.datn.dms.entities;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "colors")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ColorEntity extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String name;

    String hexCode;

    @Column(columnDefinition = "boolean default false")
    boolean isDeleted = false;

    Integer position;

    @Builder.Default
    @OneToMany(mappedBy = "color")
    List<FileEntity> files = new ArrayList<>();
}
