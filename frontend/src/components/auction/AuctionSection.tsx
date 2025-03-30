import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuctionCard from './AuctionCard';
import { useAuctions } from '../../hooks/useAuctions';

const AuctionSection = () => {
  const [activeStatus, setActiveStatus] = useState<string>('ACCEPTING_BID');
  
  const { auctions, loading, error } = useAuctions({
    status: activeStatus,
    limit: 4,
  });
  
  // Status tabs
  const statusTabs = [
    { id: 'ACCEPTING_BID', label: 'Live Auctions' },
    { id: 'SCHEDULED', label: 'Upcoming' },
    { id: 'SOLD', label: 'Recently Sold' },
  ];
  
  if (loading && auctions.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-gray-800">Featured Auctions</h2>
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <div className="animate-spin rounded-full h-14 w-14 border-t-3 border-b-3 border-indigo-600 mx-auto"></div>
            <p className="mt-6 text-gray-600 font-medium">Loading auctions...</p>
          </div>
        </div>
      </section>
    );
  }
  
  if (error) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-gray-800">Featured Auctions</h2>
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-lg mb-4">
            <p className="font-medium">{error}</p>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Featured Auctions</h2>
          <Link 
            to="/auctions" 
            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center group"
          >
            View All
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-1 mb-8 inline-flex">
          <div className="flex border-0">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                className={`py-2.5 px-5 font-medium text-sm rounded-lg transition-all duration-200 ${
                  activeStatus === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setActiveStatus(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {auctions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.7 18.29L3 21v-5.59a9 9 0 1118 0V21l-3.7-2.71A9 9 0 016.7 18.29z" />
            </svg>
            <p className="text-gray-600 text-lg mb-2">No auctions found</p>
            <p className="text-gray-500">Check back later or try a different category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {auctions.map((auction) => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>
        )}
        
        <div className="mt-10 text-center">
          <Link
            to="/auctions"
            className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg shadow-md transition-colors duration-300"
          >
            Browse All Auctions
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AuctionSection; 