package com.apolomz.posbackend.controller;

import com.apolomz.posbackend.dto.request.BusinessConfigDTO;
import com.apolomz.posbackend.service.BusinessConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping({"/api/v1/config", "/api/config"})
@RequiredArgsConstructor
public class BusinessConfigController {

    private final BusinessConfigService configService;

    @GetMapping
    public ResponseEntity<BusinessConfigDTO> getConfig() {
        return ResponseEntity.ok(configService.getConfig());
    }

    @PutMapping
    public ResponseEntity<BusinessConfigDTO> updateConfig(@Valid @RequestBody BusinessConfigDTO dto) {
        return ResponseEntity.ok(configService.updateConfig(dto));
    }

    @PostMapping("/logo")
    public ResponseEntity<Map<String, String>> uploadLogo(@RequestParam("file") MultipartFile file) {
        String logoUrl = configService.uploadLogo(file);
        return ResponseEntity.ok(Map.of("logoUrl", logoUrl));
    }
}
