-- Drop the patient_journeys table — feature removed.
-- All clinical data lives in PromptEMR; this app handles PII only.
DROP TABLE IF EXISTS patient_journeys;
