import React from 'react';
import { ImageIcon } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { AmberImageUpload } from '@core/components/AmberImageUpload';
import { FormSection } from '@core/components/FormSection';

interface ImageUploadState {
  previewUrls: string[];
  pendingFiles: File[];
  existingCount: number;
  appendFiles: (files: File[]) => void;
  removeAt: (index: number) => void;
  reorder: (newOrder: string[]) => void;
}

interface AuctionImageSectionProps {
  imageUpload: ImageUploadState;
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  onRemoveExisting: (index: number) => void;
}

export const AuctionImageSection: React.FC<AuctionImageSectionProps> = ({
  imageUpload,
  isUploading,
  uploadProgress,
  uploadError,
  onRemoveExisting,
}) => {
  const { t } = useLanguage();

  return (
    <FormSection icon={<ImageIcon className="w-5 h-5" />} iconBgColor="info" title={t('auction.form.section.visualization')}>
      <div className="space-y-4">
        <label className="block text-[11px] font-black text-zinc-muted uppercase tracking-[0.2em] mb-2 px-1">
          {t('auction.form.imagery_specs')}
        </label>
        <AmberImageUpload
          value={imageUpload.previewUrls}
          onChange={(files) => {
            if (files?.length) imageUpload.appendFiles(files);
          }}
          onRemove={(index) => {
            onRemoveExisting(index);
          }}
          onReorder={(newOrder) => imageUpload.reorder(newOrder)}
          multiple={true}
          sortable={true}
          disabled={isUploading}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          uploadError={uploadError}
        />
        <p className="text-[11px] text-zinc-muted font-bold text-center uppercase tracking-widest">{t('auction.form.imagery_format_note')}</p>
      </div>
    </FormSection>
  );
};
