import { DayOfWeek } from "../../models/business-hour.model";


export function minutesBetween(startTime: string, endTime: string) {
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  if(!startTotalMinutes || endTotalMinutes > 1440){
    return null
  }

  return endTotalMinutes - startTotalMinutes;
}

export function convertToMinutes(time: string) {
  const [Hours, Minutes] = time.split(":").map(Number);

  const TotalMinutes = Hours * 60 + Minutes;

  return Number(TotalMinutes);
}

export function convertToString(minutes: number) {
  const Hours = Math.floor(minutes / 60);
  const Minutes = minutes % 60;
  
  return `${Hours.toString().padStart(2, "0")}:${Minutes.toString().padStart(
    2,
    "0"
  )}`;
}

export function getDayOfWeek(dateString: string) {

  const date = new Date(dateString); // YYYY-MM-DD format

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const dayName = daysOfWeek[date.getDay()];

  return dayName.toLocaleLowerCase() as DayOfWeek
}


export function mergeTimeSlots(slots:{start:string,end:string,seatsLeft:number}[],availableSeats:number) {
  const map = new Map();

  for (const slot of slots) {
    const key = `${slot.start}-${slot.end}`;

    if (!map.has(key)) {
      
      map.set(key, { ...slot });
    } else {
      const existing = map.get(key);
      existing.seatsLeft = existing.seatsLeft -= slot.seatsLeft;
    }
  }

  return Array.from(map.values());
}

