import { useState, useEffect } from 'react';
import { Listing } from '../types';
import { listingsAPI } from '../services/api';

interface UseListingsReturn {
  listings: Listing[];
  loading: boolean;
  error: string | null;
  totalListings: number;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
}

interface UseListingsParams {
  search?: string;
  category?: string;
  limit?: number;
  initialPage?: number;
}

export const useListings = ({
  search = '',
  category = '',
  limit = 10,
  initialPage = 1,
}: UseListingsParams = {}): UseListingsReturn => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalListings, setTotalListings] = useState<number>(0);
  const [page, setPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(0);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: any = { page, limit };
      if (search) params.search = search;
      if (category) params.category = category;
      
      const response = await listingsAPI.getListings(params);
      const { listings, total, pages } = response.data;
      
      setListings(listings);
      setTotalListings(total);
      setTotalPages(pages);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [page, search, category, limit]);

  return {
    listings,
    loading,
    error,
    totalListings,
    page,
    totalPages,
    setPage,
    refetch: fetchListings,
  };
}; 