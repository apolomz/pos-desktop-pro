package com.apolomz.posbackend.controller;

import com.apolomz.posbackend.dto.response.reports.DashboardReportDTO;
import com.apolomz.posbackend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardReportDTO> getDashboardReport(
            @RequestParam(defaultValue = "monthly", required = false) String timeframe) {
        DashboardReportDTO report = reportService.getDashboardReport(timeframe);
        return ResponseEntity.ok(report);
    }
}
