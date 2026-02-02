package com.peakkineticspt.controller;

import com.peakkineticspt.dto.PatientJourneyDTOs;
import com.peakkineticspt.service.PatientJourneyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patient-journey")
@RequiredArgsConstructor
public class PatientJourneyController {

    private final PatientJourneyService journeyService;

    @GetMapping("/{patientId}")
    public ResponseEntity<PatientJourneyDTOs.PatientJourneyResponse> getJourney(@PathVariable Long patientId) {
        return journeyService.getJourneyByPatientId(patientId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{patientId}")
    public ResponseEntity<PatientJourneyDTOs.PatientJourneyResponse> updateJourney(
            @PathVariable Long patientId,
            @RequestBody PatientJourneyDTOs.UpdateJourneyRequest request) {
        return ResponseEntity.ok(journeyService.updateJourney(patientId, request));
    }
}
