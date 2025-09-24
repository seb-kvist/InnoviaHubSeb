export interface FreeSlotsProps {
  resourceId: number;
  date: string | Date;
}
export interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}
export interface ResourceImageAndDateProps {
  imgUrl: string;
  imgAlt: string;
  selectedDate: string;
}
