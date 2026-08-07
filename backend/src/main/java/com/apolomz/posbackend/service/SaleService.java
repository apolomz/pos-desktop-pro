package com.apolomz.posbackend.service;

import com.apolomz.posbackend.dto.request.SaleItemRequestDTO;
import com.apolomz.posbackend.dto.request.SaleRequestDTO;
import com.apolomz.posbackend.dto.response.SaleDetailResponseDTO;
import com.apolomz.posbackend.dto.response.SaleResponseDTO;
import com.apolomz.posbackend.exception.ResourceNotFoundException;
import com.apolomz.posbackend.model.Customer;
import com.apolomz.posbackend.model.Product;
import com.apolomz.posbackend.model.Sale;
import com.apolomz.posbackend.model.SaleDetail;
import com.apolomz.posbackend.model.User;
import com.apolomz.posbackend.repository.CustomerRepository;
import com.apolomz.posbackend.repository.ProductRepository;
import com.apolomz.posbackend.repository.SaleRepository;
import com.apolomz.posbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final InventoryService inventoryService;

    @Transactional
    public SaleResponseDTO createSale(
            SaleRequestDTO requestDTO,
            String sellerUsername
    ) {

        User seller = userRepository.findByUsername(sellerUsername)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Usuario no encontrado: " + sellerUsername
                        )
                );

        Customer customer = null;

        if (requestDTO.getCustomerId() != null) {
            customer = customerRepository.findById(requestDTO.getCustomerId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Cliente no encontrado con ID: "
                                            + requestDTO.getCustomerId()
                            )
                    );
        }

        Sale sale = Sale.builder()
                .user(seller)
                .customer(customer)
                .paymentMethod(requestDTO.getPaymentMethod())
                .status("COMPLETED")
                .build();

        BigDecimal totalSale = BigDecimal.ZERO;

        for (SaleItemRequestDTO itemDTO : requestDTO.getItems()) {

            Product product = productRepository.findById(
                            itemDTO.getProductId()
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Producto no encontrado con ID: "
                                            + itemDTO.getProductId()
                            )
                    );

            if (!product.getIsActive()) {
                throw new IllegalArgumentException(
                        "El producto '" + product.getName()
                                + "' está inactivo."
                );
            }

            if (product.getStock() < itemDTO.getQuantity()) {
                throw new IllegalArgumentException(
                        "Stock insuficiente para: "
                                + product.getName()
                                + ". Stock actual: "
                                + product.getStock()
                                + ", requerido: "
                                + itemDTO.getQuantity()
                );
            }

            // Descontar stock
            product.setStock(
                    product.getStock() - itemDTO.getQuantity()
            );

            productRepository.save(product);

            // Calcular subtotal del producto
            BigDecimal itemSubtotal = product.getPrice()
                    .multiply(
                            BigDecimal.valueOf(itemDTO.getQuantity())
                    );

            totalSale = totalSale.add(itemSubtotal);

            // Crear detalle de venta
            SaleDetail detail = SaleDetail.builder()
                    .product(product)
                    .quantity(itemDTO.getQuantity())
                    .unitPrice(product.getPrice())
                    .subtotal(itemSubtotal)
                    .build();

            sale.addDetail(detail);
        }

        sale.setSubtotal(totalSale);
        sale.setTax(BigDecimal.ZERO);
        sale.setTotal(totalSale);

        // Guardar venta
        Sale savedSale = saleRepository.save(sale);

        // Definir nombre del cliente para auditoría en el historial de inventario
        String customerName = (savedSale.getCustomer() != null)
                ? savedSale.getCustomer().getName()
                : "Cliente General";

        // Registrar movimientos de inventario
        for (SaleDetail detail : savedSale.getDetails()) {

            inventoryService.registerSaleMovement(
                    detail.getProduct(),
                    detail.getQuantity(),
                    "Venta #" + savedSale.getId() + " (Cliente: " + customerName + ")"
            );
        }

        return mapToResponseDTO(savedSale);
    }

    private SaleResponseDTO mapToResponseDTO(Sale sale) {

        List<SaleDetailResponseDTO> detailDTOs =
                sale.getDetails()
                        .stream()
                        .map(d ->
                                SaleDetailResponseDTO.builder()
                                        .id(d.getId())
                                        .productId(d.getProduct().getId())
                                        .productName(d.getProduct().getName())
                                        .quantity(d.getQuantity())
                                        .unitPrice(d.getUnitPrice())
                                        .subtotal(d.getSubtotal())
                                        .build()
                        )
                        .toList();

        Customer customer = sale.getCustomer();

        // Convertir Enum a String para el DTO
        String paymentMethodStr = (sale.getPaymentMethod() != null)
                ? sale.getPaymentMethod().name()
                : null;

        return SaleResponseDTO.builder()
                .id(sale.getId())
                .sellerUsername(sale.getUser().getUsername())
                .customerId(customer != null ? customer.getId() : null)
                .customerName(customer != null ? customer.getName() : "Cliente General")
                .subtotal(sale.getSubtotal())
                .tax(sale.getTax())
                .total(sale.getTotal())
                .paymentMethod(paymentMethodStr)
                .status(sale.getStatus())
                .createdAt(sale.getCreatedAt())
                .details(detailDTOs)
                .build();
    }
}