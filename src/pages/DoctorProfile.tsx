import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { DoctorProfile as DocType, Appointment } from "../types";
import { useAuth } from "../contexts/AuthContext";
import {
  ChevronLeft,
  Star,
  Clock,
  Calendar,
  CheckCircle2,
  Shield,
  Info,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format, addDays, startOfToday } from "date-fns";
import toast from "react-hot-toast";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";
import PaymentModal from "../components/PaymentModal";
import { Review } from "../types";

interface DoctorProfileProps {
  doctorId: string;
  onBack: () => void;
  onBooked: () => void;
}

export default function DoctorProfile({
  doctorId,
  onBack,
  onBooked,
}: DoctorProfileProps) {
  const { user, profile } = useAuth();
  const [doctor, setDoctor] = useState<DocType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    format(startOfToday(), "yyyy-MM-dd"),
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  const dates = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i));

  useEffect(() => {
    const fetchDoctor = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "doctors", doctorId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setDoctor({ userId: docSnap.id, ...docSnap.data() } as DocType);
        } else {
          // Handle mock if not in DB
          const mockDoctors: Record<string, any> = {
            "doc-1": {
              displayName: "Dr. Sarah Johnson",
              specialization: "Cardiologist",
              experience: 12,
              fees: 1500,
              rating: 4.9,
              description: "Expert in non-invasive cardiology.",
            },
            "doc-2": {
              displayName: "Dr. Michael Chen",
              specialization: "Dermatologist",
              experience: 8,
              fees: 1000,
              rating: 4.8,
              description: "Specializes in cosmetic dermatology.",
            },
            "doc-3": {
              displayName: "Dr. Elena Rodriguez",
              specialization: "Pediatrician",
              experience: 15,
              fees: 1200,
              rating: 5.0,
              description: "Care for newborns to adolescents.",
            },
            "doc-4": {
              displayName: "Dr. David Wilson",
              specialization: "Neurologist",
              experience: 20,
              fees: 2000,
              rating: 4.7,
              description: "Focuses on complex neurological disorders.",
            },
          };
          if (mockDoctors[doctorId]) {
            setDoctor({
              userId: doctorId,
              ...mockDoctors[doctorId],
              availability: {},
            } as DocType);
          }
        }

        // Fetch reviews
        const reviewsSnap = await getDocs(
          query(collection(db, "reviews"), where("doctorId", "==", doctorId)),
        );
        setReviews(
          reviewsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Review),
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    const q = query(
      collection(db, "appointments"),
      where("doctorId", "==", doctorId),
      where("date", "==", selectedDate),
      where("status", "in", ["confirmed", "pending"]),
    );
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        setBookedSlots(
          querySnapshot.docs.map((d) => (d.data() as Appointment).startTime),
        );
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "appointments");
      },
    );
    return () => unsubscribe();
  }, [doctorId, selectedDate]);

  const slots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
  ];

  const handleBooking = async (paymentMethod: string) => {
    if (!selectedSlot || !user) return;
    setIsBooking(true);

    try {
      const appointmentData = {
        patientId: user.uid,
        doctorId: doctorId,
        doctorName: doctor?.displayName,
        patientName: profile?.displayName,
        date: selectedDate,
        startTime: selectedSlot,
        status: "confirmed",
        paymentStatus: "paid",
        paymentMethod: paymentMethod,
        amount: doctor?.fees || 0,
        createdAt: new Date().toISOString(),
        serverCreatedAt: serverTimestamp(),
      };

      try {
        const docRef = await addDoc(
          collection(db, "appointments"),
          appointmentData,
        );

        // Create Payment record
        await setDoc(doc(db, "payments", docRef.id), {
          appointmentId: docRef.id,
          patientId: user.uid,
          amount: doctor?.fees || 0,
          method: paymentMethod,
          status: "completed",
          createdAt: new Date().toISOString(),
        });

        toast.success(`Appointment confirmed for ${selectedSlot}!`);
        setShowPayment(false);
        onBooked();
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, "appointments");
      }
    } catch (error: any) {
      toast.error("Booking failed: " + error.message);
    } finally {
      setIsBooking(false);
    }
  };

  if (loading)
    return <div className="text-center py-20">Loading profile...</div>;
  if (!doctor) return <div>Doctor not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-semibold"
      >
        <ChevronLeft size={20} /> Back to Search
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm text-center">
            {doctor.photoURL ? (
              <img
                src={doctor.photoURL}
                alt={doctor.displayName}
                className="w-24 h-24 rounded-3xl object-cover shadow-xl shadow-blue-100 border-2 border-white mx-auto mb-6"
              />
            ) : (
              <div className="w-24 h-24 bg-blue-600 text-white rounded-3xl flex items-center justify-center font-bold text-3xl mx-auto mb-6 shadow-xl shadow-blue-100 uppercase">
                {doctor.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            )}
            <h1 className="text-2xl font-bold text-slate-900 uppercase">
              {doctor.displayName}
            </h1>
            <p className="text-blue-600 font-bold mb-2">
              {doctor.specialization}
            </p>
            {doctor.certificateInfo && (
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                {doctor.certificateInfo}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-100 mb-6">
              <div className="text-center">
                <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">
                  Experience
                </span>
                <span className="text-lg font-bold text-slate-900">
                  {doctor.experience}Y+
                </span>
              </div>
              <div className="text-center">
                <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">
                  Rating
                </span>
                <span className="text-lg font-bold text-amber-600 flex items-center justify-center gap-1">
                  <Star size={16} fill="currentColor" /> {doctor.rating}
                </span>
              </div>
            </div>

            {doctor.registrationNumber && (
              <div className="mb-6 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 py-2 px-4 rounded-xl">
                <Shield size={14} className="text-blue-600" /> Reg No:{" "}
                {doctor.registrationNumber}
              </div>
            )}

            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              {doctor.description}
            </p>

            <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between">
              <span className="text-slate-600 font-medium">
                Consultation Fee
              </span>
              <span className="text-xl font-bold text-slate-900">
                ₹{doctor.fees}
              </span>
            </div>
          </div>

          <div className="bg-blue-600 rounded-[2rem] p-6 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Shield size={80} />
            </div>
            <h3 className="font-bold flex items-center gap-2 mb-2">
              <Shield size={20} /> DocPoint Verified
            </h3>
            <p className="text-blue-100 text-xs leading-relaxed">
              This doctor has been verified by our medical board for credentials
              and clinical experience.
            </p>
          </div>
        </div>

        {/* Booking Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm overflow-hidden text-left">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 uppercase">
                Book Appointment
              </h2>
              <div className="flex gap-2">
                <div
                  className={`h-2 w-8 rounded-full transition-colors ${bookingStep >= 1 ? "bg-blue-600" : "bg-slate-100"}`}
                />
                <div
                  className={`h-2 w-8 rounded-full transition-colors ${bookingStep >= 2 ? "bg-blue-600" : "bg-slate-100"}`}
                />
                <div
                  className={`h-2 w-8 rounded-full transition-colors ${bookingStep >= 3 ? "bg-blue-600" : "bg-slate-100"}`}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {bookingStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Calendar className="text-blue-600" size={24} />
                    <h3 className="text-lg font-bold text-slate-900 uppercase">
                      1. Select Date
                    </h3>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 pb-4">
                    {dates.map((date) => {
                      const dateStr = format(date, "yyyy-MM-dd");
                      const isSelected = selectedDate === dateStr;
                      return (
                        <button
                          key={dateStr}
                          onClick={() => {
                            setSelectedDate(dateStr);
                            setSelectedSlot(null);
                            setBookingStep(2);
                          }}
                          className={`flex flex-col items-center min-w-[60px] p-4 rounded-2xl border-2 transition-all ${isSelected ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" : "bg-white border-slate-100 text-slate-600 hover:border-blue-200"}`}
                        >
                          <span className="text-[10px] sm:text-xs uppercase font-bold opacity-70 mb-1">
                            {format(date, "EEE")}
                          </span>
                          <span className="text-lg sm:text-xl font-bold">
                            {format(date, "dd")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {bookingStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Clock className="text-blue-600" size={24} />
                    <h3 className="text-lg font-bold text-slate-900 uppercase">
                      2. Select Time Slot
                    </h3>
                  </div>

                  <div className="mb-6 text-sm font-bold text-slate-500 uppercase tracking-wider bg-slate-50 py-2 px-4 rounded-xl inline-block">
                    {format(new Date(selectedDate), "EEEE, MMMM dd")}
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {slots.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          disabled={isBooked}
                          onClick={() => {
                            setSelectedSlot(slot);
                            setBookingStep(3);
                          }}
                          className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${isBooked ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed" : isSelected ? "bg-blue-50 border-blue-600 text-blue-700" : "bg-white border-slate-100 text-slate-600 hover:border-blue-200"}`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button
                      onClick={() => setBookingStep(1)}
                      className="text-slate-500 font-bold px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Back to Dates
                    </button>
                  </div>
                </motion.div>
              )}

              {bookingStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="flex items-center gap-2 mb-6">
                    <CheckCircle2 className="text-blue-600" size={24} />
                    <h3 className="text-lg font-bold text-slate-900 uppercase">
                      3. Confirm Details
                    </h3>
                  </div>

                  <div className="bg-slate-50 p-6 sm:p-8 rounded-[2rem] border border-slate-100 space-y-6">
                    <div className="flex justify-between items-center pb-6 border-b border-slate-200">
                      <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">
                        Doctor
                      </span>
                      <span className="text-lg font-bold text-slate-900">
                        {doctor.displayName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-6 border-b border-slate-200">
                      <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">
                        Date & Time
                      </span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {format(new Date(selectedDate), "MMMM dd")}
                        </div>
                        <div className="text-sm font-bold text-slate-500">
                          at {selectedSlot}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">
                        Consultation Fee
                      </span>
                      <span className="text-3xl font-black text-slate-900">
                        ₹{doctor.fees}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
                    <button
                      onClick={() => setBookingStep(2)}
                      className="text-slate-500 font-bold px-8 py-4 rounded-2xl hover:bg-slate-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      disabled={isBooking}
                      onClick={() => setShowPayment(true)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-2xl flex justify-center items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isBooking ? (
                        "Processing..."
                      ) : (
                        <>
                          Pay & Confirm Booking <ChevronRight size={20} />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm mt-6">
            <div className="flex items-center gap-2 mb-8">
              <Star className="text-yellow-400" size={24} />
              <h2 className="text-xl font-bold text-slate-900 uppercase">
                Patient Reviews ({reviews.length})
              </h2>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-slate-50 p-6 rounded-2xl border border-slate-100"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-slate-900">
                          {review.patientName}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={
                                i < review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-slate-200"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm italic">
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-3xl text-slate-400 border border-dashed border-slate-200">
                <Star className="mx-auto mb-2 opacity-20" size={48} />
                <p className="font-bold uppercase text-[10px] tracking-widest">
                  No reviews yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPayment && (
          <PaymentModal
            amount={doctor?.fees || 0}
            onSuccess={handleBooking}
            onCancel={() => setShowPayment(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
