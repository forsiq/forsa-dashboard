import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';
import { cn } from '@core/lib/utils/cn';
import {
  normalizeImageUrlList,
  parseAttachmentIds,
  isValidImageUrl,
} from '../../auctions/utils/auction-utils';
import { useAttachmentUrls } from '@core/hooks/useAttachmentUrls';
import type { ProductListing } from '../../../types/services/listings.types';

type ListingImageSource = Pick<ProductListing, 'imageUrl' | 'images' | 'mainAttachmentId' | 'attachmentIds'> & {
  image_url?: string | null;
  main_attachment_id?: number | null;
  attachment_ids?: string | string[] | number[] | null;
};

interface ListingImageProps {
  listing: ListingImageSource;
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

  const normalized = useMemo(
    () => ({
      imageUrl: listing.imageUrl ?? listing.image_url ?? null,
      images: listing.images,
      mainAttachmentId: listing.mainAttachmentId ?? listing.main_attachment_id ?? null,
      attachmentIds: listing.attachmentIds ?? listing.attachment_ids ?? null,
    }),
    [
      listing.imageUrl,
      listing.image_url,
      listing.images,
      listing.mainAttachmentId,
      listing.main_attachment_id,
      listing.attachmentIds,
      listing.attachment_ids,
    ],
  );

  const directUrl = useMemo(() => {
    const direct = normalized.imageUrl;
    if (direct && isValidImageUrl(direct)) return direct;
    const fromImages = normalizeImageUrlList(normalized.images).find(
      (u): u is string => typeof u === 'string' && isValidImageUrl(u),
    );
    return fromImages || null;
  }, [normalized.imageUrl, normalized.images]);

  const firstAttachmentId = useMemo(() => {
    if (normalized.mainAttachmentId) return normalized.mainAttachmentId;
    const ids = parseAttachmentIds(normalized.attachmentIds);
    return ids[0] || null;
  }, [normalized.mainAttachmentId, normalized.attachmentIds]);

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
      <div className={cn('flex items-center justify-center bg-obsidian-panel/50', className)}>
        <Package className={cn('w-12 h-12 text-zinc-muted/20', fallbackClassName)} />
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
    <div className={cn('relative', className)}>
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
