package com.novello.catalog.service;

import com.novello.catalog.dto.BookDto;
import com.novello.catalog.dto.BookRequest;
import com.novello.catalog.entity.Book;
import com.novello.catalog.entity.BookType;
import com.novello.catalog.entity.Category;
import com.novello.catalog.repository.BookRepository;
import com.novello.catalog.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;

    @Cacheable(value = "books", key = "#page + '-' + #size")
    public Page<BookDto> getAllBooks(int page, int size) {
        return bookRepository.findByAvailableTrue(PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(this::toDto);
    }

    public Page<BookDto> getBooksByCategory(Long categoryId, int page, int size) {
        return bookRepository.findByCategoryIdAndAvailableTrue(categoryId, PageRequest.of(page, size))
                .map(this::toDto);
    }

    public Page<BookDto> searchBooks(String keyword, int page, int size) {
        return bookRepository.searchBooks(keyword, PageRequest.of(page, size))
                .map(this::toDto);
    }

    public Page<BookDto> getBooksByType(String type, int page, int size) {
        BookType bookType = BookType.valueOf(type.toUpperCase());
        return bookRepository.findByBookTypeAndAvailableTrue(bookType, PageRequest.of(page, size))
                .map(this::toDto);
    }

    public BookDto getBookById(Long id) {
        return toDto(bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found: " + id)));
    }

    @Cacheable("featured-books")
    public List<BookDto> getFeaturedBooks() {
        return bookRepository.findTop8ByAvailableTrueOrderByCreatedAtDesc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Cacheable("top-rated-books")
    public List<BookDto> getTopRatedBooks() {
        return bookRepository.findTop8ByAvailableTrueOrderByRatingDesc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @CacheEvict(value = {"books", "featured-books", "top-rated-books"}, allEntries = true)
    public BookDto createBook(BookRequest request) {
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
        }
        Book book = Book.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .description(request.getDescription())
                .isbn(request.getIsbn())
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice())
                .coverImageUrl(request.getCoverImageUrl())
                .publisher(request.getPublisher())
                .publicationYear(request.getPublicationYear())
                .language(request.getLanguage())
                .pages(request.getPages())
                .bookType(request.getBookType() != null ? request.getBookType() : com.novello.catalog.entity.BookType.HARDCOPY)
                .category(category)
                .available(true)
                .build();
        return toDto(bookRepository.save(book));
    }

    @CacheEvict(value = {"books", "featured-books", "top-rated-books"}, allEntries = true)
    public BookDto updateBook(Long id, BookRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found: " + id));
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setDescription(request.getDescription());
        book.setIsbn(request.getIsbn());
        book.setPrice(request.getPrice());
        book.setOriginalPrice(request.getOriginalPrice());
        book.setCoverImageUrl(request.getCoverImageUrl());
        book.setPublisher(request.getPublisher());
        book.setPublicationYear(request.getPublicationYear());
        book.setLanguage(request.getLanguage());
        book.setPages(request.getPages());
        if (request.getBookType() != null) book.setBookType(request.getBookType());
        if (request.getCategoryId() != null) {
            book.setCategory(categoryRepository.findById(request.getCategoryId()).orElse(null));
        }
        return toDto(bookRepository.save(book));
    }

    @CacheEvict(value = {"books", "featured-books", "top-rated-books"}, allEntries = true)
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found: " + id));
        book.setAvailable(false);
        bookRepository.save(book);
    }

    private BookDto toDto(Book book) {
        BookDto dto = new BookDto();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setDescription(book.getDescription());
        dto.setIsbn(book.getIsbn());
        dto.setPrice(book.getPrice());
        dto.setOriginalPrice(book.getOriginalPrice());
        dto.setCoverImageUrl(book.getCoverImageUrl());
        dto.setPublisher(book.getPublisher());
        dto.setPublicationYear(book.getPublicationYear());
        dto.setLanguage(book.getLanguage());
        dto.setPages(book.getPages());
        dto.setBookType(book.getBookType());
        dto.setAvailable(book.isAvailable());
        dto.setRating(book.getRating());
        dto.setReviewCount(book.getReviewCount());
        dto.setCreatedAt(book.getCreatedAt());
        if (book.getCategory() != null) {
            dto.setCategoryId(book.getCategory().getId());
            dto.setCategoryName(book.getCategory().getName());
        }
        return dto;
    }
}
