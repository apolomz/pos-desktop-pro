package com.apolomz.posbackend.service;

import com.apolomz.posbackend.model.*;
import com.apolomz.posbackend.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public Map<String, Object> importBackup(Map<String, Object> payload) {
        if (payload == null || payload.isEmpty()) {
            throw new IllegalArgumentException("El archivo de respaldo JSON no contiene datos válidos.");
        }

        int restoredEntities = 0;

        // Si incluye businessConfig
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
