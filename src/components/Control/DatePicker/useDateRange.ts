import { useMemo } from "react";
import { SelectDate } from "../type";

const useDateRange = (year: number, month: number) => {
  const lastDateOfMonth = new Date(year, month + 1, 0).getDate();

  const lastDateOfPrevMonth = new Date(year, month, 0).getDate();

  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const lastDayOfMonth = new Date(year, month, lastDateOfMonth).getDay();

  const getDate = (fullDate: Date, date: number, type: "main" | "sub") => {
    return {
      type,
      fullDate,
      date,
      day: fullDate.getDay(),
      month: fullDate.getMonth(),
      year: fullDate.getFullYear(),
    };
  };

  const dateRange = useMemo(() => {
    const dates: SelectDate[] = [];

    for (let i = firstDayOfMonth; i > 0; i--) {
      const date = lastDateOfPrevMonth - i + 1;
      const newDate = new Date(year, month - 1, date);
      dates.push(getDate(newDate, date, "sub"));
    }

    for (let i = 1; i <= lastDateOfMonth; i++) {
      const newDate = new Date(year, month, i);
      dates.push(getDate(newDate, i, "main"));
    }

    for (let i = lastDayOfMonth; i < 6; i++) {
      const date = i - lastDayOfMonth + 1;
      const newDate = new Date(year, month + 1, date);
      dates.push(getDate(newDate, date, "sub"));
    }

    return dates;
  }, [lastDateOfMonth, lastDateOfPrevMonth, firstDayOfMonth, lastDayOfMonth]);

  return dateRange;
};

export default useDateRange;
