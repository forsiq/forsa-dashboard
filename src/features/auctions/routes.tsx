/**
 * Auction Feature Routes
 */

import { AuctionsList } from './pages/AuctionsList';
import { AuctionFormPage } from './pages/AuctionFormPage';
import { AuctionDetails } from './pages/AuctionDetails';

const auctionsRoutes = [
  {
    path: '/auctions',
    element: <AuctionsList />,
  },
  {
    path: '/auctions/add',
    element: <AuctionFormPage />,
  },
  {
    path: '/auctions/:id',
    element: <AuctionDetails />,
  },
  {
    path: '/auctions/edit/:id',
    element: <AuctionFormPage />,
  },
];

export default auctionsRoutes;
export { auctionsRoutes };

// For now, also export components individually if needed
export { default as AuctionsList } from './pages/AuctionsList';
export { default as AuctionAdd } from './pages/AuctionAdd';
export { default as AuctionDetails } from './pages/AuctionDetails';
