package com.apolomz.posbackend.service;

import com.apolomz.posbackend.model.*;
import com.apolomz.posbackend.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BackupService {

    private final BusinessConfigRepository configRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final SaleRepository saleRepository;
    private final CashShiftRepository shiftRepository;
    private final ExpenseRepository expenseRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public Map<String, Object> exportBackup() {
        Map<String, Object> backupData = new LinkedHashMap<>();

        backupData.put("version", "1.0");
        backupData.put("exportedAt", new Date());
        backupData.put("businessConfig", configRepository.findAll());
        backupData.put("categories", categoryRepository.findAll());
        backupData.put("products", productRepository.findAll());
        backupData.put("customers", customerRepository.findAll());
        backupData.put("roles", roleRepository.findAll());
        backupData.put("users", userRepository.findAll());
        backupData.put("cashShifts", shiftRepository.findAll());
        backupData.put("expenses", expenseRepository.findAll());
        backupData.put("sales", saleRepository.findAll());

        return backupData;
    }

    @Transactional(readOnly = true)
    public byte[] exportFullCsv() {
        StringBuilder csv = new StringBuilder();

        // 1. Productos e Inventario
        csv.append("--- PRODUCTOS E INVENTARIO ---\n");
        csv.append("ID;Nombre;Categoría;Precio;Stock;Stock Mínimo;Estado\n");
        for (Product p : productRepository.findAll()) {
            csv.append(p.getId()).append(";")
               .append(cleanCsv(p.getName())).append(";")
               .append(cleanCsv(p.getCategory() != null ? p.getCategory().getName() : "General")).append(";")
               .append(p.getPrice()).append(";")
               .append(p.getStock()).append(";")
               .append(p.getMinStock()).append(";")
               .append(Boolean.TRUE.equals(p.getIsActive()) ? "Activo" : "Inactivo").append("\n");
        }

        csv.append("\n--- HISTORIAL DE VENTAS ---\n");
        csv.append("Factura #;Fecha;Cajero;Cliente;Método Pago;Subtotal;Impuesto;Total;Estado\n");
        for (Sale s : saleRepository.findAll()) {
            csv.append(s.getId()).append(";")
               .append(s.getCreatedAt()).append(";")
               .append(cleanCsv(s.getUser() != null ? s.getUser().getFullName() : "N/A")).append(";")
               .append(cleanCsv(s.getCustomer() != null ? s.getCustomer().getName() : "Cliente General")).append(";")
               .append(s.getPaymentMethod()).append(";")
               .append(s.getSubtotal()).append(";")
               .append(s.getTax()).append(";")
               .append(s.getTotal()).append(";")
               .append(s.getStatus()).append("\n");
        }

        csv.append("\n--- TURNOS DE CAJA ---\n");
        csv.append("Turno #;Cajero;Apertura;Cierre;Base Inicial;Esperado;Reportado;Estado\n");
        for (CashShift cs : shiftRepository.findAll()) {
            csv.append(cs.getId()).append(";")
               .append(cleanCsv(cs.getUser() != null ? cs.getUser().getFullName() : "N/A")).append(";")
               .append(cs.getOpenedAt()).append(";")
               .append(cs.getClosedAt() != null ? cs.getClosedAt() : "ABIERTO").append(";")
               .append(cs.getInitialBase()).append(";")
               .append(cs.getExpectedFinalAmount() != null ? cs.getExpectedFinalAmount() : "N/A").append(";")
               .append(cs.getActualFinalAmount() != null ? cs.getActualFinalAmount() : "N/A").append(";")
               .append(cs.getStatus()).append("\n");
        }

        csv.append("\n--- EGRESOS Y NÓMINA ---\n");
        csv.append("ID;Turno #;Categoría;Monto;Descripción;Registrado Por;Fecha\n");
        for (Expense e : expenseRepository.findAll()) {
            csv.append(e.getId()).append(";")
               .append(e.getShift() != null ? e.getShift().getId() : "N/A").append(";")
               .append(e.getCategory()).append(";")
               .append(e.getAmount()).append(";")
               .append(cleanCsv(e.getDescription())).append(";")
               .append(cleanCsv(e.getRegisteredBy())).append(";")
               .append(e.getCreatedAt()).append("\n");
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String cleanCsv(String val) {
        if (val == null) return "";
        return val.replace(";", ",").replace("\n", " ");
    }

    @Transactional
    public Map<String, Object> importBackup(Map<String, Object> payload) {
        if (payload == null || payload.isEmpty()) {
            throw new IllegalArgumentException("El archivo de respaldo JSON no contiene datos válidos.");
        }

        int restoredEntities = 0;

        if (payload.containsKey("businessConfig")) {
            List<?> configs = (List<?>) payload.get("businessConfig");
            for (Object obj : configs) {
                BusinessConfig config = objectMapper.convertValue(obj, BusinessConfig.class);
                configRepository.save(config);
                restoredEntities++;
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Respaldo importado correctamente.");
        result.put("restoredEntities", restoredEntities);
        return result;
    }
}
