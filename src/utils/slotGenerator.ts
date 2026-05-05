import { addMinutes, format, isAfter, startOfToday } from 'date-fns';

export function generateDailySlots(date: string, startTime = '09:00', endTime = '17:00', intervalMinutes = 30) {
  const slots: string[] = [];
  let current = new Date(`${date}T${startTime}`);
  const end = new Date(`${date}T${endTime}`);

  while (current <= end) {
    slots.push(format(current, 'HH:mm'));
    current = addMinutes(current, intervalMinutes);
  }

  return slots;
}
