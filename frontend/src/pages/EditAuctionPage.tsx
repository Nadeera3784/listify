import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auctionsAPI, categoriesAPI } from '../services/api';
import { formatImageUrl } from '../utils';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

const EditAuctionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startingBid: '',
    category: '',
    status: 'SCHEDULED',
    discount: '0',
    phoneNumber: ''
  });

  useEffect(() => {
    // Fetch categories and auction data
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const categoriesResponse = await categoriesAPI.getCategories();
        setCategories(categoriesResponse.data.categories || []);
        
        // Fetch auction data
        if (id) {
          const auctionResponse = await auctionsAPI.getAuction(id);
          const auction = auctionResponse.data.auction;
          
          // Check if user is authorized to edit this auction
          if (user && (auction.user._id === user._id || user.isAdmin)) {
            setFormData({
              title: auction.title,
              description: auction.description,
              startingBid: auction.startingBid.toString(),
              category: typeof auction.category === 'string' ? auction.category : auction.category._id,
              status: auction.status,
              discount: auction.discount.toString(),
              phoneNumber: auction.phoneNumber || ''
            });
            
            // Store existing images
            setExistingImages(auction.imageUrls || []);
          } else {
            setError('You are not authorized to edit this auction');
            navigate('/profile');
          }
        }
      } catch (error: any) {
        setError(error.response?.data?.error || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!id) {
        throw new Error('Auction ID is missing');
      }
      
      // Validate form
      if (!formData.title || !formData.description || !formData.startingBid || !formData.category) {
        throw new Error('Please fill in all required fields');
      }
      
      if (existingImages.length === 0 && uploadedFiles.length === 0) {
        throw new Error('Please provide at least one image');
      }
      
      // If we have new files to upload, use createAuctionWithImages
      if (uploadedFiles.length > 0) {
        setUploadingImages(true);
        
        // Create form data for multipart/form-data submission
        const formDataForSubmit = new FormData();
        formDataForSubmit.append('title', formData.title);
        formDataForSubmit.append('description', formData.description);
        formDataForSubmit.append('startingBid', formData.startingBid);
        formDataForSubmit.append('category', formData.category);
        formDataForSubmit.append('status', formData.status);
        formDataForSubmit.append('discount', formData.discount);
        formDataForSubmit.append('phoneNumber', formData.phoneNumber);
        
        // Add existing images if any
        existingImages.forEach(url => {
          formDataForSubmit.append('existingImages', url);
        });
        
        // Append all new files
        uploadedFiles.forEach(file => {
          formDataForSubmit.append('images', file);
        });
        
        // Submit to API
        await auctionsAPI.updateAuctionWithImages(id, formDataForSubmit);
      } else {
        // If only using existing images, use regular update
        const auctionData = {
          title: formData.title,
          description: formData.description,
          startingBid: parseFloat(formData.startingBid),
          category: formData.category,
          imageUrls: existingImages,
          status: formData.status,
          discount: parseFloat(formData.discount),
          phoneNumber: formData.phoneNumber
        };
        
        await auctionsAPI.updateAuction(id, auctionData);
      }
      
      // Redirect to the auction page
      navigate(`/auction/${id}`);
    } catch (error: any) {
      setError(error.response?.data?.error || error.message || 'Failed to update auction');
    } finally {
      setSubmitting(false);
      setUploadingImages(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p>Please log in to edit auctions.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Auction</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="title">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
            required
          />
        </div>
        
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="startingBid">
              Starting Bid (USD) *
            </label>
            <input
              type="number"
              id="startingBid"
              name="startingBid"
              value={formData.startingBid}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="category">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="SCHEDULED">Scheduled</option>
              <option value="ACCEPTING_BID">Live Now (Accepting Bids)</option>
              <option value="UNSOLD">Ended (Unsold)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="discount">
              Discount %
            </label>
            <input
              type="number"
              id="discount"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
              min="0"
              max="100"
              step="1"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="phoneNumber">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="(123) 456-7890"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Images * (Upload up to 5 images)
          </label>
          
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {existingImages.map((imageUrl, index) => (
                  <div key={`existing-${index}`} className="relative">
                    <img
                      src={formatImageUrl(imageUrl)}
                      alt={`Current ${index + 1}`}
                      className="h-32 w-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      title="Remove image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* New Image Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
            multiple
          />
          
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center mb-4">
            <button
              type="button"
              onClick={triggerFileInput}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {uploadedFiles.length === 0 ? 'Upload New Images' : 'Add More Images'}
            </button>
            <p className="text-sm text-gray-500 mt-2">JPG, PNG, or GIF up to 5MB each</p>
          </div>
          
          {uploadedFiles.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">New Images to Upload</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {uploadedFiles.map((file, index) => (
                  <div key={`new-${index}`} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="h-32 w-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      title="Remove image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {existingImages.length === 0 && uploadedFiles.length === 0 && (
            <p className="text-red-500 text-sm">At least one image is required</p>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(`/auction/${id}`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || uploadingImages}
            className={`px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
              (submitting || uploadingImages) ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {submitting 
              ? 'Updating...' 
              : uploadingImages 
                ? 'Uploading Images...' 
                : 'Update Auction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAuctionPage; 