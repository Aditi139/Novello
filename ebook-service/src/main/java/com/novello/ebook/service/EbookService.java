package com.novello.ebook.service;

import com.novello.ebook.entity.DownloadToken;
import com.novello.ebook.entity.Ebook;
import com.novello.ebook.repository.DownloadTokenRepository;
import com.novello.ebook.repository.EbookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EbookService {

    private final EbookRepository ebookRepository;
    private final DownloadTokenRepository downloadTokenRepository;

    @Value("${ebook.upload.dir:/app/uploads}")
    private String uploadDir;

    public Ebook uploadEbook(Long bookId, MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        String fileName = "book-" + bookId + "-" + UUID.randomUUID() + ".pdf";
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        Ebook ebook = ebookRepository.findByBookId(bookId)
                .orElse(Ebook.builder().bookId(bookId).build());
        ebook.setFileName(file.getOriginalFilename());
        ebook.setFilePath(filePath.toString());
        ebook.setFileSize(file.getSize());
        ebook.setContentType(file.getContentType());
        ebook.setActive(true);
        return ebookRepository.save(ebook);
    }

    public String generateDownloadToken(Long userId, Long bookId, Long orderId) {
        String token = UUID.randomUUID().toString();
        DownloadToken dt = DownloadToken.builder()
                .token(token)
                .userId(userId)
                .bookId(bookId)
                .orderId(orderId)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .used(false)
                .build();
        downloadTokenRepository.save(dt);
        return token;
    }

    public Resource downloadEbook(String token, Long userId) throws MalformedURLException {
        DownloadToken dt = downloadTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid download token"));

        if (dt.isExpired()) throw new RuntimeException("Download token has expired");
        if (!dt.getUserId().equals(userId)) throw new RuntimeException("Unauthorized download");

        Ebook ebook = ebookRepository.findByBookId(dt.getBookId())
                .orElseThrow(() -> new RuntimeException("eBook not found"));

        Path filePath = Paths.get(ebook.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists()) throw new RuntimeException("eBook file not found");
        return resource;
    }

    public Ebook getByBookId(Long bookId) {
        return ebookRepository.findByBookId(bookId)
                .orElseThrow(() -> new RuntimeException("eBook not found for book: " + bookId));
    }
}
