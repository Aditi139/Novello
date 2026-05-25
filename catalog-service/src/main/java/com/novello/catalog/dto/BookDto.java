package com.novello.catalog.dto;

import com.novello.catalog.entity.BookType;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class BookDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String title;
    private String author;
    private String description;
    private String isbn;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String coverImageUrl;
    private String publisher;
    private Integer publicationYear;
    private String language;
    private Integer pages;
    private BookType bookType;
    private Long categoryId;
    private String categoryName;
    private boolean available;
    private double rating;
    private int reviewCount;
    private LocalDateTime createdAt;
}
