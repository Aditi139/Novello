package com.novello.ebook.repository;

import com.novello.ebook.entity.Ebook;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EbookRepository extends JpaRepository<Ebook, Long> {
    Optional<Ebook> findByBookId(Long bookId);
}
