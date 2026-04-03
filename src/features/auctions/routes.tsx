/**
 * Auction Feature Routes
 */

import { AuctionsList } from './pages/AuctionsList';
import { AuctionAdd } from './pages/AuctionAdd';
import { AuctionDetails } from './pages/AuctionDetails';

// Export routes as default for dynamic import
const auctionRoutes = [
  {
    path: '/auctions',
    element: <AuctionsList />,
  },
  {
    path: '/auctions/add',
    element: <AuctionAdd />,
  },
  {
    path: '/auctions/:id',
    element: <AuctionDetails />,
  },
  {
    path: '/auctions/:id/edit',
    element: <div>Auction Edit (Coming Soon)</div>, // TODO: Create AuctionEdit page
  },
];

export default auctionRoutes;
export { auctionRoutes };

// For now, also export components individually if needed
export { default as AuctionsList } from './pages/AuctionsList';
export { default as AuctionAdd } from './pages/AuctionAdd';
export { default as AuctionDetails } from './pages/AuctionDetails';
