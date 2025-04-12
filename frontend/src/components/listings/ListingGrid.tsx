import { useState } from 'react';
import { Link } from 'react-router-dom';
import ListingCard from './ListingCard';
import { useListings } from '../../hooks/useListings';
import { useCategories } from '../../hooks/useCategories';
import Pagination from '../ui/Pagination';

const ListingGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSearch, setTempSearch] = useState('');
  
  const { listings, loading, error, page, totalPages, setPage } = useListings({
    category: selectedCategory,
    search: searchTerm,
    limit: 8,
  });
  
  const { categories } = useCategories();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(tempSearch);
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setPage(1);
  };
  
  if (loading && listings.length === 0) {
    return (
      <div className="py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading listings...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <section className="py-10">
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Listings</h2>
          <Link 
            to="/listings" 
            className="text-indigo-600 hover:text-indigo-800"
          >
            View All
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-grow">
            <div className="relative">
              <input
                type="text"
                placeholder="Search listings..."
                value={tempSearch}
                onChange={(e) => setTempSearch(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-md hover:bg-indigo-700"
              >
                Search
              </button>
            </div>
          </form>
          
          <div className="w-full md:w-1/3">
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {listings.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">No listings found. Try different search criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              className="mt-8"
            />
          )}
          
          <div className="mt-8 text-center">
            <Link
              to="/listings"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md"
            >
              Browse All Listings
            </Link>
          </div>
        </>
      )}
    </section>
  );
};

export default ListingGrid; 