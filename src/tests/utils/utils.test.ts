// src/utils/__tests__/time.utils.test.ts
import {
  minutesBetween,
  convertToMinutes,
  convertToString,
  getDayOfWeek,
  mergeTimeSlots,
} from "../../shared/utils/time.util";
import { DayOfWeek } from "../../models/business-hour.model";

describe("Time Utilities", () => {
  
  
    describe("minutesBetween", () => {
    it("should calculate minutes between two times in the same hour", () => {
      expect(minutesBetween("10:00", "10:30")).toBe(30);
      expect(minutesBetween("14:15", "14:45")).toBe(30);
    });

    it("should calculate minutes between times across hours", () => {
      expect(minutesBetween("10:00", "11:00")).toBe(60);
      expect(minutesBetween("09:30", "12:45")).toBe(195);
      expect(minutesBetween("08:00", "17:00")).toBe(540);
    });

    it("should handle times with different minute values", () => {
      expect(minutesBetween("10:15", "11:45")).toBe(90);
      expect(minutesBetween("09:20", "10:50")).toBe(90);
    });

    it("should return negative value when end time is before start time", () => {
      expect(minutesBetween("11:00", "10:00")).toBe(-60);
      expect(minutesBetween("14:30", "12:00")).toBe(-150);
    });

    it("should return 0 when start and end times are the same", () => {
      expect(minutesBetween("10:00", "10:00")).toBe(0);
      expect(minutesBetween("23:59", "23:59")).toBe(0);
    });

    it("should handle edge cases with invalid times", () => {
      expect(minutesBetween("23:00", "25:00")).toBe(null);
    });
  });

  describe("convertToMinutes", () => {
    it("should convert time string to total minutes", () => {
      expect(convertToMinutes("00:00")).toBe(0);
      expect(convertToMinutes("01:00")).toBe(60);
      expect(convertToMinutes("10:30")).toBe(630);
    });

    it("should handle different hour values", () => {
      expect(convertToMinutes("12:00")).toBe(720);
      expect(convertToMinutes("18:45")).toBe(1125);
      expect(convertToMinutes("23:59")).toBe(1439);
    });

    it("should handle times with only minutes", () => {
      expect(convertToMinutes("00:15")).toBe(15);
      expect(convertToMinutes("00:45")).toBe(45);
    });

    it("should handle single-digit values", () => {
      expect(convertToMinutes("9:05")).toBe(545);
      expect(convertToMinutes("5:30")).toBe(330);
    });
  });

  describe("convertToString", () => {
    it("should convert minutes to time string with proper formatting", () => {
      expect(convertToString(0)).toBe("00:00");
      expect(convertToString(60)).toBe("01:00");
      expect(convertToString(630)).toBe("10:30");
    });

    it("should pad single digits with zeros", () => {
      expect(convertToString(65)).toBe("01:05");
      expect(convertToString(545)).toBe("09:05");
      expect(convertToString(5)).toBe("00:05");
    });

    it("should handle large minute values", () => {
      expect(convertToString(1439)).toBe("23:59");
      expect(convertToString(1440)).toBe("24:00");
      expect(convertToString(720)).toBe("12:00");
    });

    it("should handle exact hours", () => {
      expect(convertToString(180)).toBe("03:00");
      expect(convertToString(600)).toBe("10:00");
      expect(convertToString(1200)).toBe("20:00");
    });

    

    it("should be inverse of convertToMinutes", () => {
      const testTimes = ["09:30", "14:45", "23:15", "00:00"];
      testTimes.forEach((time) => {
        const minutes = convertToMinutes(time);
        expect(convertToString(minutes)).toBe(time);
      });
    });
  });

  describe("getDayOfWeek", () => {
    it("should return correct day of week for known dates", () => {
      // January 1, 2024 was a Monday
      expect(getDayOfWeek("2024-01-01")).toBe("monday" as DayOfWeek);
      
      // January 6, 2024 was a Saturday
      expect(getDayOfWeek("2024-01-06")).toBe("saturday" as DayOfWeek);
      
      // January 7, 2024 was a Sunday
      expect(getDayOfWeek("2024-01-07")).toBe("sunday" as DayOfWeek);
    });

    it("should return lowercase day names", () => {
      const result = getDayOfWeek("2024-01-01");
      if(result !=null) {
          expect(result).toBe(result.toLowerCase());
          expect(typeof result).toBe("string");
      }
    });

    
    it("should handle different date formats", () => {
      // YYYY-MM-DD format
      expect(getDayOfWeek("2024-12-25")).toBe("wednesday" as DayOfWeek);
      expect(getDayOfWeek("2024-07-04")).toBe("thursday" as DayOfWeek);
    });

    it("should handle leap year dates", () => {
      // February 29, 2024 was a Thursday
      expect(getDayOfWeek("2024-02-29")).toBe("thursday" as DayOfWeek);
    });

    it("should return valid DayOfWeek type", () => {
      const validDays: DayOfWeek[] = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];
      const result = getDayOfWeek("2024-01-01");
      expect(validDays).toContain(result);
    });
  });

  describe("mergeTimeSlots", () => {
    it("should merge identical time slots by subtracting seats", () => {
      const slots = [
        { start: "10:00", end: "11:00", seatsLeft: 5 },
        { start: "10:00", end: "11:00", seatsLeft: 2 },
      ];
      const result = mergeTimeSlots(slots, 10);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        start: "10:00",
        end: "11:00",
        seatsLeft: 3, // 5 - 2
      });
    });

    it("should keep different time slots separate", () => {
      const slots = [
        { start: "10:00", end: "11:00", seatsLeft: 5 },
        { start: "11:00", end: "12:00", seatsLeft: 3 },
        { start: "12:00", end: "13:00", seatsLeft: 4 },
      ];
      const result = mergeTimeSlots(slots, 10);
      
      expect(result).toHaveLength(3);
      expect(result).toEqual(slots);
    });

    it("should handle multiple merges of the same slot", () => {
      const slots = [
        { start: "14:00", end: "15:00", seatsLeft: 10 },
        { start: "14:00", end: "15:00", seatsLeft: 2 },
        { start: "14:00", end: "15:00", seatsLeft: 3 },
      ];
      const result = mergeTimeSlots(slots, 10);
      
      expect(result).toHaveLength(1);
      expect(result[0].seatsLeft).toBe(5); // 10 - 2 - 3
    });

    it("should handle empty slots array", () => {
      const result = mergeTimeSlots([], 10);
      expect(result).toEqual([]);
    });

    it("should handle single slot", () => {
      const slots = [{ start: "10:00", end: "11:00", seatsLeft: 5 }];
      const result = mergeTimeSlots(slots, 10);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(slots[0]);
    });

    it("should handle mix of unique and duplicate slots", () => {
      const slots = [
        { start: "10:00", end: "11:00", seatsLeft: 8 },
        { start: "11:00", end: "12:00", seatsLeft: 5 },
        { start: "10:00", end: "11:00", seatsLeft: 2 },
        { start: "12:00", end: "13:00", seatsLeft: 6 },
        { start: "11:00", end: "12:00", seatsLeft: 1 },
      ];
      const result = mergeTimeSlots(slots, 10);
      
      expect(result).toHaveLength(3);
      
      const slot1 = result.find(s => s.start === "10:00" && s.end === "11:00");
      const slot2 = result.find(s => s.start === "11:00" && s.end === "12:00");
      const slot3 = result.find(s => s.start === "12:00" && s.end === "13:00");
      
      expect(slot1?.seatsLeft).toBe(6); // 8 - 2
      expect(slot2?.seatsLeft).toBe(4); // 5 - 1
      expect(slot3?.seatsLeft).toBe(6);
    });

    it("should handle negative seatsLeft after merging", () => {
      const slots = [
        { start: "10:00", end: "11:00", seatsLeft: 3 },
        { start: "10:00", end: "11:00", seatsLeft: 5 },
      ];
      const result = mergeTimeSlots(slots, 10);
      
      expect(result[0].seatsLeft).toBe(-2); // 3 - 5
    });

    it("should preserve slot properties other than seatsLeft", () => {
      const slots = [
        { start: "10:00", end: "11:00", seatsLeft: 5 },
      ];
      const result = mergeTimeSlots(slots, 10);
      
      expect(result[0].start).toBe("10:00");
      expect(result[0].end).toBe("11:00");
    });
  });

  describe("Integration tests", () => {
    it("should work together: convert and calculate", () => {
      const start = "09:00";
      const end = "17:00";
      
      const minutes = minutesBetween(start, end);
      const startMinutes = convertToMinutes(start);
      const endMinutes = convertToMinutes(end);
      
      expect(minutes).toBe(endMinutes - startMinutes);
      expect(convertToString(startMinutes)).toBe(start);
      expect(convertToString(endMinutes)).toBe(end);
    });

    it("should handle business hours workflow", () => {
      const openTime = "09:00";
      const closeTime = "23:00";
      
      const totalMinutes = minutesBetween(openTime, closeTime);
      if (totalMinutes === null) {
        throw new Error("totalMinutes is null");
      }
      const slots = Math.floor(totalMinutes / 60); // 1-hour slots
      
      expect(slots).toBe(14);
      expect(totalMinutes).toBe(840);
    });
  });
});