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
  patientHistory?: {
    pmHx?: string;
    poHx?: string;
    vdu?: string;
    strabismus?: string;
    npc?: string;
  };
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
 * Add a new patient to Firestore
 */
export async function addPatient(patientData: PatientData): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, PATIENTS_COLLECTION), {
      ...patientData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    // Improve error messaging
    if (error instanceof Error) {
      if (
        error.message.includes("AbortError") ||
        error.message.includes("aborted")
      ) {
        console.debug("Request was cancelled");
        throw new Error("Request was interrupted. Please try again.");
      }
      if (error.message.includes("permission")) {
        throw new Error("Permission denied. Please check your Firebase rules.");
      }
      if (error.message.includes("network")) {
        throw new Error("Network error. Please check your connection.");
      }
    }
    console.error("Error adding patient:", error);
    throw error;
  }
}

/**
 * Get all patients from Firestore
 */
export async function getAllPatients(): Promise<PatientData[]> {
  try {
    const docsPromise = getDocs(collection(db, PATIENTS_COLLECTION));

    // Create a promise that rejects after 15 seconds
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Firestore request timeout")), 15000),
    );

    const querySnapshot = (await Promise.race([
      docsPromise,
      timeoutPromise,
    ])) as any;

    return querySnapshot.docs.map(
      (doc: any) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as PatientData,
    );
  } catch (error) {
    // Ignore AbortError - it means the component was unmounted or request was cancelled
    if (error instanceof Error) {
      if (
        error.message.includes("AbortError") ||
        error.message.includes("aborted") ||
        error.message.includes("signal is aborted")
      ) {
        // This is expected behavior when component unmounts - silently ignore
        return [];
      }
      if (error.message === "Firestore request timeout") {
        console.error("Firestore request timed out");
        throw new Error(
          "Failed to load patients. Please check your internet connection and try again.",
        );
      }
    }
    // Check if error name is AbortError
    if ((error as any)?.name === "AbortError") {
      return [];
    }
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
    // Ignore AbortError - it means the component was unmounted or request was cancelled
    if (error instanceof Error) {
      if (
        error.message.includes("AbortError") ||
        error.message.includes("aborted") ||
        error.message.includes("signal is aborted")
      ) {
        return null;
      }
    }
    // Check if error name is AbortError
    if ((error as any)?.name === "AbortError") {
      return null;
    }
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
