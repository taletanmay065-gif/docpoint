# Security Specification - DocPoint

## Data Invariants
1. An appointment must always have a valid `patientId` (the authenticated user) and a `doctorId` (an existing doctor).
2. Patients can only see their own appointments.
3. Doctors can only see appointments assigned to them.
4. Slots can only be created or modified by the doctor who owns them.
5. An appointment cannot be confirmed without a successful payment state (simulated).
6. Once an appointment is marked 'completed' or 'cancelled', its status cannot be changed back to 'pending'.

## The Dirty Dozen Payloads
1. **Identity Spoofing**: Attempt to create an appointment for another patient ID.
2. **Role Escalation**: Patient trying to write to the `doctors` collection to set their fees.
3. **Ghost Update**: Updating an appointment's `patientId` to someone else after creation.
4. **Price Manipulation**: Booking an appointment with a `fee` field that is lower than the doctor's set fee.
5. **Unauthorized Access**: Guest trying to read appointments.
6. **Double Booking**: Attempting to book a slot that is already `isBooked: true`.
7. **Bypassing Invariants**: Setting an appointment status to 'completed' as a patient.
8. **Field Poisoning**: Adding a huge string to the `notes` field.
9. **Slot Theft**: Doctor A trying to delete slots belonging to Doctor B.
10. **Terminal State Break**: Reverting a 'cancelled' appointment to 'pending'.
11. **Admin Spoofing**: Setting `role: "admin"` during user signup.
12. **PII Leak**: Random user trying to get a private user profile.

## Test Runner (Logic Overview)
The `firestore.rules` will be validated against these scenarios to ensure `PERMISSION_DENIED` where appropriate.
