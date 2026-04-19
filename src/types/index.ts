export type UserRole = 'client' | 'freelancer' | 'company' | 'employee' | 'admin';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
}

export interface Location {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  type: string;
  city: string;
  address: string; // Only visible to employees/admin
  pricePerDay: number;
  photos: string[];
  status: 'pending' | 'active' | 'inactive';
  coordinates?: { lat: number; lng: number };
}

export interface Equipment {
  id: string;
  companyId: string;
  name: string;
  description: string;
  pricePerDay: number;
  photos: string[];
  status: 'available' | 'rented' | 'maintenance';
  conditionEvidence?: {
    photo: string;
    description: string;
    timestamp: string;
  };
}

export interface Talent {
  id: string;
  userId: string;
  type: 'model' | 'crew';
  experience: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  skinTone?: string;
  height?: number;
  weight?: number;
  location: string;
  positions?: string[]; // e.g., ["DP", "1st AC"]
  availability: {
    date: string;
    title: string;
    isExternal: boolean;
  }[];
}

export interface Booking {
  id: string;
  clientId: string;
  serviceId: string;
  serviceType: 'location' | 'equipment' | 'talent';
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export interface Review {
  id: string;
  targetId: string;
  authorId: string;
  authorName: string;
  rating: number;
  comment: string;
  timestamp: string;
}
