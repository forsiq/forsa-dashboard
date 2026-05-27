'use client';

import React from 'react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { ForsaDrawer } from '@core/components/Mobile/ForsaDrawer';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const { dir } = useLanguage();

  return (
    <ForsaDrawer open={isOpen} onClose={onClose} title={title} dir={dir}>
      {children}
    </ForsaDrawer>
  );
};
