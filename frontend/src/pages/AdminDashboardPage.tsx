import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listingsAPI, auctionsAPI, categoriesAPI, usersAPI } from '../services/api';
import { Listing, Auction, Category, User } from '../types';
import { formatImageUrl } from '../utils';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('listings');
  const [listings, setListings] = useState<Listing[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (activeTab === 'listings') {
          const response = await listingsAPI.getListings({ limit: 20 });
          setListings(response.data.listings || []);
        } else if (activeTab === 'auctions') {
          const response = await auctionsAPI.getAuctions({ limit: 20 });
          setAuctions(response.data.auctions || []);
        } else if (activeTab === 'categories') {
          const response = await categoriesAPI.getCategories();
          setCategories(response.data.categories || []);
        } else if (activeTab === 'users') {
          const response = await usersAPI.getUsers();
          setUsers(response.data.users || []);
        }
      } catch (error: any) {
        setError(error.response?.data?.error || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleToggleAdmin = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      setActionLoading(userId);
      await usersAPI.updateUser(userId, { isAdmin: !isCurrentlyAdmin });
      
      // Update users list
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u._id === userId ? { ...u, isAdmin: !isCurrentlyAdmin } : u
        )
      );
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      setActionLoading(userId);
      await usersAPI.deleteUser(userId);
      
      setUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const tabs = [
    { id: 'listings', label: 'Listings' },
    { id: 'auctions', label: 'Auctions' },
    { id: 'categories', label: 'Categories' },
    { id: 'users', label: 'Users' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="flex border-b bg-gray-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`py-3 px-6 font-medium ${
                activeTab === tab.id
                  ? 'border-b-2 border-indigo-600 text-indigo-600 bg-white'
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
              {activeTab === 'listings' && (
                <div>
                  <div className="flex justify-between mb-6">
                    <h2 className="text-xl font-semibold">Manage Listings</h2>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md">
                      Add New Listing
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {listings.length === 0 ? (
                          <tr>
                            <td className="px-6 py-4 text-center text-gray-500" colSpan={5}>
                              No listings found
                            </td>
                          </tr>
                        ) : (
                          listings.map((listing) => (
                            <tr key={listing._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0">
                                    <img
                                      className="h-10 w-10 rounded-md object-cover"
                                      src={formatImageUrl(listing.imageUrls[0] || 'https://via.placeholder.com/100')}
                                      alt={listing.title}
                                    />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {listing.title}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">${listing.price.toFixed(2)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{listing.location}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {typeof listing.category === 'string'
                                    ? listing.category
                                    : listing.category.name}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <Link
                                  to={`/listing/${listing._id}`}
                                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                                >
                                  View
                                </Link>
                                <Link
                                  to={`/admin/listings/edit/${listing._id}`}
                                  className="text-yellow-600 hover:text-yellow-900 mr-3"
                                >
                                  Edit
                                </Link>
                                <button className="text-red-600 hover:text-red-900">
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'auctions' && (
                <div>
                  <div className="flex justify-between mb-6">
                    <h2 className="text-xl font-semibold">Manage Auctions</h2>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md">
                      Add New Auction
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Current Bid
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            # Bids
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {auctions.length === 0 ? (
                          <tr>
                            <td className="px-6 py-4 text-center text-gray-500" colSpan={5}>
                              No auctions found
                            </td>
                          </tr>
                        ) : (
                          auctions.map((auction) => (
                            <tr key={auction._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0">
                                    <img
                                      className="h-10 w-10 rounded-md object-cover"
                                      src={formatImageUrl(auction.imageUrls[0] || 'https://via.placeholder.com/100')}
                                      alt={auction.title}
                                    />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {auction.title}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  ${auction.currentBid.toFixed(2)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{auction.numberOfBids}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    auction.status === 'ACCEPTING_BID'
                                      ? 'bg-green-100 text-green-800'
                                      : auction.status === 'SCHEDULED'
                                      ? 'bg-blue-100 text-blue-800'
                                      : auction.status === 'SOLD'
                                      ? 'bg-indigo-100 text-indigo-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {auction.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <Link
                                  to={`/auction/${auction._id}`}
                                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                                >
                                  View
                                </Link>
                                <Link
                                  to={`/admin/auctions/edit/${auction._id}`}
                                  className="text-yellow-600 hover:text-yellow-900 mr-3"
                                >
                                  Edit
                                </Link>
                                <button className="text-red-600 hover:text-red-900">
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'categories' && (
                <div>
                  <div className="flex justify-between mb-6">
                    <h2 className="text-xl font-semibold">Manage Categories</h2>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md">
                      Add New Category
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.length === 0 ? (
                      <div className="col-span-full text-center py-4 text-gray-500">
                        No categories found
                      </div>
                    ) : (
                      categories.map((category) => (
                        <div
                          key={category._id}
                          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-medium">{category.name}</h3>
                            <div className="flex space-x-2">
                              <button className="text-yellow-600 hover:text-yellow-900">
                                Edit
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                Delete
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500">Slug: {category.slug}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div>
                  <div className="flex justify-between mb-6">
                    <h2 className="text-xl font-semibold">Manage Users</h2>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.length === 0 ? (
                          <tr>
                            <td className="px-6 py-4 text-center text-gray-500" colSpan={4}>
                              No users found
                            </td>
                          </tr>
                        ) : (
                          users.map((userData) => (
                            <tr key={userData._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <span className="text-indigo-600 font-medium text-sm">
                                      {userData.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {userData.name}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{userData.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    userData.isAdmin
                                      ? 'bg-purple-100 text-purple-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {userData.isAdmin ? 'Admin' : 'User'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button
                                  className={`mr-3 ${
                                    userData.isAdmin ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'
                                  } ${user?.email === userData.email ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  onClick={() => user?.email !== userData.email && handleToggleAdmin(userData._id, userData.isAdmin)}
                                  disabled={user?.email === userData.email || actionLoading === userData._id}
                                >
                                  {actionLoading === userData._id ? 'Updating...' : userData.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                </button>
                                <button
                                  className={`text-red-600 hover:text-red-900 ${user?.email === userData.email ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  onClick={() => user?.email !== userData.email && handleDeleteUser(userData._id)}
                                  disabled={user?.email === userData.email || actionLoading === userData._id}
                                >
                                  {actionLoading === userData._id ? 'Deleting...' : 'Delete'}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage; 