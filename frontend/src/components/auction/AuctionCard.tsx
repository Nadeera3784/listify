import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Auction } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { auctionsAPI } from '../../services/api';
import { formatImageUrl } from '../../utils';

interface AuctionCardProps {
  auction: Auction;
  showWonBadge?: boolean;
  showActions?: boolean;
  onDelete?: (auctionId: string) => void;
}

const AuctionCard = ({ 
  auction, 
  showWonBadge = false, 
  showActions = false,
  onDelete 
}: AuctionCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const imageUrl = auction.imageUrls && auction.imageUrls.length > 0
    ? auction.imageUrls[0]
    : 'https://via.placeholder.com/300x200';
  
  const categoryName = typeof auction.category === 'string'
    ? auction.category
    : auction.category.name;
    
  const discountPercentage = auction.discount;
  
  const isOwner = user && user._id === (typeof auction.user === 'string' 
    ? auction.user 
    : auction.user._id);
  
  const isWinner = user && auction.status === 'SOLD' && auction.winningUser && 
    (typeof auction.winningUser === 'string' 
      ? auction.winningUser === user._id 
      : auction.winningUser._id === user._id);
  
  const statusText = () => {
    switch (auction.status) {
      case 'SCHEDULED':
        return 'Coming Soon';
      case 'ACCEPTING_BID':
        return 'Live Now';
      case 'GOING_ONCE':
        return 'Going Once!';
      case 'GOING_TWICE':
        return 'Going Twice!';
      case 'SOLD':
        return 'Sold';
      case 'UNSOLD':
        return 'Ended';
      default:
        return auction.status;
    }
  };
  
  const statusColor = () => {
    switch (auction.status) {
      case 'SCHEDULED':
        return 'bg-blue-600';
      case 'ACCEPTING_BID':
        return 'bg-emerald-600';
      case 'GOING_ONCE':
        return 'bg-amber-600';
      case 'GOING_TWICE':
        return 'bg-red-600';
      case 'SOLD':
        return 'bg-indigo-600';
      case 'UNSOLD':
        return 'bg-gray-600';
      default:
        return 'bg-gray-600';
    }
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/auction/${auction._id}/edit`);
  };
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this auction?')) {
      try {
        setIsDeleting(true);
        await auctionsAPI.deleteAuction(auction._id);
        
        if (onDelete) {
          onDelete(auction._id);
        }
      } catch (error) {
        console.error('Error deleting auction:', error);
        alert('Failed to delete auction');
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  return (
    <div className="group relative flex flex-col bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100">
      {discountPercentage > 0 && (
        <div className="absolute top-3 left-0 bg-red-600 text-white text-xs font-medium px-3 py-1 rounded-r-full shadow-sm z-20">
          {discountPercentage}% OFF
        </div>
      )}
      
      <div className={`absolute top-3 right-0 ${statusColor()} text-white text-xs font-medium px-3 py-1 rounded-l-full shadow-sm z-20`}>
        {statusText()}
      </div>
      
      {(showWonBadge || isWinner) && (
        <div className="absolute top-14 right-0 bg-yellow-500 text-white text-xs font-medium px-3 py-1 rounded-l-full shadow-sm z-20">
          You Won!
        </div>
      )}
      
      {showActions && isOwner && (
        <div className="absolute top-3 left-3 space-x-2 z-30">
          <button
            onClick={handleEdit}
            className="bg-white/90 hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-full p-2 shadow-md transition-colors duration-200"
            title="Edit auction"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="bg-white/90 hover:bg-red-600 hover:text-white text-red-600 rounded-full p-2 shadow-md transition-colors duration-200"
            title="Delete auction"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      )}
      
      <Link to={`/auction/${auction._id}`} className="block relative">
        <div className="h-52 overflow-hidden bg-gray-100">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
          <img
            src={formatImageUrl(imageUrl)}
            alt={auction.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
      
      <div className="p-5 flex-grow flex flex-col">
        <Link to={`/auction/${auction._id}`} className="block mb-2">
          <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-indigo-600 transition-colors">{auction.title}</h3>
        </Link>
        
        <p className="text-gray-600 text-sm h-12 overflow-hidden mb-4">
          {auction.description.length > 100
            ? `${auction.description.substring(0, 100)}...`
            : auction.description}
        </p>
        
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Bid</p>
              <p className="text-xl font-bold text-indigo-600">${auction.currentBid.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Starting Bid</p>
              <p className="text-sm text-gray-700">${auction.startingBid.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-medium">
              {categoryName}
            </span>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">
              Bids: {auction.numberOfBids}
            </span>
          </div>
        </div>
      </div>
      
      <Link
        to={`/auction/${auction._id}`}
        className={`block w-full text-center py-3 text-white font-medium transition-colors duration-300 ${
          ['ACCEPTING_BID', 'GOING_ONCE', 'GOING_TWICE'].includes(auction.status)
            ? 'bg-indigo-600 hover:bg-indigo-700'
            : 'bg-gray-600 hover:bg-gray-700'
        }`}
      >
        {['ACCEPTING_BID', 'GOING_ONCE', 'GOING_TWICE'].includes(auction.status) ? 'Place Bid' : 'View Details'}
      </Link>
    </div>
  );
};

export default AuctionCard; 