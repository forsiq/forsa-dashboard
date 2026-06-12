'use client';

import React from 'react';
import { MobileAuctionCard } from './MobileAuctionCard';
import type { Auction } from '../types/auction.types';

interface MobileAuctionGridProps {
  auctions: Auction[];
  onAuctionClick?: (auction: Auction) => void;
  categoryMap?: Map<string, string>;
}

export const MobileAuctionGrid: React.FC<MobileAuctionGridProps> = ({ auctions, onAuctionClick, categoryMap }) => {
  if (auctions.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {auctions.map((auction) => (
        <MobileAuctionCard
          key={auction.id}
          auction={auction}
          onClick={() => onAuctionClick?.(auction)}
          categoryMap={categoryMap}
        />
      ))}
    </div>
  );
};
