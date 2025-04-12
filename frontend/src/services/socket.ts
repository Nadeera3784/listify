import { io, Socket } from 'socket.io-client';
import { Auction, Bid } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
export const socket: Socket = io(SOCKET_URL);

socket.on('connect', () => {
  console.log('Socket connected');
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});

export const getSocket = (): Socket => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) socket.disconnect();
};

export const placeBid = (auctionId: string, amount: number, userId: string): void => {
  socket.emit('placeBid', { auctionId, amount, userId });
};

export const updateAuctionStatus = (auctionId: string, status: string, winningUserId?: string): void => {
  socket.emit('updateAuctionStatus', { auctionId, status, winningUserId });
};

export const subscribeToAuctionUpdates = (
  auctionId: string,
  callback: (auction: Auction, bid?: Bid) => void
): void => {
  socket.on(`auction:${auctionId}:update`, (data: { auction: Auction; bid?: Bid }) => {
    callback(data.auction, data.bid);
  });
};

export const subscribeToBidErrors = (
  auctionId: string,
  callback: (error: string) => void
): void => {
  socket.on('bidError', (data: { auctionId: string, error: string }) => {
    if (data.auctionId === auctionId) {
      callback(data.error);
    }
  });
};

export const subscribeToNewBids = (
  auctionId: string,
  callback: (bid: Bid) => void
): void => {
  socket.on(`auction:${auctionId}:newBid`, (bid: Bid) => {
    callback(bid);
  });
};

export const subscribeToAuctionCompletion = (
  auctionId: string,
  callback: (status: string, winningUserId: string | null) => void
): void => {
  socket.on(`auction:${auctionId}:completed`, (data: { status: string; winningUserId: string | null }) => {
    callback(data.status, data.winningUserId);
  });
};

export const unsubscribeFromAuctionUpdates = (auctionId: string): void => {
  socket.off(`auction:${auctionId}:update`);
  socket.off(`auction:${auctionId}:newBid`);
  socket.off(`auction:${auctionId}:completed`);
  socket.off('bidError');
}; 