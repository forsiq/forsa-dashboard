/**
 * AuctionImage Component
 * Handles image loading from various sources (imageUrl, images array, attachments)
 */

import React, { useState, useEffect } from 'react';
import { Gavel } from 'lucide-react';
import { getAuctionImageUrl, fetchAttachmentUrl } from '../utils/auction-utils';

interface AuctionImageProps {
  auction: {
    imageUrl?: string | null;
    mainAttachmentId?: number | null;
    attachmentIds?: string | string[] | null;
    images?: string[] | null;
  };
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  children?: (url: string) => React.ReactNode;
}

export const AuctionImage: React.FC<AuctionImageProps> = ({
  auction,
  alt = 'Auction image',
  className = '',
  fallbackClassName = 'w-full h-full object-cover',
  children
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      setHasError(false);

      // Try to get URL from helper (checks imageUrl, images array)
      let url = getAuctionImageUrl(auction);

      // If no direct URL, try fetching from attachment
      if (!url) {
        const ids = auction.attachmentIds;
        let attachmentId = auction.mainAttachmentId;

        // Parse attachmentIds if mainAttachmentId not set
        if (!attachmentId && ids) {
          const parsedIds = typeof ids === 'string' ? JSON.parse(ids) : ids;
          attachmentId = parsedIds[0];
        }

        if (attachmentId) {
          url = await fetchAttachmentUrl(attachmentId);
        }
      }

      if (url) {
        setImageUrl(url);
      } else {
        setHasError(true);
      }
      setIsLoading(false);
    };

    loadImage();
  }, [auction]);

  // Render custom children with URL if provided
  if (children && imageUrl) {
    return <>{children(imageUrl)}</>;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-obsidian-panel/30 ${className}`}>
        <div className="w-8 h-8 border-2 border-zinc-muted/30 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  // Show error/fallback state
  if (hasError || !imageUrl) {
    return (
      <div className={`flex items-center justify-center bg-obsidian-panel/50 ${className}`}>
        <Gavel className="w-16 h-16 text-zinc-muted/20" />
      </div>
    );
  }

  // Show image
  return (
    <img
      src={imageUrl}
      alt={alt}
      className={fallbackClassName}
      onError={() => setHasError(true)}
      onLoad={() => setIsLoading(false)}
    />
  );
};

export default AuctionImage;
