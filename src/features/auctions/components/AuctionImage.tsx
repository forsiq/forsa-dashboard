import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Gavel } from 'lucide-react';
import {
  getAuctionImageUrl,
  normalizeImageUrlList,
  parseAttachmentIds,
  isValidImageUrl,
} from '../utils/auction-utils';
import { useAttachmentUrls } from '@core/hooks/useAttachmentUrls';

interface AuctionImageProps {
  auction: {
    imageUrl?: string | null;
    image_url?: string | null;
    mainAttachmentId?: number | null;
    main_attachment_id?: number | null;
    attachmentIds?: string | string[] | number[] | null;
    attachment_ids?: string | string[] | number[] | null;
    images?: string[] | Record<string, string> | string | null;
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

  const firstAttachmentId = useMemo(() => {
    const ids = parseAttachmentIds(normalizedAuction.attachmentIds);
    return normalizedAuction.mainAttachmentId || ids[0] || null;
  }, [normalizedAuction.mainAttachmentId, normalizedAuction.attachmentIds]);

  const directUrl = useMemo(() => {
    return getAuctionImageUrl(normalizedAuction) || null;
  }, [normalizedAuction]);

  const hasDirectUrl = useMemo(() => {
    return isValidImageUrl(directUrl || '');
  }, [directUrl]);

  const { data: attachmentUrlMap } = useAttachmentUrls(
    !hasDirectUrl && firstAttachmentId ? [firstAttachmentId] : []
  );

  const imageUrl = useMemo(() => {
    if (hasError) return null;

    if (directUrl && isValidImageUrl(directUrl)) return directUrl;

    if (firstAttachmentId && attachmentUrlMap) {
      const resolved = attachmentUrlMap.get(firstAttachmentId);
      if (resolved && isValidImageUrl(resolved)) return resolved;
    }

    return null;
  }, [hasError, directUrl, firstAttachmentId, attachmentUrlMap, hasDirectUrl]);

  if (children && imageUrl) {
    return <>{children(imageUrl)}</>;
  }

  if (hasError || !imageUrl) {
    return (
      <div className={`flex items-center justify-center bg-obsidian-panel/50 ${className}`}>
        <Gavel className="w-8 h-8 text-zinc-muted/20" />
      </div>
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
        onError={() => {
          setHasError(true);
        }}
      />
    </div>
  );
};

export default AuctionImage;
