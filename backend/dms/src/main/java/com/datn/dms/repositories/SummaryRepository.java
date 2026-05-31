package com.datn.dms.repositories;

import com.datn.dms.entities.SummaryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SummaryRepository extends JpaRepository<SummaryEntity, Long> {
}
