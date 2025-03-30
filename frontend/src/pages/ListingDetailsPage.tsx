import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import { Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl } from '../utils';

const ListingDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await listingsAPI.getListing(id);
        if (response.data.success) {
          setListing(response.data.listing);
        } else {
          setError(response.data.error || 'Failed to fetch listing');
        }
      } catch (error: any) {
        setError(error.response?.data?.error || 'Failed to fetch listing');
      } finally {
        setLoading(false);
      }
    };
    
    fetchListing();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this listing?')) return;
    
    try {
      await listingsAPI.deleteListing(id);
      navigate('/');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to delete listing');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-4 text-gray-600">Loading listing details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
        <p>{error || 'Listing not found'}</p>
        <Link to="/" className="text-red-700 underline mt-2 inline-block">
          Back to Home
        </Link>
      </div>
    );
  }

  // Check if user is the owner of this listing
  const isOwner = user && user._id === (typeof listing.user === 'string' ? listing.user : listing.user._id);
  
  // Get category name
  const categoryName = typeof listing.category === 'string'
    ? listing.category
    : listing.category.name;

  // Get seller name
  const sellerName = typeof listing.user === 'string'
    ? 'User'
    : listing.user.name;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4">
        <Link to="/" className="text-indigo-600 hover:text-indigo-800">
          &larr; Back to Listings
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="md:flex">
          {/* Image gallery */}
          <div className="md:w-1/2 p-4">
            <div className="relative pb-[75%] mb-4 rounded-lg overflow-hidden">
              <img
                src={formatImageUrl(listing.imageUrls[activeImage] || 'https://via.placeholder.com/600x450')}
                alt={listing.title}
                className="absolute h-full w-full object-cover rounded-lg"
              />
            </div>
            
            {listing.imageUrls.length > 1 && (
              <div className="flex space-x-2 mt-2 overflow-x-auto">
                {listing.imageUrls.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border-2 ${
                      activeImage === index ? 'border-indigo-600' : 'border-transparent'
                    }`}
                  >
                    <img src={formatImageUrl(img)} alt={`${listing.title} - ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Listing details */}
          <div className="md:w-1/2 p-6">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
              <p className="text-2xl font-bold text-indigo-600">${listing.price.toFixed(2)}</p>
            </div>
            
            <div className="flex items-center mb-4">
              <span className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded mr-2">
                {categoryName}
              </span>
              <span className="text-gray-500 text-sm">{listing.location}</span>
              {listing.condition && (
                <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded ml-2">
                  {listing.condition}
                </span>
              )}
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Seller Information</h2>
              <p className="text-gray-700">{sellerName}</p>
              {listing.phoneNumber && (
                <p className="text-gray-700 mt-1">
                  <span className="font-medium">Phone:</span> {listing.phoneNumber}
                </p>
              )}
            </div>
            
            <div className="mt-6 space-x-3">
              {isOwner ? (
                <>
                  <Link
                    to={`/listing/${listing._id}/edit`}
                    className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
                  >
                    Edit Listing
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md"
                  >
                    Delete Listing
                  </button>
                </>
              ) : (
                <button className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md">
                  Contact Seller
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailsPage; 