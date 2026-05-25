package com.novello.inventory.controller;

import com.novello.inventory.entity.Inventory;
import com.novello.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/{bookId}")
    public ResponseEntity<Inventory> getByBookId(@PathVariable Long bookId) {
        return ResponseEntity.ok(inventoryService.getByBookId(bookId));
    }

    @GetMapping("/{bookId}/check")
    public ResponseEntity<Map<String, Object>> checkStock(@PathVariable Long bookId,
                                                           @RequestParam(defaultValue = "1") int quantity) {
        boolean inStock = inventoryService.isInStock(bookId, quantity);
        return ResponseEntity.ok(Map.of("inStock", inStock, "bookId", bookId));
    }

    @PostMapping("/{bookId}/set")
    public ResponseEntity<Inventory> setStock(@PathVariable Long bookId,
                                               @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(inventoryService.setStock(bookId, body.get("quantity")));
    }

    @PostMapping("/{bookId}/add")
    public ResponseEntity<Inventory> addStock(@PathVariable Long bookId,
                                               @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(inventoryService.addStock(bookId, body.get("quantity")));
    }

    @PostMapping("/{bookId}/decrement")
    public ResponseEntity<Inventory> decrementStock(@PathVariable Long bookId,
                                                     @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(inventoryService.decrementStock(bookId, body.get("quantity")));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<Inventory>> getAll() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }
}
