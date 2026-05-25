package com.novello.catalog.config;

import com.novello.catalog.entity.Book;
import com.novello.catalog.entity.BookType;
import com.novello.catalog.entity.Category;
import com.novello.catalog.repository.BookRepository;
import com.novello.catalog.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;

    @Override
    public void run(String... args) {
        seedCategories();
        seedBooks();
    }

    private void seedCategories() {
        if (categoryRepository.count() > 0) return;
        log.info("Seeding categories...");

        List<Category> categories = List.of(
            Category.builder().name("Fiction").description("Fiction and literary novels").build(),
            Category.builder().name("Non-Fiction").description("Educational and informative books").build(),
            Category.builder().name("Science & Technology").description("Tech, science and engineering books").build(),
            Category.builder().name("Business").description("Business, economics and management").build(),
            Category.builder().name("Self Help").description("Personal development and wellness").build(),
            Category.builder().name("History").description("Historical accounts and biographies").build(),
            Category.builder().name("Comics & Manga").description("Graphic novels and manga").build(),
            Category.builder().name("Children").description("Books for young readers").build()
        );
        categoryRepository.saveAll(categories);
        log.info("Seeded {} categories.", categories.size());
    }

    private void seedBooks() {
        log.info("Checking, updating, and seeding sample books...");

        Category fiction = categoryRepository.findByName("Fiction").orElse(null);
        Category scifi = categoryRepository.findByName("Science & Technology").orElse(null);
        Category business = categoryRepository.findByName("Business").orElse(null);
        Category selfHelp = categoryRepository.findByName("Self Help").orElse(null);
        Category history = categoryRepository.findByName("History").orElse(null);
        Category nonFiction = categoryRepository.findByName("Non-Fiction").orElse(null);
        Category comics = categoryRepository.findByName("Comics & Manga").orElse(null);
        Category children = categoryRepository.findByName("Children").orElse(null);

        List<Book> books = List.of(
            Book.builder()
                .title("The Great Gatsby")
                .author("F. Scott Fitzgerald")
                .description("A story of the mysteriously wealthy Jay Gatsby and his love for Daisy Buchanan.")
                .isbn("9780743273565")
                .price(new BigDecimal("299.00"))
                .originalPrice(new BigDecimal("399.00"))
                .coverImageUrl("https://images-na.ssl-images-amazon.com/images/P/0743273567.01.LZZZZZZZ.jpg")
                .publisher("Scribner")
                .publicationYear(1925)
                .language("English")
                .pages(180)
                .bookType(BookType.BOTH)
                .available(true)
                .rating(4.3)
                .reviewCount(1842)
                .category(fiction)
                .build(),

            Book.builder()
                .title("Atomic Habits")
                .author("James Clear")
                .description("An Easy & Proven Way to Build Good Habits & Break Bad Ones. Tiny changes, remarkable results.")
                .isbn("9780735211292")
                .price(new BigDecimal("399.00"))
                .originalPrice(new BigDecimal("599.00"))
                .coverImageUrl("https://images-na.ssl-images-amazon.com/images/P/0735211299.01.LZZZZZZZ.jpg")
                .publisher("Avery")
                .publicationYear(2018)
                .language("English")
                .pages(320)
                .bookType(BookType.BOTH)
                .available(true)
                .rating(4.8)
                .reviewCount(5621)
                .category(selfHelp)
                .build(),

            Book.builder()
                .title("The Alchemist")
                .author("Paulo Coelho")
                .description("A magical story about following your dreams and listening to your heart.")
                .isbn("9780062315007")
                .price(new BigDecimal("249.00"))
                .originalPrice(new BigDecimal("349.00"))
                .coverImageUrl("https://images-na.ssl-images-amazon.com/images/P/0062315005.01.LZZZZZZZ.jpg")
                .publisher("HarperCollins")
                .publicationYear(1988)
                .language("English")
                .pages(208)
                .bookType(BookType.BOTH)
                .available(true)
                .rating(4.7)
                .reviewCount(9823)
                .category(fiction)
                .build(),

            Book.builder()
                .title("Clean Code")
                .author("Robert C. Martin")
                .description("A Handbook of Agile Software Craftsmanship. Essential for every developer.")
                .isbn("9780132350884")
                .price(new BigDecimal("649.00"))
                .originalPrice(new BigDecimal("899.00"))
                .coverImageUrl("https://images-na.ssl-images-amazon.com/images/P/0132350882.01.LZZZZZZZ.jpg")
                .publisher("Prentice Hall")
                .publicationYear(2008)
                .language("English")
                .pages(464)
                .bookType(BookType.EBOOK)
                .available(true)
                .rating(4.5)
                .reviewCount(3210)
                .category(scifi)
                .build(),

            Book.builder()
                .title("Think and Grow Rich")
                .author("Napoleon Hill")
                .description("The landmark bestseller now revised and updated for the 21st century.")
                .isbn("9781585424337")
                .price(new BigDecimal("199.00"))
                .originalPrice(new BigDecimal("299.00"))
                .coverImageUrl("https://images-na.ssl-images-amazon.com/images/P/1585424331.01.LZZZZZZZ.jpg")
                .publisher("TarcherPerigee")
                .publicationYear(1937)
                .language("English")
                .pages(320)
                .bookType(BookType.BOTH)
                .available(true)
                .rating(4.4)
                .reviewCount(7234)
                .category(selfHelp)
                .build(),

            Book.builder()
                .title("Harry Potter and the Sorcerer's Stone")
                .author("J.K. Rowling")
                .description("The start of the beloved Harry Potter series. A young wizard discovers his magical heritage.")
                .isbn("9780439708180")
                .price(new BigDecimal("349.00"))
                .originalPrice(new BigDecimal("449.00"))
                .coverImageUrl("https://images-na.ssl-images-amazon.com/images/P/0439708184.01.LZZZZZZZ.jpg")
                .publisher("Scholastic")
                .publicationYear(1997)
                .language("English")
                .pages(309)
                .bookType(BookType.HARDCOPY)
                .available(true)
                .rating(4.9)
                .reviewCount(15234)
                .category(fiction)
                .build(),

            Book.builder()
                .title("Sapiens: A Brief History of Humankind")
                .author("Yuval Noah Harari")
                .description("From the Stone Age to the twenty-first century — the story of humanity.")
                .isbn("9780062316097")
                .price(new BigDecimal("499.00"))
                .originalPrice(new BigDecimal("699.00"))
                .coverImageUrl("https://images-na.ssl-images-amazon.com/images/P/0062316095.01.LZZZZZZZ.jpg")
                .publisher("HarperCollins")
                .publicationYear(2011)
                .language("English")
                .pages(443)
                .bookType(BookType.BOTH)
                .available(true)
                .rating(4.6)
                .reviewCount(8920)
                .category(history)
                .build(),

            Book.builder()
                .title("The Lean Startup")
                .author("Eric Ries")
                .description("How constant innovation creates radically successful businesses.")
                .isbn("9780307887894")
                .price(new BigDecimal("449.00"))
                .originalPrice(new BigDecimal("599.00"))
                .coverImageUrl("https://images-na.ssl-images-amazon.com/images/P/0307887898.01.LZZZZZZZ.jpg")
                .publisher("Crown Business")
                .publicationYear(2011)
                .language("English")
                .pages(336)
                .bookType(BookType.BOTH)
                .available(true)
                .rating(4.3)
                .reviewCount(4521)
                .category(business)
                .build(),

            Book.builder()
                .title("To Kill a Mockingbird")
                .author("Harper Lee")
                .description("The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.")
                .isbn("9780061120084")
                .price(new BigDecimal("299.00"))
                .originalPrice(new BigDecimal("399.00"))
                .coverImageUrl("https://images-na.ssl-images-amazon.com/images/P/0061120081.01.LZZZZZZZ.jpg")
                .publisher("Harper Perennial Modern Classics")
                .publicationYear(2006)
                .language("English")
                .pages(324)
                .bookType(BookType.BOTH)
                .available(true)
                .rating(4.8)
                .reviewCount(14500)
                .category(fiction)
                .build(),

            Book.builder()
                .title("The Hobbit")
                .author("J.R.R. Tolkien")
                .description("A great modern classic and the prelude to The Lord of the Rings.")
                .isbn("9780547928227")
                .price(new BigDecimal("349.00"))
                .originalPrice(new BigDecimal("499.00"))
                .coverImageUrl("https://images-na.ssl-images-amazon.com/images/P/054792822X.01.LZZZZZZZ.jpg")
                .publisher("Mariner Books")
                .publicationYear(2012)
                .language("English")
                .pages(366)
                .bookType(BookType.BOTH)
                .available(true)
                .rating(4.7)
                .reviewCount(9230)
                .category(fiction)
                .build(),

            Book.builder()
                .title("A Brief History of Time")
                .author("Stephen Hawking")
                .description("Stephen Hawking's classic book on cosmology, explaining complex physics concepts to general readers.")
                .isbn("9780553380163")
                .price(new BigDecimal("399.00"))
                .originalPrice(new BigDecimal("599.00"))
                .coverImageUrl("https://images-na.ssl-images-amazon.com/images/P/0553380168.01.LZZZZZZZ.jpg")
                .publisher("Bantam")
                .publicationYear(1998)
                .language("English")
                .pages(212)
                .bookType(BookType.BOTH)
                .available(true)
                .rating(4.6)
                .reviewCount(5120)
                .category(scifi)
                .build(),

            Book.builder()
                .title("Rich Dad Poor Dad")
                .author("Robert T. Kiyosaki")
                .description("What the rich teach their kids about money that the poor and middle class do not!")
                .isbn("9781612680194")
                .price(new BigDecimal("249.00"))
                .originalPrice(new BigDecimal("349.00"))
                .coverImageUrl("https://images-na.ssl-images-amazon.com/images/P/1612680194.01.LZZZZZZZ.jpg")
                .publisher("Plata Publishing")
                .publicationYear(2017)
                .language("English")
                .pages(336)
                .bookType(BookType.BOTH)
                .available(true)
                .rating(4.7)
                .reviewCount(11200)
                .category(business)
                .build(),

            Book.builder()
                .title("Educated")
                .author("Tara Westover")
                .description("An unforgettable memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.")
                .isbn("9780399588174")
                .price(new BigDecimal("399.00"))
                .originalPrice(new BigDecimal("499.00"))
                .coverImageUrl("https://covers.openlibrary.org/b/isbn/9780399588174-L.jpg")
                .publisher("Random House")
                .publicationYear(2018)
                .language("English")
                .pages(352)
                .bookType(BookType.BOTH)
                .available(true)
                .rating(4.7)
                .reviewCount(8340)
                .category(nonFiction)
                .build(),

            // Additional Non-Fiction books
            Book.builder()
                .title("The Psychology of Money")
                .author("Morgan Housel")
                .description("Timeless lessons on wealth, greed, and happiness. Doing well with money isn't necessarily about what you know — it's about how you behave.")
                .isbn("9780857197689")
                .price(new BigDecimal("349.00"))
                .originalPrice(new BigDecimal("499.00"))
                .coverImageUrl("https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg")
                .publisher("Harriman House")
                .publicationYear(2020)
                .language("English")
                .pages(256)
                .bookType(BookType.BOTH)
                .available(true)
                .rating(4.7)
                .reviewCount(9820)
                .category(nonFiction)
                .build(),

            Book.builder()
                .title("Thinking, Fast and Slow")
                .author("Daniel Kahneman")
                .description("Nobel laureate Daniel Kahneman's groundbreaking exploration of the two systems that drive the way we think — and how they shape our judgments and decisions.")
                .isbn("9780374533557")
                .price(new BigDecimal("449.00"))
                .originalPrice(new BigDecimal("599.00"))
                .coverImageUrl("https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg")
                .publisher("Farrar, Straus and Giroux")
                .publicationYear(2013)
                .language("English")
                .pages(499)
                .bookType(BookType.BOTH)
                .available(true)
                .rating(4.6)
                .reviewCount(14300)
                .category(nonFiction)
                .build(),

            Book.builder()
                .title("Ikigai: The Japanese Secret to a Long and Happy Life")
                .author("Héctor García & Francesc Miralles")
                .description("Ikigai is the Japanese concept of finding your reason for being — the intersection of what you love, what you're good at, what the world needs, and what you can be paid for.")
                .isbn("9780143130727")
                .price(new BigDecimal("299.00"))
                .originalPrice(new BigDecimal("399.00"))
                .coverImageUrl("https://covers.openlibrary.org/b/isbn/9780143130727-L.jpg")
                .publisher("Penguin Books")
                .publicationYear(2017)
                .language("English")
                .pages(208)
                .bookType(BookType.BOTH)
                .available(true)
                .rating(4.5)
                .reviewCount(11740)
                .category(nonFiction)
                .build(),

            Book.builder()
                .title("Man's Search for Meaning")
                .author("Viktor E. Frankl")
                .description("A profound and enduring work — psychiatrist Viktor Frankl's memoir of life in Nazi death camps and his discovery of logotherapy, finding purpose as the primary human drive.")
                .isbn("9780807014271")
                .price(new BigDecimal("249.00"))
                .originalPrice(new BigDecimal("349.00"))
                .coverImageUrl("https://covers.openlibrary.org/b/isbn/9780807014271-L.jpg")
                .publisher("Beacon Press")
                .publicationYear(2006)
                .language("English")
                .pages(165)
                .bookType(BookType.BOTH)
                .available(true)
                .rating(4.8)
                .reviewCount(18600)
                .category(nonFiction)
                .build(),

            Book.builder()
                .title("Becoming")
                .author("Michelle Obama")
                .description("In her memoir, former First Lady Michelle Obama invites readers into her world with candor and grace — from her childhood in Chicago to the White House and beyond.")
                .isbn("9781524763138")
                .price(new BigDecimal("499.00"))
                .originalPrice(new BigDecimal("699.00"))
                .coverImageUrl("https://covers.openlibrary.org/b/isbn/9781524763138-L.jpg")
                .publisher("Crown")
                .publicationYear(2018)
                .language("English")
                .pages(448)
                .bookType(BookType.BOTH)
                .available(true)
                .rating(4.8)
                .reviewCount(21500)
                .category(nonFiction)
                .build(),

            Book.builder()
                .title("Good to Great")
                .author("Jim Collins")
                .description("Jim Collins and his research team identify how average companies transition to greatness, and why others fail.")
                .isbn("9780066620992")
                .price(new BigDecimal("399.00"))
                .originalPrice(new BigDecimal("599.00"))
                .coverImageUrl("https://images-na.ssl-images-amazon.com/images/P/0066620996.01.LZZZZZZZ.jpg")
                .publisher("HarperBusiness")
                .publicationYear(2001)
                .language("English")
                .pages(320)
                .bookType(BookType.BOTH)
                .available(true)
                .rating(4.5)
                .reviewCount(7120)
                .category(business)
                .build(),

            Book.builder()
                .title("Zero to One")
                .author("Peter Thiel")
                .description("Notes on Startups, or How to Build the Future. Zero to One presents at once an optimistic view of the future of progress in America and a new way of thinking about innovation.")
                .isbn("9780804139298")
                .price(new BigDecimal("349.00"))
                .originalPrice(new BigDecimal("499.00"))
                .coverImageUrl("https://images-na.ssl-images-amazon.com/images/P/0804139296.01.LZZZZZZZ.jpg")
                .publisher("Crown Business")
                .publicationYear(2014)
                .language("English")
                .pages(224)
                .bookType(BookType.BOTH)
                .available(true)
                .rating(4.6)
                .reviewCount(8400)
                .category(business)
                .build(),

            Book.builder()
                .title("The Intelligent Investor")
                .author("Benjamin Graham")
                .description("The greatest investment advisor of the twentieth century, Benjamin Graham, taught and inspired people worldwide.")
                .isbn("9780060555665")
                .price(new BigDecimal("449.00"))
                .originalPrice(new BigDecimal("599.00"))
                .coverImageUrl("https://images-na.ssl-images-amazon.com/images/P/0060555661.01.LZZZZZZZ.jpg")
                .publisher("Harper Business")
                .publicationYear(2003)
                .language("English")
                .pages(640)
                .bookType(BookType.BOTH)
                .available(true)
                .rating(4.7)
                .reviewCount(12500)
                .category(business)
                .build(),

            // Comics & Manga Category
            Book.builder()
                .title("Naruto, Vol. 1")
                .author("Masashi Kishimoto")
                .description("In the Village Hidden in the Leaves, ninja training is a way of life. Naruto Uzumaki has a great dream: to become Hokage!")
                .isbn("9781591161783")
                .price(new BigDecimal("299.00"))
                .originalPrice(new BigDecimal("399.00"))
                .coverImageUrl("https://images-na.ssl-images-amazon.com/images/P/1591161789.01.LZZZZZZZ.jpg")
                .publisher("VIZ Media LLC")
                .publicationYear(2003)
                .language("English")
                .pages(192)
                .bookType(BookType.BOTH)
                .available(true)
                .rating(4.8)
                .reviewCount(14500)
                .category(comics)
                .build(),

            Book.builder()
                .title("Attack on Titan, Vol. 1")
                .author("Hajime Isayama")
                .description("Humanity has been forced to live inside walls to escape the giant, man-eating Titans. But now a new Titan appears...")
                .isbn("9781612620244")
                .price(new BigDecimal("349.00"))
                .originalPrice(new BigDecimal("449.00"))
                .coverImageUrl("https://images-na.ssl-images-amazon.com/images/P/1612620248.01.LZZZZZZZ.jpg")
                .publisher("Kodansha Comics")
                .publicationYear(2012)
                .language("English")
                .pages(208)
                .bookType(BookType.BOTH)
                .available(true)
                .rating(4.7)
                .reviewCount(9230)
                .category(comics)
                .build(),

            // Children Category
            Book.builder()
                .title("The Very Hungry Caterpillar")
                .author("Eric Carle")
                .description("The classic story of a caterpillar's journey from egg to beautiful butterfly, featuring lovely colorful designs.")
                .isbn("9780399226908")
                .price(new BigDecimal("199.00"))
                .originalPrice(new BigDecimal("299.00"))
                .coverImageUrl("https://images-na.ssl-images-amazon.com/images/P/0399226907.01.LZZZZZZZ.jpg")
                .publisher("World of Eric Carle")
                .publicationYear(1994)
                .language("English")
                .pages(26)
                .bookType(BookType.BOTH)
                .available(true)
                .rating(4.9)
                .reviewCount(18400)
                .category(children)
                .build(),

            Book.builder()
                .title("Charlotte's Web")
                .author("E.B. White")
                .description("The beloved tale of Charlotte the spider, Wilbur the pig, and their friendship on the farm.")
                .isbn("9780064400558")
                .price(new BigDecimal("249.00"))
                .originalPrice(new BigDecimal("349.00"))
                .coverImageUrl("https://images-na.ssl-images-amazon.com/images/P/0064400557.01.LZZZZZZZ.jpg")
                .publisher("HarperCollins")
                .publicationYear(1974)
                .language("English")
                .pages(192)
                .bookType(BookType.BOTH)
                .available(true)
                .rating(4.8)
                .reviewCount(9800)
                .category(children)
                .build()
        );

        int newlySeeded = 0;
        int updatedCount = 0;
        for (Book book : books) {
            Optional<Book> existingBookOpt = bookRepository.findByIsbn(book.getIsbn());
            if (existingBookOpt.isPresent()) {
                Book existingBook = existingBookOpt.get();
                existingBook.setTitle(book.getTitle());
                existingBook.setAuthor(book.getAuthor());
                existingBook.setDescription(book.getDescription());
                existingBook.setPrice(book.getPrice());
                existingBook.setOriginalPrice(book.getOriginalPrice());
                existingBook.setCoverImageUrl(book.getCoverImageUrl());
                existingBook.setPublisher(book.getPublisher());
                existingBook.setPublicationYear(book.getPublicationYear());
                existingBook.setLanguage(book.getLanguage());
                existingBook.setPages(book.getPages());
                existingBook.setBookType(book.getBookType());
                existingBook.setCategory(book.getCategory());
                bookRepository.save(existingBook);
                updatedCount++;
            } else {
                bookRepository.save(book);
                newlySeeded++;
                log.info("Seeded book: {}", book.getTitle());
            }
        }
        log.info("Seeding completed. Seeded {} new books, updated {} existing books.", newlySeeded, updatedCount);
    }
}
