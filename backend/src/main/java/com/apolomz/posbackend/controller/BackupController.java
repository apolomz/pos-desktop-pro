package com.apolomz.posbackend.controller;

import com.apolomz.posbackend.service.BackupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/v1/backup", "/api/backup"})
@RequiredArgsConstructor
public class BackupController {

    private final BackupService backupService;

    @GetMapping("/export")
    public ResponseEntity<Map<String, Object>> exportBackup() {
        Map<String, Object> data = backupService.exportBackup();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=pos_backup_" + System.currentTimeMillis() + ".json")
                .contentType(MediaType.APPLICATION_JSON)
                .body(data);
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsvBackup() {
        byte[] csvBytes = backupService.exportFullCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=pos_reportes_" + System.currentTimeMillis() + ".csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvBytes);
    }

    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importBackup(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = backupService.importBackup(payload);
        return ResponseEntity.ok(response);
    }
}
