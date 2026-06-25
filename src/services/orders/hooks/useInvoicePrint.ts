import { useState, useCallback } from 'react';
import type { Order } from '../types';

/**
 * Manages the invoice-to-print lifecycle: which order is being printed and
 * whether the printable document is mounted.
 */
export function useInvoicePrint() {
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  const printInvoice = useCallback((order: Order) => {
    setPrintOrder(order);
  }, []);

  const closeInvoice = useCallback(() => {
    setPrintOrder(null);
  }, []);

  return {
    printOrder,
    isPrintOpen: printOrder !== null,
    printInvoice,
    closeInvoice,
  };
}
