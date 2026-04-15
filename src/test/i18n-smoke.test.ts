import { describe, expect, it } from 'vitest';
import { translations } from '@core/lib/utils/translations';

describe('i18n smoke', () => {
  it('contains critical user translation keys in english and arabic', () => {
    const requiredKeys = [
      'user.title',
      'user.add',
      'user.edit',
      'user.status.active',
      'user.validation.username_required',
      'groupBuying.title',
      'groupBuying.subtitle',
      'groupBuying.create',
      'common.actions',
      'common.cancel',
      'common.saving',
    ];

    for (const key of requiredKeys) {
      expect(translations.en[key]).toBeTruthy();
      expect(translations.ar[key]).toBeTruthy();
    }
  });
});
