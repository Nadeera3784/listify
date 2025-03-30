import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Create Redis client
export const redisClient = createClient({
  url: process.env.REDIS_URI || 'redis://localhost:6379'
});

// Initialize Redis connection
export const initRedis = async () => {
  try {
    // Connect to Redis
    await redisClient.connect();
    console.log('Connected to Redis');
    
    // Set up error handler
    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });
    
    return redisClient;
  } catch (error) {
    console.error('Redis connection error:', error);
    throw error;
  }
};

// Get the current auction (first item in queue)
export const getCurrentAuction = async () => {
  try {
    return await redisClient.lIndex('auction:queue', 0);
  } catch (error) {
    console.error('Error getting current auction:', error);
    return null;
  }
};

// Add an auction to the queue
export const addAuctionToQueue = async (auctionId: string) => {
  try {
    await redisClient.rPush('auction:queue', auctionId);
    return true;
  } catch (error) {
    console.error('Error adding auction to queue:', error);
    return false;
  }
};

// Remove the current auction from the queue
export const removeCurrentAuction = async () => {
  try {
    await redisClient.lPop('auction:queue');
    return true;
  } catch (error) {
    console.error('Error removing current auction:', error);
    return false;
  }
};

// Get all auctions in the queue
export const getAuctionQueue = async () => {
  try {
    return await redisClient.lRange('auction:queue', 0, -1);
  } catch (error) {
    console.error('Error getting auction queue:', error);
    return [];
  }
};

// Get auction data from Redis
export const getAuctionData = async (auctionId: string) => {
  try {
    const data = await redisClient.hGetAll(`auction:${auctionId}`);
    return data;
  } catch (error) {
    console.error(`Error getting auction ${auctionId} from Redis:`, error);
    return null;
  }
};

// Set auction data in Redis
export const setAuctionData = async (auctionId: string, data: Record<string, string>) => {
  try {
    await redisClient.hSet(`auction:${auctionId}`, data);
    return true;
  } catch (error) {
    console.error(`Error setting auction ${auctionId} in Redis:`, error);
    return false;
  }
};

// Update auction bid in Redis
export const updateAuctionBid = async (
  auctionId: string,
  currentBid: number,
  numberOfBids: number
) => {
  try {
    await redisClient.hSet(`auction:${auctionId}`, {
      currentBid: currentBid.toString(),
      numberOfBids: numberOfBids.toString()
    });
    return true;
  } catch (error) {
    console.error(`Error updating auction ${auctionId} bid in Redis:`, error);
    return false;
  }
};

// Update auction status in Redis
export const updateAuctionStatus = async (auctionId: string, status: string) => {
  try {
    await redisClient.hSet(`auction:${auctionId}`, { status });
    return true;
  } catch (error) {
    console.error(`Error updating auction ${auctionId} status in Redis:`, error);
    return false;
  }
};

// Delete auction from Redis
export const deleteAuctionData = async (auctionId: string) => {
  try {
    await redisClient.del(`auction:${auctionId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting auction ${auctionId} from Redis:`, error);
    return false;
  }
};

// Get auction status from Redis
export const getAuctionStatus = async (auctionId: string) => {
  try {
    return await redisClient.hGet(`auction:${auctionId}`, 'status');
  } catch (error) {
    console.error('Error getting auction status:', error);
    return null;
  }
}; 