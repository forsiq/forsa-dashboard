import {
  isAcceptableImageFile,
  resolveImageContentType,
} from '@core/lib/utils/imageFile';

describe('imageFile utils', () => {
  it('accepts PNG when MIME type is empty (Linux file picker)', () => {
    const file = new File(['x'], 'photo.png', { type: '' });
    expect(isAcceptableImageFile(file)).toBe(true);
    expect(resolveImageContentType(file)).toBe('image/png');
  });

  it('rejects non-image extensions without MIME', () => {
    const file = new File(['x'], 'notes.txt', { type: '' });
    expect(isAcceptableImageFile(file)).toBe(false);
  });

  it('uses MIME when present', () => {
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    expect(resolveImageContentType(file)).toBe('image/jpeg');
  });
});
