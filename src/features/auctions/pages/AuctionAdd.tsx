/**
 * Create Auction Page
 *
 * Form for creating a new auction
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Plus, X } from 'lucide-react';
import { useCreateAuction } from '../hooks/useAuctions';
import type { AuctionCreateInput } from '../types/auction.types';

const Button = ({ className, children, disabled, ...props }: any) => (
  <button
    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    } ${className}`}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);

const Card = ({ className, children, ...props }: any) => (
  <div className={`bg-white/5 border border-white/10 rounded-xl ${className}`} {...props}>
    {children}
  </div>
);

const Input = ({ label, error, ...props }: any) => (
  <div className="space-y-1">
    {label && <label className="text-sm text-zinc-400">{label}</label>}
    <input
      className={`w-full px-4 py-2 bg-zinc-800 border ${
        error ? 'border-red-500' : 'border-white/10'
      } rounded-lg text-white focus:outline-none focus:border-brand`}
      {...props}
    />
    {error && <span className="text-xs text-red-400">{error}</span>}
  </div>
);

const Select = ({ label, children, ...props }: any) => (
  <div className="space-y-1">
    {label && <label className="text-sm text-zinc-400">{label}</label>}
    <select
      className="w-full px-4 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand"
      {...props}
    >
      {children}
    </select>
  </div>
);

const TextArea = ({ label, ...props }: any) => (
  <div className="space-y-1">
    {label && <label className="text-sm text-zinc-400">{label}</label>}
    <textarea
      className="w-full px-4 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand resize-none"
      rows={4}
      {...props}
    />
  </div>
);

export const AuctionAdd = () => {
  const navigate = useNavigate();
  const createAuction = useCreateAuction();

  const [formData, setFormData] = useState<Partial<AuctionCreateInput>>({
    title: '',
    description: '',
    startPrice: 0,
    buyNowPrice: undefined,
    reservePrice: undefined,
    startTime: '',
    endTime: '',
    bidIncrement: 1,
    categoryId: 1,
    images: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const categories = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Jewelry' },
    { id: 3, name: 'Art' },
    { id: 4, name: 'Collectibles' },
    { id: 5, name: 'Vehicles' },
    { id: 6, name: 'Real Estate' },
    { id: 7, name: 'Fashion' },
    { id: 8, name: 'Other' },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In a real app, this would upload to a server
      // For now, we'll use object URLs for preview
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) newErrors.title = 'Title is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.startPrice || formData.startPrice <= 0)
      newErrors.startPrice = 'Starting price must be greater than 0';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    if (formData.buyNowPrice && formData.buyNowPrice <= formData.startPrice)
      newErrors.buyNowPrice = 'Buy now price must be greater than starting price';
    if (uploadedImages.length === 0) newErrors.images = 'At least one image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await createAuction.mutateAsync({
        ...formData,
        images: uploadedImages,
      } as AuctionCreateInput);
      navigate('/auctions');
    } catch (error) {
      console.error('Failed to create auction:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className="p-2 hover:bg-white/5"
          onClick={() => navigate('/auctions')}
        >
          <ArrowLeft size={20} className="text-white" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Create Auction</h1>
          <p className="text-zinc-400">List an item for auction</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Basic Information</h2>

          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={errors.title}
            placeholder="Enter auction title"
          />

          <TextArea
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={errors.description}
            placeholder="Describe your item in detail"
          />

          <Select
            label="Category"
            value={formData.categoryId}
            onChange={(e) => handleInputChange('categoryId', parseInt(e.target.value))}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </Select>
        </Card>

        {/* Images */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Images</h2>

          <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-brand/50 transition-colors">
            <Upload size={32} className="mx-auto text-zinc-500 mb-2" />
            <p className="text-zinc-400 mb-4">Drag images here or click to upload</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white cursor-pointer"
            >
              <Plus size={18} />
              Select Images
            </label>
          </div>

          {errors.images && <span className="text-sm text-red-400">{errors.images}</span>}

          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pricing */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Pricing</h2>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Starting Price ($)"
              type="number"
              min="0"
              value={formData.startPrice}
              onChange={(e) => handleInputChange('startPrice', parseFloat(e.target.value) || 0)}
              error={errors.startPrice}
            />

            <Input
              label="Reserve Price ($) - Optional"
              type="number"
              min="0"
              value={formData.reservePrice || ''}
              onChange={(e) => handleInputChange('reservePrice', parseFloat(e.target.value) || undefined)}
              error={errors.reservePrice}
            />

            <Input
              label="Buy Now Price ($) - Optional"
              type="number"
              min="0"
              value={formData.buyNowPrice || ''}
              onChange={(e) => handleInputChange('buyNowPrice', parseFloat(e.target.value) || undefined)}
              error={errors.buyNowPrice}
            />
          </div>

          <Input
            label="Bid Increment ($)"
            type="number"
            min="1"
            value={formData.bidIncrement}
            onChange={(e) => handleInputChange('bidIncrement', parseFloat(e.target.value) || 1)}
          />
        </Card>

        {/* Timing */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Auction Schedule</h2>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              error={errors.startTime}
            />

            <Input
              label="End Time"
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
              error={errors.endTime}
            />
          </div>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="ghost"
            className="text-zinc-400 hover:text-white"
            onClick={() => navigate('/auctions')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-brand hover:bg-brand/90 text-white"
            disabled={createAuction.isPending}
          >
            {createAuction.isPending ? 'Creating...' : 'Create Auction'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AuctionAdd;
