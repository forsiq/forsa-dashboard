/**
 * Local @core/components barrel: re-exports core-ui package.
 * StatusBadge and other generic components are now provided by the package directly.
 */
export * from '@yousef2001/core-ui/components';

export { IqdPriceInput } from './IqdPriceInput';
export type { IqdDenomination, IqdPriceInputProps } from './IqdPriceInput';

/** Portal-safe overrides — avoid document.body removeChild races on route change. */
export { AmberSlideOver } from './Feedback/AmberSlideOver';
export {
  AmberConfirmModal,
  useConfirmModal,
  default as AmberConfirmModalDefault,
} from './Feedback/AmberConfirmModal';
export type {
  AmberConfirmModalProps,
  ConfirmModalVariant,
  UseConfirmModalOptions,
  UseConfirmModalReturn,
} from './Feedback/AmberConfirmModal';
