import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatImageUrl } from '../../utils';

export type AuctionItemType = {
  id: string;
  title: string;
  imageUrls: string[];
  currentBid: number;
  startingBid: number;
  numberOfBids: number;
  status: 'ACCEPTING_BID' | 'GOING_ONCE' | 'GOING_TWICE' | 'SOLD';
  winningUser?: {
    id: string;
    username: string;
  };
  discount: number;
};

type AuctionItemProps = {
  item: AuctionItemType;
  onPlaceBid: (itemId: string, amount: number) => void;
};

const AuctionItem = ({ item, onPlaceBid }: AuctionItemProps) => {
  const [bidAmount, setBidAmount] = useState<number>(item.currentBid + 1);
  
  const handlePlaceBid = () => {
    if (bidAmount > item.currentBid) {
      onPlaceBid(item.id, bidAmount);
    }
  };
  
  const getStatusColor = () => {
    switch (item.status) {
      case 'ACCEPTING_BID': return 'bg-green-500';
      case 'GOING_ONCE': return 'bg-yellow-500';
      case 'GOING_TWICE': return 'bg-orange-500';
      case 'SOLD': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getBidButtonText = () => {
    switch (item.status) {
      case 'ACCEPTING_BID': return 'Place Bid';
      case 'GOING_ONCE': return 'Last Chance!';
      case 'GOING_TWICE': return 'Final Chance!';
      case 'SOLD': return 'Sold';
      default: return 'Bid';
    }
  };
  
  const isSold = item.status === 'SOLD';
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 relative h-48 md:h-auto">
          <img
            src={formatImageUrl(item.imageUrls[0] || '/placeholder-image.jpg')}
            alt={item.title}
            className="absolute h-full w-full object-cover"
          />
          <div className={`absolute top-2 right-2 ${getStatusColor()} text-white text-xs font-bold px-2 py-1 rounded`}>
            {item.status.replace('_', ' ')}
          </div>
          {item.discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
              {item.discount}% OFF
            </div>
          )}
        </div>
        
        <div className="md:w-2/3 p-4">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold mb-2">{item.title}</h2>
            <Link to={`/item/${item.id}`} className="text-indigo-600 hover:underline text-sm">
              Details
            </Link>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-green-600">
                  Current Bid: ${item.currentBid.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  Starting at: ${item.startingBid.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {item.numberOfBids} {item.numberOfBids === 1 ? 'Bid' : 'Bids'}
                </p>
                {item.winningUser && (
                  <p className="text-xs text-gray-600">
                    Winning: {item.winningUser.username}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {!isSold && (
            <div className="flex items-center mt-4">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                min={item.currentBid + 1}
                step="1"
                className="w-24 px-2 py-1 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button
                onClick={handlePlaceBid}
                disabled={isSold}
                className={`px-4 py-1 ${
                  isSold
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white rounded-r-md`}
              >
                {getBidButtonText()}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionItem; 