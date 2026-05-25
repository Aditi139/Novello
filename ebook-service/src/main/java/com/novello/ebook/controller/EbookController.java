package com.novello.ebook.controller;

import com.novello.ebook.entity.Ebook;
import com.novello.ebook.service.EbookService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.util.Map;

@RestController
@RequestMapping("/api/ebooks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EbookController {

    private final EbookService ebookService;

    @PostMapping("/upload/{bookId}")
    public ResponseEntity<Ebook> uploadEbook(@PathVariable Long bookId,
                                              @RequestParam("file") MultipartFile file) throws Exception {
        return ResponseEntity.ok(ebookService.uploadEbook(bookId, file));
    }

    @PostMapping("/token")
    public ResponseEntity<Map<String, String>> generateToken(@RequestBody Map<String, Long> body) {
        String token = ebookService.generateDownloadToken(
                body.get("userId"), body.get("bookId"), body.get("orderId"));
        return ResponseEntity.ok(Map.of("token", token));
    }

    @GetMapping("/download")
    public ResponseEntity<Resource> download(@RequestParam String token,
                                              @RequestParam Long userId) throws MalformedURLException {
        Resource resource = ebookService.downloadEbook(token, userId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"ebook.pdf\"")
                .body(resource);
    }

    @GetMapping("/{bookId}")
    public ResponseEntity<Ebook> getByBookId(@PathVariable Long bookId) {
        return ResponseEntity.ok(ebookService.getByBookId(bookId));
    }
}
