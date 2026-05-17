import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';
import {
  normalizeImageUrlList,
  parseAttachmentIds,
  isValidImageUrl,
} from '../../auctions/utils/auction-utils';
import { useAttachmentUrls } from '@core/hooks/useAttachmentUrls';
import type { ProductListing } from '../../../types/services/listings.types';

interface ListingImageProps {
  listing: Pick<ProductListing, 'imageUrl' | 'images' | 'mainAttachmentId' | 'attachmentIds'>;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  children?: (url: string) => React.ReactNode;
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

  const { data: attachmentUrlMap } = useAttachmentUrls(
    !directUrl && firstAttachmentId ? [firstAttachmentId] : []
  );

  const imageUrl = useMemo(() => {
    if (hasError) return null;
    if (directUrl) return directUrl;

    if (firstAttachmentId && attachmentUrlMap) {
      const resolved = attachmentUrlMap.get(firstAttachmentId);
      if (resolved && isValidImageUrl(resolved)) return resolved;
    }

    return null;
  }, [hasError, directUrl, firstAttachmentId, attachmentUrlMap]);

  if (children && imageUrl) {
    return <>{children(imageUrl)}</>;
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
