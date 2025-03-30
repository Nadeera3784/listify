import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Listing } from '../../types';
import { listingsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatImageUrl } from '../../utils';

interface ListingCardProps {
  listing: Listing;
  showActions?: boolean;
  onDelete?: (listingId: string) => void;
}

const ListingCard = ({ listing, showActions = false, onDelete }: ListingCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Get first image or use placeholder
  const imageUrl = listing.imageUrls && listing.imageUrls.length > 0
    ? listing.imageUrls[0]
    : 'https://via.placeholder.com/300x200';
  
  // Format category name
  const categoryName = typeof listing.category === 'string'
    ? listing.category
    : listing.category.name;
    
  // Check if the current user is the owner
  const isOwner = user && user._id === (typeof listing.user === 'string' ? listing.user : listing.user._id);
  
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/listing/${listing._id}/edit`);
  };
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        setIsDeleting(true);
        await listingsAPI.deleteListing(listing._id);
        
        if (onDelete) {
          onDelete(listing._id);
        }
      } catch (error) {
        console.error('Error deleting listing:', error);
        alert('Failed to delete listing');
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
      {showActions && isOwner && (
        <div className="absolute top-2 right-2 space-x-2 z-10">
          <button
            onClick={handleEdit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 shadow-md"
            title="Edit listing"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-md"
            title="Delete listing"
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
      <Link to={`/listing/${listing._id}`}>
        <img 
          src={formatImageUrl(imageUrl)} 
          alt={listing.title} 
          className="w-full h-48 object-cover"
        />
      </Link>
      <div className="p-4">
        <Link to={`/listing/${listing._id}`} className="block">
          <h3 className="text-xl font-semibold truncate mb-1">{listing.title}</h3>
        </Link>
        <p className="text-gray-500 text-sm mb-2">{listing.location}</p>
        <p className="text-gray-600 h-12 overflow-hidden text-sm mb-3">
          {listing.description.length > 100
            ? `${listing.description.substring(0, 100)}...`
            : listing.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-indigo-600 font-bold">${listing.price.toFixed(2)}</span>
          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
            {categoryName}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ListingCard; 