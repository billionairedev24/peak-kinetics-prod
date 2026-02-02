package com.peakkineticspt.service.impl;

import com.peakkineticspt.dto.PatientJourneyDTOs;
import com.peakkineticspt.entity.PatientJourney;
import com.peakkineticspt.entity.User;
import com.peakkineticspt.repository.PatientJourneyRepository;
import com.peakkineticspt.repository.UserRepository;
import com.peakkineticspt.service.PatientJourneyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PatientJourneyServiceImpl implements PatientJourneyService {

    private final PatientJourneyRepository journeyRepository;
    private final UserRepository userRepository;

    @Override
    public Optional<PatientJourneyDTOs.PatientJourneyResponse> getJourneyByPatientId(Long patientId) {
        return journeyRepository.findByPatientId(patientId)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public PatientJourneyDTOs.PatientJourneyResponse updateJourney(Long patientId,
            PatientJourneyDTOs.UpdateJourneyRequest request) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        PatientJourney journey = journeyRepository.findByPatient(patient)
                .orElse(PatientJourney.builder().patient(patient).build());

        if (request.getCurrentPhase() != null)
            journey.setCurrentPhase(request.getCurrentPhase());
        if (request.getProgressPercentage() != null)
            journey.setProgressPercentage(request.getProgressPercentage());
        if (request.getDescription() != null)
            journey.setDescription(request.getDescription());
        if (request.getNextMilestone() != null)
            journey.setNextMilestone(request.getNextMilestone());
        if (request.getNextMilestoneDate() != null)
            journey.setNextMilestoneDate(request.getNextMilestoneDate());

        return mapToResponse(journeyRepository.save(journey));
    }

    private PatientJourneyDTOs.PatientJourneyResponse mapToResponse(PatientJourney journey) {
        return PatientJourneyDTOs.PatientJourneyResponse.builder()
                .id(journey.getId())
                .patientId(journey.getPatient().getId())
                .patientName(journey.getPatient().getFullName())
                .currentPhase(journey.getCurrentPhase())
                .progressPercentage(journey.getProgressPercentage())
                .description(journey.getDescription())
                .nextMilestone(journey.getNextMilestone())
                .nextMilestoneDate(journey.getNextMilestoneDate())
                .updatedAt(journey.getUpdatedAt())
                .build();
    }
}
