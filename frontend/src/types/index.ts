export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

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

export interface Category {
  _id: string;
  name: string;
  slug: string;
}

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

export interface Bid {
  _id: string;
  auction: string;
  user: User | string;
  amount: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  error?: string;
  [key: string]: any;
} 