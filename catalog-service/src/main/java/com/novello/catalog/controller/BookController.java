package com.novello.catalog.controller;

import com.novello.catalog.dto.BookDto;
import com.novello.catalog.dto.BookRequest;
import com.novello.catalog.service.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookController {

    private final BookService bookService;

    @GetMapping
    public ResponseEntity<Page<BookDto>> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(bookService.getAllBooks(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookDto> getBookById(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getBookById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<BookDto>> searchBooks(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(bookService.searchBooks(keyword, page, size));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Page<BookDto>> getByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(bookService.getBooksByCategory(categoryId, page, size));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<Page<BookDto>> getByType(
            @PathVariable String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(bookService.getBooksByType(type, page, size));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<BookDto>> getFeatured() {
        return ResponseEntity.ok(bookService.getFeaturedBooks());
    }

    @GetMapping("/top-rated")
    public ResponseEntity<List<BookDto>> getTopRated() {
        return ResponseEntity.ok(bookService.getTopRatedBooks());
    }

    @PostMapping
    public ResponseEntity<BookDto> createBook(@Valid @RequestBody BookRequest request) {
        return ResponseEntity.ok(bookService.createBook(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookDto> updateBook(@PathVariable Long id, @Valid @RequestBody BookRequest request) {
        return ResponseEntity.ok(bookService.updateBook(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok().build();
    }
}
