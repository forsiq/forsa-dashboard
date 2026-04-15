/**
 * AuctionImage Component
 * Handles image loading from various sources (imageUrl, images array, attachments)
 *
 * IMPORTANT: Resolve attachment -> file_url from project service first,
 * then render the returned URL directly.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Gavel } from 'lucide-react';
import { getAuctionImageUrl, parseAttachmentIds } from '../utils/auction-utils';

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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://test.zonevast.com';
const attachmentUrlCache = new Map<number, string | null>();
const CLOUDFRONT_FILES_DOMAIN = 'file.zonevast.com';
const AUTH_LOGOUT_GUARD_KEY = 'zv_attachment_forced_logout_at';
const GLOBAL_TOAST_EVENT = 'zv:toast';

function getApiOrigin(): string {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return 'https://test.zonevast.com';
  }
}

function getAuthToken(): string | null {
  const cookies = document.cookie.split(';');
  const accessCookie = cookies.find((c) => c.trim().startsWith('access='));
  if (accessCookie) {
    return accessCookie.split('=')[1]?.trim() || null;
  }
  return localStorage.getItem('access_token');
}

function clearAuthCookies(): void {
  const domains = [window.location.hostname, '.zonevast.com'];
  const cookieNames = ['access', 'refresh'];

  cookieNames.forEach((name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    domains.forEach((domain) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
    });
  });
}

function forceLogoutAndRelogin(): void {
  const now = Date.now();
  const last = Number(sessionStorage.getItem(AUTH_LOGOUT_GUARD_KEY) || 0);
  if (now - last < 5000) {
    return;
  }
  sessionStorage.setItem(AUTH_LOGOUT_GUARD_KEY, String(now));

  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  clearAuthCookies();
  window.dispatchEvent(
    new CustomEvent(GLOBAL_TOAST_EVENT, {
      detail: {
        type: 'error',
        message: 'Session expired. Please login again.',
        duration: 2500,
      },
    })
  );

  if (!window.location.pathname.includes('/login')) {
    window.setTimeout(() => {
      window.location.href = '/login?expired=true&reason=attachment401';
    }, 400);
  }
}

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

  const projectId = localStorage.getItem('project_id') || '11';
  const token = getAuthToken();
  const apiOrigin = getApiOrigin();
  const urls = [
    `${apiOrigin}/en/api/v1/project/project/attachment/${attachmentId}/`,
    `${apiOrigin}/api/v1/project/project/attachment/${attachmentId}/`,
  ];

  for (const detailsUrl of urls) {
    try {
      let response = await fetch(detailsUrl, {
        headers: {
          'X-Project-ID': projectId,
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      // Project service attachment detail can be public; retry without Authorization
      // when browser has stale/invalid token (common on localhost).
      if (response.status === 401 && token) {
        response = await fetch(detailsUrl, {
          headers: {
            'X-Project-ID': projectId,
            Accept: 'application/json',
          },
        });
      }

      if (response.status === 401) {
        forceLogoutAndRelogin();
        return null;
      }

      if (!response.ok) {
        continue;
      }
      const payload = await response.json();
      const fileUrl = payload?.file_url || payload?.data?.file_url || null;
      if (fileUrl) {
        const normalizedUrl = normalizeResolvedFileUrl(fileUrl);
        attachmentUrlCache.set(attachmentId, normalizedUrl);
        return normalizedUrl;
      }
    } catch (error) {
      void error;
      // Continue trying next URL variant.
    }
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
        // Use direct URL (no auth needed for imageUrl/images array)
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
        if (resolvedUrl) {
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
    <img
      src={imageUrl}
      alt={alt}
      className={fallbackClassName}
      onError={() => {
        setHasError(true);
      }}
      onLoad={() => {
        setIsLoading(false);
      }}
    />
  );
};

export default AuctionImage;
