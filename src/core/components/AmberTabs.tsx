import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '../lib/utils/cn';

// --- Types ---

export interface AmberTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  children: React.ReactNode;
}

export interface AmberTabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  loop?: boolean;
}

export interface AmberTabsTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  value: string;
  disabled?: boolean;
}

export interface AmberTabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

// --- Tabs Context ---

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  orientation: 'horizontal' | 'vertical';
}

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within <AmberTabs>');
  }
  return context;
};

// --- Root Tabs Component ---

/**
 * AmberTabs - Tab navigation container
 *
 * @example
 * <AmberTabs defaultValue="tab1">
 *   <AmberTabsList>
 *     <AmberTabsTrigger value="tab1">Tab 1</AmberTabsTrigger>
 *     <AmberTabsTrigger value="tab2">Tab 2</AmberTabsTrigger>
 *   </AmberTabsList>
 *   <AmberTabsContent value="tab1">Content 1</AmberTabsContent>
 *   <AmberTabsContent value="tab2">Content 2</AmberTabsContent>
 * </AmberTabs>
 */
export const AmberTabs = React.forwardRef<HTMLDivElement, AmberTabsProps>(
  (
    {
      defaultValue,
      value: controlledValue,
      onValueChange,
      orientation = 'horizontal',
      children,
      className,
      ...props
    },
    ref
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || '');

    const value = controlledValue ?? uncontrolledValue;
    const handleValueChange = useCallback(
      (newValue: string) => {
        if (controlledValue === undefined) {
          setUncontrolledValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [controlledValue, onValueChange]
    );

    return (
      <TabsContext.Provider value={{ value, onValueChange: handleValueChange, orientation }}>
        <div ref={ref} className={cn('amber-tabs', className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);

AmberTabs.displayName = 'AmberTabs';

// --- Tabs List (Container) ---

export const AmberTabsList = React.forwardRef<HTMLDivElement, AmberTabsListProps>(
  ({ className, loop = true, ...props }, ref) => {
    const { orientation } = useTabsContext();
    const containerRef = useRef<HTMLDivElement>(null);

    // Keyboard navigation
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const triggers = Array.from(
        container.querySelectorAll('[data-amber-tabs-trigger]:not([disabled])')
      ) as HTMLButtonElement[];

      const handleKeyDown = (e: KeyboardEvent) => {
        const currentIndex = triggers.findIndex(
          (trigger) => trigger === document.activeElement
        );

        if (currentIndex === -1) return;

        let nextIndex: number;

        switch (e.key) {
          case 'ArrowRight':
          case orientation === 'horizontal' && 'ArrowDown':
            e.preventDefault();
            nextIndex = currentIndex + 1;
            if (nextIndex >= triggers.length) {
              nextIndex = loop ? 0 : triggers.length - 1;
            }
            triggers[nextIndex]?.focus();
            break;

          case 'ArrowLeft':
          case orientation === 'horizontal' && 'ArrowUp':
            e.preventDefault();
            nextIndex = currentIndex - 1;
            if (nextIndex < 0) {
              nextIndex = loop ? triggers.length - 1 : 0;
            }
            triggers[nextIndex]?.focus();
            break;

          case 'Home':
            e.preventDefault();
            triggers[0]?.focus();
            break;

          case 'End':
            e.preventDefault();
            triggers[triggers.length - 1]?.focus();
            break;
        }
      };

      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }, [loop, orientation]);

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          'inline-flex',
          orientation === 'horizontal'
            ? 'flex-row items-center gap-1 border-b border-white/5'
            : 'flex-col items-start gap-1 border-r border-white/5 pr-1',
          className
        )}
        role="tablist"
        aria-orientation={orientation}
        {...props}
      />
    );
  }
);

AmberTabsList.displayName = 'AmberTabsList';

// --- Tabs Trigger (Tab Button) ---

