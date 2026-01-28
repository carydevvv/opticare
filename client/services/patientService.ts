import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Type definition for patient data
export interface PatientData {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: string;
  sex: string;
  dateOfBirth: string;
  address: string;
  insurance: string;
  problem: string;
  rightSphere: string;
  rightCylinder: string;
  rightAxis: string;
  rightAdd: string;
  rightPD: string;
  leftSphere: string;
  leftCylinder: string;
  leftAxis: string;
  leftAdd: string;
  leftPD: string;
  notes: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PATIENTS_COLLECTION = "patients";

/**
 * Add a new patient to Firestore via server API
 */
export async function addPatient(patientData: PatientData): Promise<string> {
  try {
    const response = await fetch("/api/patients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patientData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create patient");
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error("Error adding patient:", error);
    throw error;
  }
}

/**
 * Get all patients from Firestore
 */
export async function getAllPatients(): Promise<PatientData[]> {
  try {
    const querySnapshot = await getDocs(collection(db, PATIENTS_COLLECTION));
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as PatientData,
    );
  } catch (error) {
    console.error("Error getting patients:", error);
    throw error;
  }
}

/**
 * Get a single patient by ID
 */
export async function getPatientById(
  patientId: string,
): Promise<PatientData | null> {
  try {
    const docRef = doc(db, PATIENTS_COLLECTION, patientId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as PatientData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting patient:", error);
    throw error;
  }
}

/**
 * Search patients by name or email
 */
export async function searchPatients(
  searchTerm: string,
): Promise<PatientData[]> {
  try {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const querySnapshot = await getDocs(collection(db, PATIENTS_COLLECTION));

    return querySnapshot.docs
      .map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as PatientData,
      )
      .filter(
        (patient) =>
          patient.firstName.toLowerCase().includes(lowerSearchTerm) ||
          patient.lastName.toLowerCase().includes(lowerSearchTerm) ||
          patient.email.toLowerCase().includes(lowerSearchTerm) ||
          patient.phone.includes(searchTerm),
      );
  } catch (error) {
    console.error("Error searching patients:", error);
    throw error;
  }
}

/**
 * Update a patient record
 */
export async function updatePatient(
  patientId: string,
  patientData: Partial<PatientData>,
): Promise<void> {
  try {
    const docRef = doc(db, PATIENTS_COLLECTION, patientId);
    await updateDoc(docRef, {
      ...patientData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating patient:", error);
    throw error;
  }
}

/**
 * Delete a patient record
 */
export async function deletePatient(patientId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, PATIENTS_COLLECTION, patientId));
  } catch (error) {
    console.error("Error deleting patient:", error);
    throw error;
  }
}
