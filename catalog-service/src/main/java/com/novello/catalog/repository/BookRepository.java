package com.novello.catalog.repository;

import com.novello.catalog.entity.Book;
import com.novello.catalog.entity.BookType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    Optional<Book> findByIsbn(String isbn);

    Page<Book> findByAvailableTrue(Pageable pageable);

    Page<Book> findByCategoryIdAndAvailableTrue(Long categoryId, Pageable pageable);

    @Query("SELECT b FROM Book b WHERE b.available = true AND " +
           "(LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.isbn) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Book> searchBooks(String keyword, Pageable pageable);

    Page<Book> findByBookTypeAndAvailableTrue(BookType bookType, Pageable pageable);

    List<Book> findTop8ByAvailableTrueOrderByCreatedAtDesc();

    List<Book> findTop8ByAvailableTrueOrderByRatingDesc();

    boolean existsByIsbn(String isbn);
}
