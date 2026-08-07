package com.apolomz.posbackend.service;

import com.apolomz.posbackend.dto.request.BusinessConfigDTO;
import com.apolomz.posbackend.exception.ResourceNotFoundException;
import com.apolomz.posbackend.model.BusinessConfig;
import com.apolomz.posbackend.repository.BusinessConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BusinessConfigService {

    private final BusinessConfigRepository configRepository;

    @Transactional(readOnly = true)
    public BusinessConfigDTO getConfig() {
        BusinessConfig config = configRepository.findFirstByOrderByIdAsc()
                .orElseGet(this::createDefaultConfig);
        return mapToDTO(config);
    }

    @Transactional
    public BusinessConfigDTO updateConfig(BusinessConfigDTO dto) {
        BusinessConfig config = configRepository.findFirstByOrderByIdAsc()
                .orElseGet(this::createDefaultConfig);

        config.setName(dto.getName());
        config.setNit(dto.getNit());
        config.setAddress(dto.getAddress());
        config.setPhone(dto.getPhone());
        config.setEmail(dto.getEmail());
        config.setTaxPercentage(dto.getTaxPercentage());
        if (dto.getLogoUrl() != null && !dto.getLogoUrl().isBlank()) {
            config.setLogoUrl(dto.getLogoUrl());
        }

        BusinessConfig saved = configRepository.save(config);
        return mapToDTO(saved);
    }

    @Transactional
    public String uploadLogo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo del logo no puede estar vacío.");
        }

        try {
            String uploadDir = "uploads/logos";
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String newFilename = "logo_" + UUID.randomUUID().toString().substring(0, 8) + extension;
            Path filePath = Paths.get(uploadDir, newFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String logoUrl = "/uploads/logos/" + newFilename;

            BusinessConfig config = configRepository.findFirstByOrderByIdAsc()
                    .orElseGet(this::createDefaultConfig);
            config.setLogoUrl(logoUrl);
            configRepository.save(config);

            return logoUrl;
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar la imagen del logo: " + e.getMessage(), e);
        }
    }

    private BusinessConfig createDefaultConfig() {
        BusinessConfig config = BusinessConfig.builder()
                .name("POS Desktop Store")
                .nit("900.000.000-1")
                .address("Calle Principal # 10 - 20")
                .phone("300 000 0000")
                .email("contacto@negocio.com")
                .taxPercentage(new BigDecimal("19.00"))
                .build();
        return configRepository.save(config);
    }

    private BusinessConfigDTO mapToDTO(BusinessConfig config) {
        return BusinessConfigDTO.builder()
                .id(config.getId())
                .name(config.getName())
                .nit(config.getNit())
                .address(config.getAddress())
                .phone(config.getPhone())
                .email(config.getEmail())
                .taxPercentage(config.getTaxPercentage())
                .logoUrl(config.getLogoUrl())
                .build();
    }
}
