package com.datn.dms.entities;

import java.util.ArrayList;
import java.util.List;

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
@Table(name = "genders")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GenderEntity extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String name;
    String thumbnailUrl;

    @Builder.Default
    @OneToMany(mappedBy = "gender")
    List<UserEntity> users = new ArrayList<>();
}
