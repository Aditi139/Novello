package com.novello.inventory.service;

import com.novello.inventory.entity.Inventory;
import com.novello.inventory.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public Inventory getByBookId(Long bookId) {
        return inventoryRepository.findByBookId(bookId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for book: " + bookId));
    }

    public boolean isInStock(Long bookId, int requestedQty) {
        return inventoryRepository.findByBookId(bookId)
                .map(inv -> inv.getQuantity() >= requestedQty)
                .orElse(false);
    }

    public Inventory setStock(Long bookId, int quantity) {
        Inventory inventory = inventoryRepository.findByBookId(bookId)
                .orElse(Inventory.builder().bookId(bookId).build());
        inventory.setQuantity(quantity);
        return inventoryRepository.save(inventory);
    }

    @Transactional
    public Inventory decrementStock(Long bookId, int quantity) {
        Inventory inventory = inventoryRepository.findByBookId(bookId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for book: " + bookId));
        if (inventory.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock for book: " + bookId);
        }
        inventory.setQuantity(inventory.getQuantity() - quantity);
        return inventoryRepository.save(inventory);
    }

    @Transactional
    public Inventory addStock(Long bookId, int quantity) {
        Inventory inventory = inventoryRepository.findByBookId(bookId)
                .orElse(Inventory.builder().bookId(bookId).quantity(0).build());
        inventory.setQuantity(inventory.getQuantity() + quantity);
        return inventoryRepository.save(inventory);
    }

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }
}
