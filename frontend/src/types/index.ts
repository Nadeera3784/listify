// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token?: string;
}

// Auth state types
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Listing types
export interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  phoneNumber?: string;
  condition?: string;
  imageUrls: string[];
  category: Category | string;
  user: User | string;
  createdAt: string;
  updatedAt: string;
}

// Category types
export interface Category {
  _id: string;
  name: string;
  slug: string;
}

// Auction types
export interface Auction {
  _id: string;
  title: string;
  description: string;
  imageUrls: string[];
  startingBid: number;
  currentBid: number;
  numberOfBids: number;
  status: 'SCHEDULED' | 'ACCEPTING_BID' | 'GOING_ONCE' | 'GOING_TWICE' | 'SOLD' | 'UNSOLD';
  winningUser?: User | string;
  discount: number;
  category: Category | string;
  user: User | string;
  createdAt: string;
  updatedAt: string;
}

// Bid types
export interface Bid {
  _id: string;
  auction: string;
  user: User | string;
  amount: number;
  createdAt: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  error?: string;
  [key: string]: any;
} 