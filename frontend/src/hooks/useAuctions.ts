import { useState, useEffect } from 'react';
import { Auction } from '../types';
import { auctionsAPI } from '../services/api';

interface UseAuctionsReturn {
  auctions: Auction[];
  loading: boolean;
  error: string | null;
  totalAuctions: number;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
}

interface UseAuctionsParams {
  status?: string;
  category?: string;
  limit?: number;
  initialPage?: number;
}

export const useAuctions = ({
  status = '',
  category = '',
  limit = 10,
  initialPage = 1,
}: UseAuctionsParams = {}): UseAuctionsReturn => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalAuctions, setTotalAuctions] = useState<number>(0);
  const [page, setPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(0);

  const fetchAuctions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: any = { page, limit };
      if (status) params.status = status;
      if (category) params.category = category;
      
      const response = await auctionsAPI.getAuctions(params);
      const { auctions, total, pages } = response.data;
      
      setAuctions(auctions);
      setTotalAuctions(total);
      setTotalPages(pages);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch auctions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [page, status, category, limit]);

  return {
    auctions,
    loading,
    error,
    totalAuctions,
    page,
    totalPages,
    setPage,
    refetch: fetchAuctions,
  };
}; 