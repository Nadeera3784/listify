import { io, Socket } from 'socket.io-client';
import { Auction, Bid } from '../types';

// Initialize socket connection with the server
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
export const socket: Socket = io(SOCKET_URL);

// Event listeners
socket.on('connect', () => {
  console.log('Socket connected');
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});

// Get socket instance
export const getSocket = (): Socket => {
  return socket;
};

// Disconnect socket
export const disconnectSocket = (): void => {
  if (socket) socket.disconnect();
};

// Emit auction events
export const placeBid = (auctionId: string, amount: number, userId: string): void => {
  socket.emit('placeBid', { auctionId, amount, userId });
};

export const updateAuctionStatus = (auctionId: string, status: string, winningUserId?: string): void => {
  socket.emit('updateAuctionStatus', { auctionId, status, winningUserId });
};

// Subscribe to auction updates
export const subscribeToAuctionUpdates = (
  auctionId: string,
  callback: (auction: Auction, bid?: Bid) => void
): void => {
  socket.on(`auction:${auctionId}:update`, (data: { auction: Auction; bid?: Bid }) => {
    callback(data.auction, data.bid);
  });
};

// Subscribe to bid errors
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

// Subscribe to new bids
export const subscribeToNewBids = (
  auctionId: string,
  callback: (bid: Bid) => void
): void => {
  socket.on(`auction:${auctionId}:newBid`, (bid: Bid) => {
    callback(bid);
  });
};

// Subscribe to auction completion events
export const subscribeToAuctionCompletion = (
  auctionId: string,
  callback: (status: string, winningUserId: string | null) => void
): void => {
  socket.on(`auction:${auctionId}:completed`, (data: { status: string; winningUserId: string | null }) => {
    callback(data.status, data.winningUserId);
  });
};

// Unsubscribe from auction updates
export const unsubscribeFromAuctionUpdates = (auctionId: string): void => {
  socket.off(`auction:${auctionId}:update`);
  socket.off(`auction:${auctionId}:newBid`);
  socket.off(`auction:${auctionId}:completed`);
  socket.off('bidError');
}; 