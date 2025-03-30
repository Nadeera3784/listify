import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listingsAPI, auctionsAPI } from '../services/api';
import { Listing, Auction } from '../types';
import ListingCard from '../components/listings/ListingCard';
import AuctionCard from '../components/auction/AuctionCard';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('myListings');
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [userAuctions, setUserAuctions] = useState<Auction[]>([]);
  const [wonAuctions, setWonAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        if (activeTab === 'myListings') {
          const response = await listingsAPI.getListings({ user: user._id });
          setUserListings(response.data.listings || []);
        } else if (activeTab === 'myAuctions') {
          const response = await auctionsAPI.getAuctions({ user: user._id });
          setUserAuctions(response.data.auctions || []);
        } else if (activeTab === 'wonAuctions') {
          const response = await auctionsAPI.getWonAuctions();
          setWonAuctions(response.data.auctions || []);
        }
      } catch (error: any) {
        setError(error.response?.data?.error || 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [activeTab, user]);

  const handleDeleteListing = (listingId: string) => {
    setUserListings(prev => prev.filter(listing => listing._id !== listingId));
  };

  const handleDeleteAuction = (auctionId: string) => {
    setUserAuctions(prev => prev.filter(auction => auction._id !== auctionId));
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'myListings', label: 'My Listings' },
    { id: 'myAuctions', label: 'My Auctions' },
    { id: 'wonAuctions', label: 'Won Auctions' },
    { id: 'accountSettings', label: 'Account Settings' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              {user.isAdmin && (
                <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200">
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`py-4 px-6 text-center ${
                  activeTab === tab.id
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error}</p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            ) : (
              <>
                {activeTab === 'myListings' && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">My Listings</h2>
                      <button 
                        onClick={() => navigate('/create-listing')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
                      >
                        Create New Listing
                      </button>
                    </div>
                    
                    {userListings.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">You haven't created any listings yet.</p>
                        <button 
                          onClick={() => navigate('/create-listing')}
                          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
                        >
                          Create Your First Listing
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userListings.map((listing) => (
                          <ListingCard 
                            key={listing._id} 
                            listing={listing} 
                            showActions={true}
                            onDelete={handleDeleteListing}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'myAuctions' && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">My Auctions</h2>
                      <button 
                        onClick={() => navigate('/create-auction')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
                      >
                        Create New Auction
                      </button>
                    </div>
                    
                    {userAuctions.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">You haven't created any auctions yet.</p>
                        <button 
                          onClick={() => navigate('/create-auction')}
                          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
                        >
                          Create Your First Auction
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userAuctions.map((auction) => (
                          <AuctionCard 
                            key={auction._id} 
                            auction={auction} 
                            showActions={true}
                            onDelete={handleDeleteAuction}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'wonAuctions' && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Won Auctions</h2>
                    </div>
                    
                    {wonAuctions.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">You haven't won any auctions yet.</p>
                        <button 
                          onClick={() => navigate('/')}
                          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
                        >
                          Browse Auctions
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wonAuctions.map((auction) => (
                          <AuctionCard key={auction._id} auction={auction} showWonBadge={true} />
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'accountSettings' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p className="text-gray-600 mb-4">Update your personal information and preferences.</p>
                      <form className="space-y-4">
                        <div>
                          <label className="block text-gray-700 mb-2" htmlFor="name">
                            Name
                          </label>
                          <input
                            id="name"
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            defaultValue={user.name}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-2" htmlFor="email">
                            Email
                          </label>
                          <input
                            id="email"
                            type="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            defaultValue={user.email}
                            disabled
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-2" htmlFor="password">
                            New Password
                          </label>
                          <input
                            id="password"
                            type="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            placeholder="Leave blank to keep current password"
                          />
                        </div>
                        <button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
                        >
                          Save Changes
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 