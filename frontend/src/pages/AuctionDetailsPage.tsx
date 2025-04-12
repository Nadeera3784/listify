import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { auctionsAPI } from '../services/api';
import { Auction, Bid } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl } from '../utils';
import { 
  socket, 
  subscribeToAuctionUpdates, 
  unsubscribeFromAuctionUpdates, 
  updateAuctionStatus,
  subscribeToBidErrors,
  subscribeToAuctionCompletion
} from '../services/socket';

declare global {
  namespace NodeJS {
    interface Timeout {}
  }
}

const AuctionDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidLoading, setBidLoading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [newBidAnimation, setNewBidAnimation] = useState(false);
  const [bidPhaseTimer, setBidPhaseTimer] = useState<NodeJS.Timeout | null>(null);
  const [bidPhaseCountdown, setBidPhaseCountdown] = useState<number | null>(null);
  const lastBidTime = useRef<Date | null>(null);
  const bidTimeout = useRef<NodeJS.Timeout | null>(null);
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);
  const [completionMessage, setCompletionMessage] = useState('');
  const [timeSinceLastBid, setTimeSinceLastBid] = useState<number>(0);

  const minBidAmount = auction ? auction.currentBid + 1 : 0;

  const isOwner = user && auction && user._id === (typeof auction.user === 'string' 
    ? auction.user 
    : auction.user._id);

  const startBidPhaseTimer = () => {
    console.log("Starting bid phase timer");
    
    if (bidPhaseTimer) {
      clearTimeout(bidPhaseTimer as unknown as number);
      console.log("Cleared existing bid phase timer");
    }
    if (bidTimeout.current) {
      clearTimeout(bidTimeout.current as unknown as number);
      console.log("Cleared existing bid timeout");
    }
    
    setBidPhaseCountdown(null);
    
    lastBidTime.current = new Date();
    
    if (auction && auction.status === 'ACCEPTING_BID' && auction.numberOfBids > 0) {
      console.log("Setting timeout for Going Once phase - 5 seconds");
      
      const timeoutDuration = 5000; // Using 5 seconds for testing
      
      bidTimeout.current = setTimeout(() => {
        console.log("Timeout triggered, checking if we should go to Going Once");
        
        if (auction?.status === 'ACCEPTING_BID') {
          console.log("Starting Going Once countdown");
          // Start countdown for 5 seconds
          let countdown = 5; // Using 5 seconds for testing
          setBidPhaseCountdown(countdown);
          
          const interval = setInterval(() => {
            countdown -= 1;
            setBidPhaseCountdown(countdown);
            console.log(`Going Once countdown: ${countdown}`);
            
            if (countdown <= 0) {
              clearInterval(interval);
              console.log("Going Once countdown finished");
              
              if (user && id && user._id === (typeof auction.user === 'string' ? auction.user : auction.user._id)) {
                console.log("User is owner, updating auction status to GOING_ONCE");
                updateAuctionStatus(id, 'GOING_ONCE');
              } else if (user && id) {
                console.log("User is not owner, simulating status change locally");
                setAuction(prevAuction => {
                  if (prevAuction) {
                    return {
                      ...prevAuction,
                      status: 'GOING_ONCE' as const
                    };
                  }
                  return prevAuction;
                });
              }
            }
          }, 1000);
        
          setBidPhaseTimer(interval as unknown as NodeJS.Timeout);
        }
      }, timeoutDuration);
    }
  };

  const handleGoingOncePhase = () => {
    console.log("Handling Going Once phase");
    
    if (bidPhaseTimer) {
      clearTimeout(bidPhaseTimer as unknown as number);
      console.log("Cleared existing bid phase timer in Going Once");
    }
    
    if (auction && id) {
      console.log("Starting Going Twice countdown");
      // Using 5 seconds for testing purposes
      let countdown = 5;
      setBidPhaseCountdown(countdown);
      
      const interval = setInterval(() => {
        countdown -= 1;
        setBidPhaseCountdown(countdown);
        console.log(`Going Twice countdown: ${countdown}`);
        
        if (countdown <= 0) {
          clearInterval(interval);
          console.log("Going Twice countdown finished");
          
          if (user && user._id === (typeof auction.user === 'string' ? auction.user : auction.user._id)) {
            console.log("User is owner, updating auction status to GOING_TWICE");
            updateAuctionStatus(id, 'GOING_TWICE');
          } else if (user) {
            console.log("User is not owner, simulating status change locally");
            setAuction(prevAuction => {
              if (prevAuction) {
                return {
                  ...prevAuction,
                  status: 'GOING_TWICE' as const
                };
              }
              return prevAuction;
            });
          }
        }
      }, 1000);
      
      setBidPhaseTimer(interval as unknown as NodeJS.Timeout);
    }
  };

  const handleGoingTwicePhase = () => {
    console.log("Handling Going Twice phase");
    
    if (bidPhaseTimer) {
      clearTimeout(bidPhaseTimer as unknown as number);
      console.log("Cleared existing bid phase timer in Going Twice");
    }
    
    if (auction && id) {
      console.log("Starting Sold countdown");
      // Using 5 seconds for testing purposes
      let countdown = 5;
      setBidPhaseCountdown(countdown);
      
      const interval = setInterval(() => {
        countdown -= 1;
        setBidPhaseCountdown(countdown);
        console.log(`Sold countdown: ${countdown}`);
        
        if (countdown <= 0) {
          clearInterval(interval);
          console.log("Sold countdown finished");
          
          const currentAuction = auction;
          
          if (user && user._id === (typeof currentAuction.user === 'string' ? currentAuction.user : currentAuction.user._id)) {
            console.log("User is owner, updating auction status to SOLD");
            const highestBid = bids.length > 0 ? bids[0] : null;
            const winningUserId = highestBid ? (typeof highestBid.user === 'string' ? highestBid.user : highestBid.user._id) : null;
            
            if (winningUserId) {
              console.log(`Setting winner to: ${winningUserId}`);
              updateAuctionStatus(id, 'SOLD', winningUserId);
            } else {
              console.log("No bids, marking as UNSOLD");
              updateAuctionStatus(id, 'UNSOLD');
            }
          } else if (user) {
            console.log("User is not owner, simulating status change locally");
            const highestBid = bids.length > 0 ? bids[0] : null;
            
            setAuction(prevAuction => {
              if (prevAuction) {
                if (highestBid) {
                  return {
                    ...prevAuction,
                    status: 'SOLD' as const,
                    winningUser: highestBid.user
                  };
                } else {
                  return {
                    ...prevAuction,
                    status: 'UNSOLD' as const
                  };
                }
              }
              return prevAuction;
            });
          }
        }
      }, 1000);
      
      setBidPhaseTimer(interval as unknown as NodeJS.Timeout);
    }
  };

  useEffect(() => {
    const fetchAuctionData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {

        const auctionResponse = await auctionsAPI.getAuction(id);
        if (auctionResponse.data.success) {
          const auctionData = auctionResponse.data.auction;
          setAuction(auctionData);
          setBidAmount(auctionData.currentBid + 1);
          
          lastBidTime.current = new Date();
          
          const bidsResponse = await auctionsAPI.getBids(id);
          if (bidsResponse.data.success) {
            setBids(bidsResponse.data.bids);
            
            if (bidsResponse.data.bids.length > 0 && auctionData.status === 'ACCEPTING_BID') {
              setTimeout(() => {
                console.log("Starting bid phase timer after auction data load");
                lastBidTime.current = new Date(); 
                startBidPhaseTimer();
              }, 1000);
            } else if (auctionData.status === 'GOING_ONCE') {
              handleGoingOncePhase();
            } else if (auctionData.status === 'GOING_TWICE') {
              handleGoingTwicePhase();
            }
          }
        } else {
          setError(auctionResponse.data.error || 'Failed to fetch auction');
        }
      } catch (error: any) {
        setError(error.response?.data?.error || 'Failed to fetch auction data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAuctionData();
    
    const forceTimerStart = setTimeout(() => {
      console.log("Forcing timer start after component mount");
      if (auction && auction.status === 'ACCEPTING_BID' && auction.numberOfBids > 0) {
        startBidPhaseTimer();
      }
    }, 3000);
    
    if (id) {
      subscribeToAuctionUpdates(id, handleAuctionUpdate);
      subscribeToBidErrors(id, (error) => {
        setBidError(error);
        setBidLoading(false);
      });
      subscribeToAuctionCompletion(id, (status, winningUserId) => {
        let message = '';
        if (status === 'SOLD') {
          const winner = bids.find(bid => 
            (typeof bid.user === 'string' && bid.user === winningUserId) ||
            (typeof bid.user !== 'string' && bid.user._id === winningUserId)
          );
          
          const winnerName = winner 
            ? (typeof winner.user === 'string' 
              ? (user && winner.user === user._id ? 'You' : 'Another user') 
              : winner.user.name) 
            : 'A bidder';
          
          message = `Auction completed! ${winnerName} won with a bid of $${auction?.currentBid.toFixed(2)}`;
        } else {
          message = 'Auction ended without a sale.';
        }
        
        setCompletionMessage(message);
        setShowCompletionAlert(true);
        
        // Hide the alert after 5 seconds
        setTimeout(() => {
          setShowCompletionAlert(false);
        }, 5000);
      });
    }
    
    return () => {
      if (id) {
        unsubscribeFromAuctionUpdates(id);
      }
      if (bidPhaseTimer) {
        clearTimeout(bidPhaseTimer as unknown as number);
      }
      if (bidTimeout.current) {
        clearTimeout(bidTimeout.current as unknown as number);
      }
      clearTimeout(forceTimerStart);
    };
  }, [id]);

  useEffect(() => {
    if (!auction) return;
    
    if (auction.status === 'ACCEPTING_BID' && auction.numberOfBids > 0) {
      startBidPhaseTimer();
    } else if (auction.status === 'GOING_ONCE') {
      handleGoingOncePhase();
    } else if (auction.status === 'GOING_TWICE') {
      handleGoingTwicePhase();
    } else if (auction.status === 'SOLD' || auction.status === 'UNSOLD') {
      if (bidPhaseTimer) {
        clearTimeout(bidPhaseTimer as unknown as number);
        setBidPhaseTimer(null);
      }
      if (bidTimeout.current) {
        clearTimeout(bidTimeout.current as unknown as number);
        bidTimeout.current = null;
      }
      setBidPhaseCountdown(null);
    }
  }, [auction?.status]);

  useEffect(() => {
    console.log("Bids changed, bids count:", bids.length);
    if (auction && auction.status === 'ACCEPTING_BID' && bids.length > 0) {
      console.log("Restarting timer due to bid changes");
      startBidPhaseTimer();
    }
  }, [bids.length]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (auction && auction.status === 'ACCEPTING_BID' && auction.numberOfBids > 0) {
      intervalId = setInterval(() => {
        if (lastBidTime.current) {
          const now = new Date();
          const elapsedSeconds = Math.floor((now.getTime() - lastBidTime.current.getTime()) / 1000);
          setTimeSinceLastBid(elapsedSeconds);
        }
      }, 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId as unknown as number);
      }
    };
  }, [auction?.status, auction?.numberOfBids]);
  
  useEffect(() => {
    if (bids.length > 0) {
      lastBidTime.current = new Date();
      setTimeSinceLastBid(0);
    }
  }, [bids.length]);

  const handleAuctionUpdate = (updatedAuction: Auction, newBid?: Bid) => {
    setAuction(updatedAuction);
    
    if (newBid) {
      setNewBidAnimation(true);
      setTimeout(() => setNewBidAnimation(false), 1500);
      
      setBids(prevBids => {
        const bidExists = prevBids.some(b => b._id === newBid._id);
        if (bidExists) {
          return prevBids;
        }
        return [newBid, ...prevBids];
      });
      
      if (updatedAuction.status === 'GOING_ONCE' || updatedAuction.status === 'GOING_TWICE') {
        if (id && user && user._id === (typeof updatedAuction.user === 'string' 
          ? updatedAuction.user 
          : updatedAuction.user._id)) {
          console.log('Resetting auction status to ACCEPTING_BID after new bid during countdown');
          updateAuctionStatus(id, 'ACCEPTING_BID');
        } else {
          console.log('Locally resetting auction status for non-owners');
          setAuction(prevAuction => {
            if (prevAuction) {
              return {
                ...prevAuction,
                status: 'ACCEPTING_BID' as const
              };
            }
            return prevAuction;
          });
        }
        
        if (bidPhaseTimer) {
          clearTimeout(bidPhaseTimer as unknown as number);
          setBidPhaseTimer(null);
        }
        setBidPhaseCountdown(null);
      }
      
      lastBidTime.current = new Date();
      setTimeSinceLastBid(0);
      startBidPhaseTimer();
    }
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!auction || !id) return;
    
    const isOwner = typeof auction.user === 'string' 
      ? user._id === auction.user 
      : user._id === auction.user._id;
    
    if (isOwner) {
      setBidError('You cannot bid on your own auction');
      return;
    }
    
    // Validate bid amount
    if (bidAmount <= auction.currentBid) {
      setBidError(`Bid must be greater than current bid ($${auction.currentBid.toFixed(2)})`);
      return;
    }
    
    setBidError(null);
    setBidLoading(true);
    
    try {
      const response = await auctionsAPI.placeBid(id, { amount: bidAmount });
      if (response.data.success) {
        setBidAmount(Number(response.data.auction.currentBid) + 1);
      } else {
        setBidError(response.data.error || 'Failed to place bid');
      }
    } catch (error: any) {
      setBidError(error.response?.data?.error || 'Error placing bid');
    } finally {
      setBidLoading(false);
    }
  };

  const handleDeleteAuction = async () => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this auction?')) {
      try {
        await auctionsAPI.deleteAuction(id);
        navigate('/profile');
      } catch (error: any) {
        setError(error.response?.data?.error || 'Failed to delete auction');
      }
    }
  };

  const handleStartAuction = async () => {
    if (!id) return;
    
    try {
      await auctionsAPI.updateStatus(id, { status: 'ACCEPTING_BID' });
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to start auction');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-4 text-gray-600">Loading auction details...</p>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
        <p>{error || 'Auction not found'}</p>
        <Link to="/" className="text-red-700 underline mt-2 inline-block">
          Back to Home
        </Link>
      </div>
    );
  }

  const categoryName = typeof auction.category === 'string'
    ? auction.category
    : auction.category.name;

  const sellerName = typeof auction.user === 'string'
    ? 'User'
    : auction.user.name;

  const getStatusText = () => {
    switch (auction?.status) {
      case 'SCHEDULED':
        return 'Upcoming';
      case 'ACCEPTING_BID':
        return 'Live Now';
      case 'GOING_ONCE':
        return 'Going Once!';
      case 'GOING_TWICE':
        return 'Going Twice!';
      case 'SOLD':
        return 'Sold!';
      case 'UNSOLD':
        return 'Ended (No Sale)';
      default:
        return auction?.status || '';
    }
  };

  const getStatusClasses = () => {
    switch (auction?.status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'ACCEPTING_BID':
        return 'bg-green-100 text-green-800';
      case 'GOING_ONCE':
        return 'bg-yellow-100 text-yellow-800';
      case 'GOING_TWICE':
        return 'bg-orange-100 text-orange-800';
      case 'SOLD':
        return 'bg-indigo-100 text-indigo-800';
      case 'UNSOLD':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {showCompletionAlert && (
        <div className="fixed top-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded shadow-lg z-50 max-w-md">
          <p>{completionMessage}</p>
        </div>
      )}
      
      {bidPhaseCountdown !== null && (auction?.status === 'GOING_ONCE' || auction?.status === 'GOING_TWICE') && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40 pointer-events-none">
          <div className="text-center">
            <h2 className="text-6xl font-bold text-white mb-4 text-shadow-lg animate-pulse">
              {auction.status === 'GOING_ONCE' ? 'Going Once!' : 'Going Twice!'}
            </h2>
            <div className="bg-white rounded-full h-32 w-32 flex items-center justify-center mx-auto countdown-pulse">
              <span className="text-5xl font-bold text-red-600">{bidPhaseCountdown}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-4">
        <Link to="/" className="text-indigo-600 hover:text-indigo-800">
          &larr; Back to Auctions
        </Link>
      </div>
      
      <div className={`bg-white shadow-md rounded-lg overflow-hidden ${newBidAnimation ? 'bid-flash' : ''}`}>
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h1 className="text-2xl font-bold">{auction?.title}</h1>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClasses()}`}>
              {getStatusText()}
            </span>
            {bidPhaseCountdown !== null && (auction?.status === 'GOING_ONCE' || auction?.status === 'GOING_TWICE') && (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                <span className="font-bold">{bidPhaseCountdown}</span>s
              </span>
            )}
          </div>
        </div>
        
        <div className="md:flex">
          <div className="md:w-7/12 p-4">
            <div className={`relative pb-[75%] mb-4 rounded-lg overflow-hidden ${newBidAnimation ? 'ring-4 ring-green-500' : ''}`}>
              <img
                src={auction?.imageUrls[activeImage] ? formatImageUrl(auction.imageUrls[activeImage]) : 'https://via.placeholder.com/600x450'}
                alt={auction?.title}
                className="absolute h-full w-full object-cover rounded-lg"
              />
              {newBidAnimation && (
                <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                  <div className="text-white text-2xl font-bold bg-green-600 bg-opacity-75 px-4 py-2 rounded-lg">
                    New Bid!
                  </div>
                </div>
              )}
              {(auction?.status === 'GOING_ONCE' || auction?.status === 'GOING_TWICE') && (
                <div className="absolute top-2 right-2 bg-red-600 text-white font-bold px-3 py-2 rounded-lg animate-pulse opacity-90">
                  {auction.status === 'GOING_ONCE' ? 'Going Once!' : 'Going Twice!'} ({bidPhaseCountdown}s)
                </div>
              )}
            </div>
            
            {auction?.imageUrls.length > 1 && (
              <div className="flex space-x-2 mt-2 overflow-x-auto">
                {auction.imageUrls.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border-2 ${
                      activeImage === index ? 'border-indigo-600' : 'border-transparent'
                    }`}
                  >
                    <img src={formatImageUrl(img)} alt={`${auction.title} - ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{auction?.description}</p>
              
              <div className="mt-4 flex items-center">
                <span className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded mr-2">
                  {categoryName}
                </span>
                <span className="text-sm text-gray-500">
                  Listed by {sellerName}
                </span>
              </div>
            </div>
          </div>
          
          <div className="md:w-5/12 p-4 border-l">
            <div className={`mb-6 ${newBidAnimation ? 'bid-flash p-3 rounded-lg' : ''}`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Current Bid</h3>
                <span className="text-xs text-gray-500">{auction?.numberOfBids} bids placed</span>
              </div>
              <p className="text-3xl font-bold text-indigo-600">${auction?.currentBid.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">Starting bid: ${auction?.startingBid.toFixed(2)}</p>
              
              {auction?.status === 'SOLD' && (
                <div className="mt-2 bg-indigo-50 p-2 rounded border border-indigo-200">
                  <p className="text-indigo-800 font-medium">
                    {bids.length > 0 ? 
                      `Sold to ${typeof bids[0].user === 'string' ? 
                        (user && bids[0].user === user._id ? 'You' : 'User') : 
                        bids[0].user.name}!` : 
                      'Auction completed'}
                  </p>
                </div>
              )}
              
              {(auction?.status === 'GOING_ONCE' || auction?.status === 'GOING_TWICE') && (
                <div className={`mt-2 p-3 rounded-lg border ${auction.status === 'GOING_ONCE' ? 'bg-yellow-50 border-yellow-300' : 'bg-orange-50 border-orange-300'} animate-pulse`}>
                  <p className={`${auction.status === 'GOING_ONCE' ? 'text-yellow-800' : 'text-orange-800'} font-bold text-lg text-center`}>
                    {auction.status === 'GOING_ONCE' 
                      ? 'Going Once! Place your bid now!' 
                      : 'Going Twice! Final opportunity!'}
                  </p>
                  <div className="text-center mt-2">
                    <span className={`inline-block rounded-full bg-white w-10 h-10 flex items-center justify-center ${auction.status === 'GOING_ONCE' ? 'text-yellow-700' : 'text-orange-700'} font-bold text-xl border-2 ${auction.status === 'GOING_ONCE' ? 'border-yellow-400' : 'border-orange-400'} countdown-pulse`}>
                      {bidPhaseCountdown}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {(auction?.status === 'ACCEPTING_BID' || auction?.status === 'GOING_ONCE' || auction?.status === 'GOING_TWICE') && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Place Your Bid</h3>
                
                {bidError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
                    {bidError}
                  </div>
                )}
                
                {user && typeof auction.user === 'string' && user._id === auction.user && (
                  <div className="bg-blue-100 border border-blue-400 text-blue-700 px-3 py-2 rounded mb-3 text-sm">
                    You cannot bid on your own auction
                  </div>
                )}
                
                {user && typeof auction.user !== 'string' && user._id === auction.user._id && (
                  <div className="bg-blue-100 border border-blue-400 text-blue-700 px-3 py-2 rounded mb-3 text-sm">
                    You cannot bid on your own auction
                  </div>
                )}
                
                <form onSubmit={handlePlaceBid}>
                  <div className="flex mb-2">
                    <span className="inline-flex items-center px-3 bg-gray-200 text-gray-900 border border-r-0 border-gray-300 rounded-l-md">
                      $
                    </span>
                    <input
                      type="number"
                      min={minBidAmount}
                      step="0.01"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(parseFloat(e.target.value))}
                      className="rounded-r-md flex-1 block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={bidLoading || !user || (user && (
                      (typeof auction.user === 'string' && user._id === auction.user) ||
                      (typeof auction.user !== 'string' && user._id === auction.user._id)
                    ))}
                    className={`w-full py-2 px-4 rounded-md font-medium text-white ${
                      bidLoading || (user && (
                        (typeof auction.user === 'string' && user._id === auction.user) ||
                        (typeof auction.user !== 'string' && user._id === auction.user._id)
                      ))
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : user 
                          ? 'bg-indigo-600 hover:bg-indigo-700' 
                          : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {bidLoading 
                      ? 'Processing...' 
                      : user 
                        ? ((typeof auction.user === 'string' && user._id === auction.user) ||
                          (typeof auction.user !== 'string' && user._id === auction.user._id))
                          ? 'Cannot bid on own auction'
                          : 'Place Bid'
                        : 'Sign in to bid'
                    }
                  </button>
                  {!user && (
                    <p className="mt-2 text-sm text-center text-gray-500">
                      <Link to="/login" className="text-indigo-600 hover:text-indigo-800">
                        Sign in
                      </Link> to place a bid
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    Minimum bid: ${minBidAmount.toFixed(2)}
                  </p>
                </form>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Bid History</h3>
              {bids.length === 0 ? (
                <p className="text-gray-500 text-sm">No bids yet</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {bids.map((bid, index) => (
                    <div 
                      key={bid._id} 
                      className={`flex justify-between items-center p-2 rounded 
                        ${index === 0 && auction?.status === 'SOLD' 
                          ? 'winner-highlight border border-indigo-200' 
                          : 'bg-gray-50'
                        } 
                        ${index === 0 && newBidAnimation ? 'bid-flash' : ''}`}
                    >
                      <div>
                        <p className="font-medium">
                          {typeof bid.user === 'string' 
                            ? (user && bid.user === user._id ? 'You' : 'User') 
                            : bid.user.name}
                          {index === 0 && auction?.status === 'SOLD' && ' (Winner)'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(bid.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="font-bold text-indigo-600">${bid.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {isOwner && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-3">Owner Actions</h3>
                <div className="space-y-3">
                  {auction.status === 'SCHEDULED' && (
                    <button
                      onClick={handleStartAuction}
                      className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm"
                    >
                      Start Accepting Bids
                    </button>
                  )}
                  
                  <Link
                    to={`/auction/${id}/edit`}
                    className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit Auction
                  </Link>
                  
                  <button
                    onClick={handleDeleteAuction}
                    className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-sm flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete Auction
                  </button>
                </div>
                
                {auction.status !== 'SCHEDULED' && auction.status !== 'ACCEPTING_BID' && (
                  <p className="mt-3 text-xs text-gray-500 text-center">
                    Status change options are only available for auctions in SCHEDULED status
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetailsPage; 