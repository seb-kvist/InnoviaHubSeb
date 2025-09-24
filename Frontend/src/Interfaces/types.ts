import type { ResourceType } from "./ResourceType";

export interface Booking {
  bookingId: number;
  userName: string;
  resourceName: string;
  date: string;
  timeSlot: string;
  status: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  bookings?: Booking[];
}

export interface Resource extends ResourceType {
  id: number;
  resourceName: string;
  resourceType: string;
  resourceTypeId: number;
  isBookable: boolean;
  
}
