package com.peakkineticspt.repository;

import com.peakkineticspt.entity.PatientJourney;
import com.peakkineticspt.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PatientJourneyRepository extends JpaRepository<PatientJourney, Long> {
    Optional<PatientJourney> findByPatient(User patient);

    Optional<PatientJourney> findByPatientId(Long patientId);
}
