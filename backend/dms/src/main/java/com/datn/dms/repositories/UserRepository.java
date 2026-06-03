package com.datn.dms.repositories;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.datn.dms.entities.UserEntity;

@Repository
public interface UserRepository extends JpaRepository<UserEntity,  Long> {
    Optional<UserEntity> findByUsername(String username);
    Optional<UserEntity> findByEmail(String email);
    List<UserEntity> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(String username, String email);
    List<UserEntity> findAllByUsernameIn(List<String> usernames);
    
    @Query("SELECT DISTINCT u FROM UserEntity u LEFT JOIN u.roles r WHERE (:role IS NULL OR r.name = :role) AND (:isActive IS NULL OR u.isActive = :isActive)")
    List<UserEntity> filterUsers(@Param("role") String role, @Param("isActive") Boolean isActive);
    
    List<UserEntity> findByIsDeletedTrue();

    List<UserEntity> findAllByIsDeletedFalse();

    long countByRoles_Name(String roleName);
    
    long countByIsDeletedTrue();

    long countByIsActiveTrueAndIsDeletedFalse();

    long countByIsActiveFalseAndIsDeletedFalse();

    long countByRoles_NameAndIsDeletedFalse(String roleName);

    List<UserEntity> findByCreatedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);

    @Query(value = "SELECT * FROM ( " +
                   "  SELECT u.id as userId, u.username as username, u.email as email, u.thumbnail_url as thumbnailUrl, u.last_login as lastActiveAt, " +
                   "  (SELECT COUNT(f.id) FROM files f WHERE f.owner_id = u.id AND f.is_deleted = false) as uploadedDocuments, " +
                   "  (SELECT COUNT(s.id) FROM summaries s WHERE s.user_id = u.id) as summaryCount " +
                   "  FROM users u " +
                   ") as stats " +
                   "WHERE uploadedDocuments > 0 OR summaryCount > 0 " +
                   "ORDER BY summaryCount DESC, uploadedDocuments DESC " +
                   "LIMIT :limit", nativeQuery = true)
    List<com.datn.dms.dtos.statistics.response.TopActiveUserProjection> getTopActiveUsers(@Param("limit") int limit);

    @Query(value = "SELECT * FROM ( " +
                   "  SELECT u.id as id, 'USER_REGISTERED' as type, CONCAT('Người dùng ', u.username, ' vừa đăng ký') as title, 'SUCCESS' as status, u.created_at as createdAt FROM users u " +
                   "  UNION ALL " +
                   "  SELECT f.id as id, 'DOCUMENT_UPLOADED' as type, CONCAT('Tài liệu \"', f.name, '\" được tải lên') as title, 'SUCCESS' as status, f.created_at as createdAt FROM files f " +
                   "  UNION ALL " +
                   "  SELECT s.id as id, " +
                   "    CASE WHEN s.status = 'SUCCESS' THEN 'SUMMARY_COMPLETED' WHEN s.status = 'FAILED' THEN 'SUMMARY_FAILED' ELSE 'DOCUMENT_PROCESSING' END as type, " +
                   "    CASE WHEN s.status = 'SUCCESS' THEN CONCAT('Tài liệu \"', COALESCE(f.name, 'trực tiếp'), '\" đã tóm tắt thành công') WHEN s.status = 'FAILED' THEN CONCAT('Tóm tắt tài liệu \"', COALESCE(f.name, 'trực tiếp'), '\" thất bại') ELSE CONCAT('Đang tóm tắt tài liệu \"', COALESCE(f.name, 'trực tiếp'), '\"') END as title, " +
                   "    CASE WHEN s.status = 'SUCCESS' THEN 'SUCCESS' WHEN s.status = 'FAILED' THEN 'ERROR' ELSE 'WARNING' END as status, " +
                   "    s.created_at as createdAt FROM summaries s LEFT JOIN files f ON s.file_id = f.id " +
                   ") as activities ORDER BY createdAt DESC LIMIT :limit", nativeQuery = true)
    List<com.datn.dms.dtos.statistics.response.RecentActivityProjection> getRecentActivities(@Param("limit") int limit);

    Optional<UserEntity> findFirstByCountryIsNotNullOrderByCreatedAtDesc();

    @Query("SELECT COUNT(DISTINCT u.country.id) FROM UserEntity u WHERE u.country IS NOT NULL")
    long countDistinctCountryUsedByUsers();
}
