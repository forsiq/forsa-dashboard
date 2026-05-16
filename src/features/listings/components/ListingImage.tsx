import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';
import {
  normalizeImageUrlList,
  parseAttachmentIds,
  isValidImageUrl,
} from '../../auctions/utils/auction-utils';
import { createClient } from '@core/services/ApiClientFactory';
import type { ProductListing } from '../../../types/services/listings.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.zonevast.com/forsa/api/v1';

function getApiOrigin(): string {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return '';
  }
}

const PROJECT_API_URL = `${getApiOrigin()}/api/v1`;
const CLOUDFRONT_FILES_DOMAIN = 'file.zonevast.com';

const attachmentUrlCache = new Map<number, string | null>();

function normalizeResolvedFileUrl(fileUrl: string): string {
  try {
    const parsed = new URL(fileUrl);
    if (parsed.hostname === CLOUDFRONT_FILES_DOMAIN) return fileUrl;
    const host = parsed.hostname;
    if (!host.includes('amazonaws.com') && !host.includes('.s3.')) return fileUrl;

    let key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
    const pathSegments = key.split('/');
    if (pathSegments.length > 1) {
      const first = pathSegments[0];
      if (first === 'file-zonevast-eu' || first === 'file.zonevast.com' || first === 'file1.zonevast.com') {
        key = pathSegments.slice(1).join('/');
      }
    }
    return key ? `https://${CLOUDFRONT_FILES_DOMAIN}/${key}` : fileUrl;
  } catch {
    return fileUrl;
  }
}

async function resolveAttachmentFileUrl(attachmentId: number): Promise<string | null> {
  if (attachmentUrlCache.has(attachmentId)) {
    return attachmentUrlCache.get(attachmentId) ?? null;
  }
  const apiClient = createClient(PROJECT_API_URL);
  try {
    const response = await apiClient.get(`/project/attachment/${attachmentId}/`);
    const payload = response.data;
    const fileUrl = payload?.file_url || payload?.data?.file_url || null;
    if (fileUrl) {
      const normalizedUrl = normalizeResolvedFileUrl(fileUrl);
      attachmentUrlCache.set(attachmentId, normalizedUrl);
      return normalizedUrl;
    }
  } catch (error: any) {
    console.warn(`[ListingImage] Failed to resolve attachment ${attachmentId}:`, error.message);
  }
  attachmentUrlCache.set(attachmentId, null);
  return null;
}

interface ListingImageProps {
  listing: Pick<ProductListing, 'imageUrl' | 'images' | 'mainAttachmentId' | 'attachmentIds'>;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  children?: (url: string) => React.ReactNode;
  /** For non-fill rendering (e.g. thumbnail in table rows) */
  width?: number;
  height?: number;
}

export const ListingImage: React.FC<ListingImageProps> = ({
  listing,
  alt = 'Product image',
  className = '',
  fallbackClassName = 'w-full h-full object-cover',
  children,
  width,
  height,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const directUrl = useMemo(() => {
    const direct = listing.imageUrl;
    if (direct && isValidImageUrl(direct)) return direct;
    const fromImages = normalizeImageUrlList(listing.images).find(
      (u): u is string => typeof u === 'string' && isValidImageUrl(u),
    );
    return fromImages || null;
  }, [listing.imageUrl, listing.images]);

  const firstAttachmentId = useMemo(() => {
    if (listing.mainAttachmentId) return listing.mainAttachmentId;
    const ids = parseAttachmentIds(listing.attachmentIds);
    return ids[0] || null;
  }, [listing.mainAttachmentId, listing.attachmentIds]);

  const effectKey = useMemo(
    () => `${directUrl ?? ''}|${firstAttachmentId ?? ''}`,
    [directUrl, firstAttachmentId],
  );

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      setHasError(false);

      if (directUrl) {
        setImageUrl(directUrl);
        setIsLoading(false);
        return;
      }

      if (firstAttachmentId) {
        const resolvedUrl = await resolveAttachmentFileUrl(firstAttachmentId);
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
  }, [effectKey]);

  if (children && imageUrl) {
    return <>{children(imageUrl)}</>;
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-obsidian-panel/30 ${className}`}>
        <div className="w-6 h-6 border-2 border-zinc-muted/30 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  if (hasError || !imageUrl) {
    return (
      <div className={`flex items-center justify-center bg-obsidian-panel/50 ${className}`}>
        <Package className={fallbackClassName?.includes('w-') ? fallbackClassName : 'w-8 h-8 text-zinc-muted/20'} />
      </div>
    );
  }

  if (width && height) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div className={`relative ${fallbackClassName}`}>
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 400px"
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export default ListingImage;
