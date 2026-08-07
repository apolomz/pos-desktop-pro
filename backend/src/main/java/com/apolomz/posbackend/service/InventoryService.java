package com.apolomz.posbackend.service;

import com.apolomz.posbackend.dto.request.InventoryMovementRequestDTO;
import com.apolomz.posbackend.dto.response.InventoryMovementResponseDTO;
import com.apolomz.posbackend.model.InventoryMovement;
import com.apolomz.posbackend.model.Product;
import com.apolomz.posbackend.model.enums.MovementType;
import com.apolomz.posbackend.repository.InventoryMovementRepository;
import com.apolomz.posbackend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryMovementRepository movementRepository;
    private final ProductRepository productRepository;

    @Transactional
    public InventoryMovementResponseDTO registerManualMovement(InventoryMovementRequestDTO dto) {
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        int previousStock = product.getStock();
        int newStock = previousStock;

        switch (dto.getType()) {
            case ENTRY:
            case RETURN:
                newStock = previousStock + dto.getQuantity();
                break;
            case EXIT:
                if (previousStock < dto.getQuantity()) {
                    throw new RuntimeException("Stock insuficiente para realizar la salida");
                }
                newStock = previousStock - dto.getQuantity();
                break;
            case ADJUSTMENT:
                newStock = dto.getQuantity(); // Se define el valor real contado
                break;
            default:
                throw new IllegalArgumentException("Tipo de movimiento no permitido para registro manual");
        }

        product.setStock(newStock);
        productRepository.save(product);

        InventoryMovement movement = InventoryMovement.builder()
                .product(product)
                .type(dto.getType())
                .quantity(dto.getQuantity())
                .previousStock(previousStock)
                .newStock(newStock)
                .reason(dto.getReason())
                .build();

        return mapToDTO(movementRepository.save(movement));
    }

    // Registra movimiento automático cuando se completa una venta
    @Transactional
    public void registerSaleMovement(Product product, int quantitySold, String saleReference) {
        int previousStock = product.getStock() + quantitySold; // Ya fue descontado en SaleService
        int newStock = product.getStock();

        InventoryMovement movement = InventoryMovement.builder()
                .product(product)
                .type(MovementType.SALE)
                .quantity(quantitySold)
                .previousStock(previousStock)
                .newStock(newStock)
                .reason("Venta registrada: " + saleReference)
                .build();

        movementRepository.save(movement);
    }

    @Transactional(readOnly = true)
    public List<InventoryMovementResponseDTO> getHistory(Long productId) {
        List<InventoryMovement> list = (productId != null)
                ? movementRepository.findByProductIdOrderByCreatedAtDesc(productId)
                : movementRepository.findAllByOrderByCreatedAtDesc();

        return list.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Product> getLowStockAlerts() {
        return productRepository.findLowStockProducts();
    }

    private InventoryMovementResponseDTO mapToDTO(InventoryMovement m) {
        return InventoryMovementResponseDTO.builder()
                .id(m.getId())
                .productId(m.getProduct().getId())
                .productName(m.getProduct().getName())
                .type(m.getType())
                .quantity(m.getQuantity())
                .previousStock(m.getPreviousStock())
                .newStock(m.getNewStock())
                .reason(m.getReason())
                .createdAt(m.getCreatedAt())
                .build();
    }
}