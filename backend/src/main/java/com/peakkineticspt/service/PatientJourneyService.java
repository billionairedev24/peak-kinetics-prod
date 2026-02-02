package com.peakkineticspt.service;

import com.peakkineticspt.dto.PatientJourneyDTOs;
import java.util.Optional;

public interface PatientJourneyService {
    Optional<PatientJourneyDTOs.PatientJourneyResponse> getJourneyByPatientId(Long patientId);

    PatientJourneyDTOs.PatientJourneyResponse updateJourney(Long patientId,
            PatientJourneyDTOs.UpdateJourneyRequest request);
}
