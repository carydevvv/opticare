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
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Appointment {
  id?: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  date: string; // ISO date string
  time: string; // HH:MM format
  duration: number; // minutes
  type: "consultation" | "follow-up" | "prescription-exam" | "other";
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  notes: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const APPOINTMENTS_COLLECTION = "appointments";

/**
 * Add a new appointment
 */
export async function addAppointment(
  appointmentData: Appointment,
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, APPOINTMENTS_COLLECTION), {
      ...appointmentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding appointment:", error);
    throw error;
  }
}

/**
 * Get all appointments
 */
export async function getAllAppointments(): Promise<Appointment[]> {
  try {
    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      orderBy("date", "desc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Appointment,
    );
  } catch (error) {
    console.error("Error getting appointments:", error);
    throw error;
  }
}

/**
 * Get appointments for a specific patient
 */
export async function getPatientAppointments(
  patientId: string,
): Promise<Appointment[]> {
  try {
    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where("patientId", "==", patientId),
      orderBy("date", "desc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Appointment,
    );
  } catch (error) {
    console.error("Error getting patient appointments:", error);
    throw error;
  }
}

/**
 * Get a single appointment by ID
 */
export async function getAppointmentById(
  appointmentId: string,
): Promise<Appointment | null> {
  try {
    const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Appointment;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting appointment:", error);
    throw error;
  }
}

/**
 * Get appointments on a specific date
 */
export async function getAppointmentsByDate(
  dateString: string,
): Promise<Appointment[]> {
  try {
    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where("date", "==", dateString),
      orderBy("time", "asc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Appointment,
    );
  } catch (error) {
    console.error("Error getting appointments by date:", error);
    throw error;
  }
}

/**
 * Update an appointment
 */
export async function updateAppointment(
  appointmentId: string,
  appointmentData: Partial<Appointment>,
): Promise<void> {
  try {
    const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    await updateDoc(docRef, {
      ...appointmentData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw error;
  }
}

/**
 * Delete an appointment
 */
export async function deleteAppointment(appointmentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, APPOINTMENTS_COLLECTION, appointmentId));
  } catch (error) {
    console.error("Error deleting appointment:", error);
    throw error;
  }
}

/**
 * Get appointment statistics
 */
export async function getAppointmentStats(): Promise<{
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  noShow: number;
}> {
  try {
    const appointments = await getAllAppointments();
    return {
      total: appointments.length,
      scheduled: appointments.filter((a) => a.status === "scheduled").length,
      completed: appointments.filter((a) => a.status === "completed").length,
      cancelled: appointments.filter((a) => a.status === "cancelled").length,
      noShow: appointments.filter((a) => a.status === "no-show").length,
    };
  } catch (error) {
    console.error("Error getting appointment stats:", error);
    throw error;
  }
}
