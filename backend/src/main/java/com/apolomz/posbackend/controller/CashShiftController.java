package com.apolomz.posbackend.controller;

import com.apolomz.posbackend.dto.request.CloseShiftRequestDTO;
import com.apolomz.posbackend.dto.request.OpenShiftRequestDTO;
import com.apolomz.posbackend.dto.response.CashShiftResponseDTO;
import com.apolomz.posbackend.service.CashShiftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/shifts", "/api/shifts"})
@RequiredArgsConstructor
public class CashShiftController {

    private final CashShiftService shiftService;

    @PostMapping("/open")
    public ResponseEntity<CashShiftResponseDTO> openShift(
            @Valid @RequestBody OpenShiftRequestDTO dto,
            Authentication authentication) {
        String username = authentication.getName();
        CashShiftResponseDTO response = shiftService.openShift(username, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/active")
    public ResponseEntity<CashShiftResponseDTO> getActiveShift(Authentication authentication) {
        String username = authentication.getName();
        CashShiftResponseDTO response = shiftService.getActiveShift(username);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<CashShiftResponseDTO> closeShift(
            @PathVariable Long id,
            @Valid @RequestBody CloseShiftRequestDTO dto,
            Authentication authentication) {
        String username = authentication.getName();
        CashShiftResponseDTO response = shiftService.closeShift(id, username, dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<CashShiftResponseDTO>> getAllShifts() {
        return ResponseEntity.ok(shiftService.getAllShifts());
    }
}
