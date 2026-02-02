package com.peakkineticspt.service.impl;

import com.peakkineticspt.dto.PatientJourneyDTOs;
import com.peakkineticspt.entity.PatientJourney;
import com.peakkineticspt.entity.User;
import com.peakkineticspt.repository.PatientJourneyRepository;
import com.peakkineticspt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientJourneyServiceImplTest {

    @Mock
    private PatientJourneyRepository journeyRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PatientJourneyServiceImpl journeyService;

    private User testPatient;
    private PatientJourney testJourney;

    @BeforeEach
    void setUp() {
        testPatient = User.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .title("Mr.")
                .email("john@example.com")
                .build();

        testJourney = PatientJourney.builder()
                .id(1L)
                .patient(testPatient)
                .currentPhase("Mobility")
                .progressPercentage(20)
                .description("Starting mobility")
                .build();
    }

    @Test
    void getJourneyByPatientId_Success() {
        when(journeyRepository.findByPatientId(1L)).thenReturn(Optional.of(testJourney));

        Optional<PatientJourneyDTOs.PatientJourneyResponse> response = journeyService.getJourneyByPatientId(1L);

        assertTrue(response.isPresent());
        assertEquals("Mobility", response.get().getCurrentPhase());
        assertEquals("Mr. John Doe", response.get().getPatientName());
    }

    @Test
    void getJourneyByPatientId_NotFound() {
        when(journeyRepository.findByPatientId(2L)).thenReturn(Optional.empty());

        Optional<PatientJourneyDTOs.PatientJourneyResponse> response = journeyService.getJourneyByPatientId(2L);

        assertFalse(response.isPresent());
    }

    @Test
    void updateJourney_NewJourney() {
        PatientJourneyDTOs.UpdateJourneyRequest request = PatientJourneyDTOs.UpdateJourneyRequest.builder()
                .currentPhase("Strength")
                .progressPercentage(50)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testPatient));
        when(journeyRepository.findByPatient(testPatient)).thenReturn(Optional.empty());
        when(journeyRepository.save(any(PatientJourney.class))).thenAnswer(i -> i.getArguments()[0]);

        PatientJourneyDTOs.PatientJourneyResponse response = journeyService.updateJourney(1L, request);

        assertNotNull(response);
        assertEquals("Strength", response.getCurrentPhase());
        assertEquals(50, response.getProgressPercentage());
        verify(journeyRepository).save(any(PatientJourney.class));
    }

    @Test
    void updateJourney_ExistingJourney() {
        PatientJourneyDTOs.UpdateJourneyRequest request = PatientJourneyDTOs.UpdateJourneyRequest.builder()
                .currentPhase("Performance")
                .progressPercentage(90)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testPatient));
        when(journeyRepository.findByPatient(testPatient)).thenReturn(Optional.of(testJourney));
        when(journeyRepository.save(any(PatientJourney.class))).thenAnswer(i -> i.getArguments()[0]);

        PatientJourneyDTOs.PatientJourneyResponse response = journeyService.updateJourney(1L, request);

        assertNotNull(response);
        assertEquals("Performance", response.getCurrentPhase());
        assertEquals(90, response.getProgressPercentage());
        verify(journeyRepository).save(testJourney);
    }
}
