export type UserRole = 'patient' | 'doctor' | 'admin';

export interface UserProfile {
  userId: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt: string;
  photoURL?: string;
}

export interface DoctorProfile {
  userId: string;
  displayName: string;
  specialization: string;
  experience: number;
  fees: number;
  description: string;
  rating: number;
  photoURL?: string;
  availability: Record<string, string[]>; // e.g., { "Monday": ["09:00", "10:00"] }
  registrationNumber?: string;
  certificateInfo?: string;
  reviewCount?: number;
}

export interface Review {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  appointmentId: string;
  patientId: string;
  amount: number;
  method: 'upi' | 'card' | 'net_banking';
  status: 'pending' | 'completed' | 'failed';
  transactionId: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName?: string;
  patientName?: string;
  date: string;
  startTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'unpaid' | 'paid';
  notes?: string;
  prescription?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  appointmentId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
}

export interface Slot {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}
