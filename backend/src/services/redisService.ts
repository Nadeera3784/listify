import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

export const redisClient = createClient({
  url: process.env.REDIS_URI || 'redis://localhost:6379'
});

export const initRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
    
    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });
    
    return redisClient;
  } catch (error) {
    console.error('Redis connection error:', error);
    throw error;
  }
};

export const getCurrentAuction = async () => {
  try {
    return await redisClient.lIndex('auction:queue', 0);
  } catch (error) {
    console.error('Error getting current auction:', error);
    return null;
  }
};

export const addAuctionToQueue = async (auctionId: string) => {
  try {
    await redisClient.rPush('auction:queue', auctionId);
    return true;
  } catch (error) {
    console.error('Error adding auction to queue:', error);
    return false;
  }
};


export const removeCurrentAuction = async () => {
  try {
    await redisClient.lPop('auction:queue');
    return true;
  } catch (error) {
    console.error('Error removing current auction:', error);
    return false;
  }
};

export const getAuctionQueue = async () => {
  try {
    return await redisClient.lRange('auction:queue', 0, -1);
  } catch (error) {
    console.error('Error getting auction queue:', error);
    return [];
  }
};

export const getAuctionData = async (auctionId: string) => {
  try {
    const data = await redisClient.hGetAll(`auction:${auctionId}`);
    return data;
  } catch (error) {
    console.error(`Error getting auction ${auctionId} from Redis:`, error);
    return null;
  }
};

export const setAuctionData = async (auctionId: string, data: Record<string, string>) => {
  try {
    await redisClient.hSet(`auction:${auctionId}`, data);
    return true;
  } catch (error) {
    console.error(`Error setting auction ${auctionId} in Redis:`, error);
    return false;
  }
};

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

export const updateAuctionStatus = async (auctionId: string, status: string) => {
  try {
    await redisClient.hSet(`auction:${auctionId}`, { status });
    return true;
  } catch (error) {
    console.error(`Error updating auction ${auctionId} status in Redis:`, error);
    return false;
  }
};

export const deleteAuctionData = async (auctionId: string) => {
  try {
    await redisClient.del(`auction:${auctionId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting auction ${auctionId} from Redis:`, error);
    return false;
  }
};

export const getAuctionStatus = async (auctionId: string) => {
  try {
    return await redisClient.hGet(`auction:${auctionId}`, 'status');
  } catch (error) {
    console.error('Error getting auction status:', error);
    return null;
  }
}; 