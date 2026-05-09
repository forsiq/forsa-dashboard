import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Gavel } from 'lucide-react';
import { getAuctionImageUrl, parseAttachmentIds, isValidImageUrl } from '../utils/auction-utils';
import { createClient } from '@core/services/ApiClientFactory';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.zonevast.com/forsa/api/v1';

function getApiOrigin(): string {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return '';
  }
}

const PROJECT_API_URL = `${getApiOrigin()}/api/v1`;

interface AuctionImageProps {
  auction: {
    imageUrl?: string | null;
    image_url?: string | null;
    mainAttachmentId?: number | null;
    main_attachment_id?: number | null;
    attachmentIds?: string | string[] | null;
    attachment_ids?: string | string[] | null;
    images?: string[] | null;
  };
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  children?: (url: string) => React.ReactNode;
}

const attachmentUrlCache = new Map<number, string | null>();
const CLOUDFRONT_FILES_DOMAIN = 'file.zonevast.com';

function normalizeResolvedFileUrl(fileUrl: string): string {
  try {
    const parsed = new URL(fileUrl);

    // Keep correct CloudFront/custom domain URLs unchanged
    if (parsed.hostname === CLOUDFRONT_FILES_DOMAIN) {
      return fileUrl;
    }

    // Convert known S3 URL styles to CloudFront custom domain
    const host = parsed.hostname;
    const isS3Host = host.includes('amazonaws.com') || host.includes('.s3.');
    if (!isS3Host) {
      return fileUrl;
    }

    let key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));

    // path-style: /bucket/key
    const pathSegments = key.split('/');
    if (pathSegments.length > 1) {
      const first = pathSegments[0];
      if (
        first === 'file-zonevast-eu' ||
        first === 'file.zonevast.com' ||
        first === 'file1.zonevast.com'
      ) {
        key = pathSegments.slice(1).join('/');
      }
    }

    if (!key) {
      return fileUrl;
    }

    return `https://${CLOUDFRONT_FILES_DOMAIN}/${key}`;
  } catch {
    return fileUrl;
  }
}

/**
 * Fetch attachment metadata and extract file_url.
 */
async function resolveAttachmentFileUrl(attachmentId: number): Promise<string | null> {
  if (attachmentUrlCache.has(attachmentId)) {
    return attachmentUrlCache.get(attachmentId) ?? null;
  }

  // Use the central ApiClient which handles auth and 401s correctly
  const apiClient = createClient(PROJECT_API_URL);
  
  try {
    const response = await apiClient.get(`/project/project/attachment/${attachmentId}/`);
    const payload = response.data;
    const fileUrl = payload?.file_url || payload?.data?.file_url || null;
    
    if (fileUrl) {
      const normalizedUrl = normalizeResolvedFileUrl(fileUrl);
      attachmentUrlCache.set(attachmentId, normalizedUrl);
      return normalizedUrl;
    }
  } catch (error: any) {
    // If it's a 401, the global interceptor will handle the logout redirect.
    // We just return null here to show the fallback icon.
    console.warn(`[AuctionImage] Failed to resolve attachment ${attachmentId}:`, error.message);
  }

  attachmentUrlCache.set(attachmentId, null);
  return null;
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

  const normalizedAuction = useMemo(() => {
    const imageUrlValue = auction.imageUrl || auction.image_url || null;
    const mainAttachmentIdValue = auction.mainAttachmentId || auction.main_attachment_id || null;
    const attachmentIdsValue = auction.attachmentIds || auction.attachment_ids || null;
    const imagesValue = auction.images || null;

    return {
      imageUrl: imageUrlValue,
      mainAttachmentId: mainAttachmentIdValue,
      attachmentIds: attachmentIdsValue,
      images: imagesValue,
    };
  }, [
    auction.imageUrl,
    auction.image_url,
    auction.mainAttachmentId,
    auction.main_attachment_id,
    auction.attachmentIds,
    auction.attachment_ids,
    auction.images,
  ]);

  const attachmentKey = useMemo(() => {
    const ids = parseAttachmentIds(normalizedAuction.attachmentIds);
    const firstAttachment = normalizedAuction.mainAttachmentId || ids[0] || null;
    return firstAttachment ? String(firstAttachment) : 'none';
  }, [normalizedAuction.mainAttachmentId, normalizedAuction.attachmentIds]);

  const directImageKey = useMemo(() => {
    return getAuctionImageUrl(normalizedAuction) || 'none';
  }, [normalizedAuction]);

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      setHasError(false);

      // Check if we have a direct URL (imageUrl or images array)
      const directUrl = getAuctionImageUrl(normalizedAuction);
      const hasDirectUrl =
        Boolean(normalizedAuction.imageUrl) ||
        Boolean(normalizedAuction.images && normalizedAuction.images.length > 0);

      if (hasDirectUrl && directUrl) {
        if (!isValidImageUrl(directUrl)) {
          setHasError(true);
          setIsLoading(false);
          return;
        }
        setImageUrl(directUrl);
        setIsLoading(false);
        return;
      }

      // Otherwise, fetch from attachment with authentication
      let attachmentId = normalizedAuction.mainAttachmentId;
      if (!attachmentId) {
        const ids = parseAttachmentIds(normalizedAuction.attachmentIds);
        attachmentId = ids[0] || null;
      }

      if (attachmentId) {
        const resolvedUrl = await resolveAttachmentFileUrl(attachmentId);
        if (resolvedUrl && isValidImageUrl(resolvedUrl)) {
          setImageUrl(resolvedUrl);
        } else {
          setHasError(true);
        }
      } else {
        setHasError(true);
      }

      setIsLoading(false);
    };

    loadImage();
  }, [normalizedAuction, directImageKey, attachmentKey]);

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
    <div className={`relative ${fallbackClassName}`}>
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 400px"
        onError={() => {
          setHasError(true);
        }}
        onLoad={() => {
          setIsLoading(false);
        }}
      />
    </div>
  );
};

export default AuctionImage;
