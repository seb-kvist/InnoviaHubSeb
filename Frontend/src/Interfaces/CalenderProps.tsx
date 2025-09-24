export interface CalendarProps {
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  variant?: "popup" | "full";
}
