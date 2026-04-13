/**
 * AuctionImage Component
 * Handles image loading from various sources (imageUrl, images array, attachments)
 *
 * IMPORTANT: For authenticated attachments, fetches as blob with headers
 * because <img> tags cannot send custom headers like X-Project-ID
 */

import React, { useState, useEffect } from 'react';
import { Gavel } from 'lucide-react';
import { getAuctionImageUrl, parseAttachmentIds } from '../utils/auction-utils';

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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://test.zonevast.com';

/**
 * Fetch image as blob with authentication headers
 * Creates an object URL that can be used in <img> tags
 */
async function fetchAuthenticatedImage(attachmentId: number): Promise<string | null> {
  const downloadUrl = `${API_BASE_URL}/en/api/v1/project/attachment/${attachmentId}/download/`;

  try {
    const response = await fetch(downloadUrl, {
      headers: {
        'X-Project-ID': '11',
      },
    });

    if (!response.ok) {
      console.warn(`[AuctionImage] Failed to fetch attachment ${attachmentId}:`, response.status);
      return null;
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error(`[AuctionImage] Error fetching attachment ${attachmentId}:`, error);
    return null;
  }
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
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      setHasError(false);

      // Clean up previous object URL
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        setObjectUrl(null);
      }

      // Check if we have a direct URL (imageUrl or images array)
      const directUrl = getAuctionImageUrl(auction);
      const hasDirectUrl =
        (auction.imageUrl && auction.imageUrl !== directUrl) ||
        (auction.images && auction.images.length > 0);

      if (hasDirectUrl && directUrl) {
        // Use direct URL (no auth needed for imageUrl/images array)
        setImageUrl(directUrl);
        setIsLoading(false);
        return;
      }

      // Otherwise, fetch from attachment with authentication
      let attachmentId = auction.mainAttachmentId;
      if (!attachmentId) {
        const ids = parseAttachmentIds(auction.attachmentIds);
        attachmentId = ids[0] || null;
      }

      if (attachmentId) {
        const blobUrl = await fetchAuthenticatedImage(attachmentId);
        if (blobUrl) {
          setImageUrl(blobUrl);
          setObjectUrl(blobUrl);
        } else {
          setHasError(true);
        }
      } else {
        setHasError(true);
      }

      setIsLoading(false);
    };

    loadImage();

    // Cleanup function to revoke object URL
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
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
