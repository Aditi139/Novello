package com.novello.catalog.dto;

import com.novello.catalog.entity.BookType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BookRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String author;
    private String description;
    @NotBlank
    private String isbn;
    @NotNull @Positive
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String coverImageUrl;
    private String publisher;
    private Integer publicationYear;
    private String language;
    private Integer pages;
    private BookType bookType;
    private Long categoryId;
}
