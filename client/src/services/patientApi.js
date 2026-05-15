import { mockPatients } from "../constants/mockPatients";

/**
 * Simulates a delay for API calls.
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetches a patient by their UHID.
 * @param {string} uhid 
 * @returns {Promise<Object|null>}
 */
export const getPatientByUhid = async (uhid) => {
  await delay(500);
  const patient = mockPatients.find((p) => p.uhid.toLowerCase() === uhid.toLowerCase());
  return patient || null;
};

/**
 * Searches for patients based on a term (UHID, name, phone, or ID).
 * @param {string} term 
 * @returns {Promise<Array>}
 */
export const searchPatients = async (term) => {
  if (!term.trim()) return [];
  await delay(300);
  const lowerTerm = term.toLowerCase();
  
  return mockPatients.filter((p) => {
    const fullName = `${p.firstName} ${p.middleName || ""} ${p.lastName}`.toLowerCase();
    return (
      p.uhid.toLowerCase().includes(lowerTerm) ||
      fullName.includes(lowerTerm) ||
      (p.phoneNumber && p.phoneNumber.includes(lowerTerm)) ||
      (p.documentNumber && p.documentNumber.includes(lowerTerm))
    );
  });
};

/**
 * Fetches all patients from the system.
 * @returns {Promise<Array>}
 */
export const getAllPatients = async () => {
  await delay(800);
  return mockPatients;
};
