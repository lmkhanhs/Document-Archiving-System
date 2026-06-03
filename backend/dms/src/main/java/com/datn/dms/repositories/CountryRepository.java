package com.datn.dms.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.datn.dms.entities.CountryEntity;

@Repository
public interface CountryRepository extends JpaRepository<CountryEntity, Long> {
    Optional<CountryEntity> findByName(String name);
    List<CountryEntity> findAllByActiveTrue();
    long countByActiveTrue();
    Optional<CountryEntity> findFirstByOrderByCreatedAtDesc();

    @Query("SELECT c FROM CountryEntity c " +
           "WHERE (:keyword IS NULL OR :keyword = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.code) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<CountryEntity> searchAdminCountries(@Param("keyword") String keyword, Pageable pageable);
}
