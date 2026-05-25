package com.novello.ebook.repository;

import com.novello.ebook.entity.DownloadToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DownloadTokenRepository extends JpaRepository<DownloadToken, Long> {
    Optional<DownloadToken> findByToken(String token);
}