export const AmberTabsTrigger = React.forwardRef<HTMLButtonElement, AmberTabsTriggerProps>(
  ({ value, disabled = false, className, children, ...props }, ref) => {
    const { value: selectedValue, onValueChange, orientation } = useTabsContext();
    const isSelected = value === selectedValue;

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isSelected}
        aria-controls={`panel-${value}`}
        data-amber-tabs-trigger
        disabled={disabled}
        className={cn(
          'relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold uppercase tracking-widest',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-brand/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          orientation === 'horizontal' ? 'flex-row' : 'flex-row w-full justify-start',
          isSelected
            ? 'text-brand border-b-2 border-brand'
            : 'text-zinc-muted hover:text-zinc-text hover:bg-white/5',
          className
        )}
        onClick={() => !disabled && onValueChange(value)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

AmberTabsTrigger.displayName = 'AmberTabsTrigger';

// --- Tabs Content (Panel) ---

export const AmberTabsContent = React.forwardRef<HTMLDivElement, AmberTabsContentProps>(
  ({ value, className, children, ...props }, ref) => {
    const { value: selectedValue } = useTabsContext();
    const isSelected = value === selectedValue;

    if (!isSelected) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`panel-${value}`}
        aria-labelledby={`trigger-${value}`}
        tabIndex={0}
        className={cn('py-4 focus:outline-none', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AmberTabsContent.displayName = 'AmberTabsContent';

// --- Animated Indicator (Optional) ---

export interface AmberTabsIndicatorProps {
  className?: string;
}

/**
 * AmberTabsIndicator - Animated underline that moves to the active tab
 * Place this inside AmberTabsList as a child
 */
export const AmberTabsIndicator = React.forwardRef<HTMLDivElement, AmberTabsIndicatorProps>(
  ({ className }, ref) => {
    const { value, orientation } = useTabsContext();
    const [position, setPosition] = React.useState({ left: 0, width: 0, top: 0, height: 0 });

    useEffect(() => {
      const activeTrigger = document.querySelector(`[data-amber-tabs-trigger][aria-selected="true"]`);
      if (activeTrigger) {
        const parent = activeTrigger.parentElement;
        if (parent) {
          const parentRect = parent.getBoundingClientRect();
          const triggerRect = activeTrigger.getBoundingClientRect();

          if (orientation === 'horizontal') {
            setPosition({
              left: triggerRect.left - parentRect.left,
              width: triggerRect.width,
              top: 0,
              height: 0,
            });
          } else {
            setPosition({
              left: 0,
              width: 0,
              top: triggerRect.top - parentRect.top,
              height: triggerRect.height,
            });
          }
        }
      }
    }, [value, orientation]);

    return (
      <div
        ref={ref}
        className={cn(
          'absolute bg-brand transition-all duration-200 ease-out',
          orientation === 'horizontal'
            ? 'bottom-0 h-0.5 rounded-t-full'
            : 'right-0 w-0.5 rounded-l-full',
          className
        )}
        style={
          orientation === 'horizontal'
            ? { left: position.left, width: position.width }
            : { top: position.top, height: position.height }
        }
      />
    );
  }
);

AmberTabsIndicator.displayName = 'AmberTabsIndicator';

// --- Vertical Tabs Wrapper ---

export interface AmberVerticalTabsProps extends AmberTabsProps {
  className?: string;
}

/**
 * AmberVerticalTabs - Pre-configured vertical tabs layout
 *
 * @example
 * <AmberVerticalTabs defaultValue="tab1">
 *   <AmberTabsList>
 *     <AmberTabsTrigger value="tab1">Tab 1</AmberTabsTrigger>
 *     <AmberTabsTrigger value="tab2">Tab 2</AmberTabsTrigger>
 *   </AmberTabsList>
 *   <div className="flex-1">
 *     <AmberTabsContent value="tab1">Content 1</AmberTabsContent>
 *     <AmberTabsContent value="tab2">Content 2</AmberTabsContent>
 *   </div>
 * </AmberVerticalTabs>
 */
export const AmberVerticalTabs = React.forwardRef<HTMLDivElement, AmberVerticalTabsProps>(
  ({ className, ...props }, ref) => {
    return (
      <AmberTabs
        ref={ref}
        orientation="vertical"
        className={cn('flex gap-6', className)}
        {...props}
      />
    );
  }
);

AmberVerticalTabs.displayName = 'AmberVerticalTabs';

export default AmberTabs;
