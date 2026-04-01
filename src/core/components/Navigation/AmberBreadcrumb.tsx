import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home, MoreHorizontal } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils/cn';

// --- Types ---

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
  hidden?: boolean;
}

export interface AmberBreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items?: BreadcrumbItem[];
  home?: BreadcrumbItem;
  separator?: React.ReactNode;
  maxItems?: number;
  showHome?: boolean;
}

// --- Breadcrumb Context ---

interface BreadcrumbContextValue {
  items: BreadcrumbItem[];
  addItem: (item: BreadcrumbItem) => void;
}

const BreadcrumbContext = React.createContext<BreadcrumbContextValue | null>(null);

const useBreadcrumbContext = () => {
  const context = React.useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('Breadcrumb components must be used within AmberBreadcrumb');
  }
  return context;
};

// --- Root Breadcrumb Component ---

/**
 * AmberBreadcrumb - Breadcrumb navigation
 *
 * @example
 * // Manual items
 * <AmberBreadcrumb
 *   items={[
 *     { label: 'Products', href: '/products' },
 *     { label: 'Categories', href: '/products/categories' },
 *     { label: 'Electronics' }
 *   ]}
 * />
 *
 * @example
 * // Auto-generate from current path
 * <AmberBreadcrumb autoGenerate />
 *
 * @example
 * // With max items (collapses middle items)
 * <AmberBreadcrumb maxItems={4} />
 */
export const AmberBreadcrumb = React.forwardRef<HTMLElement, AmberBreadcrumbProps>(
  (
    {
      items: propItems,
      home,
      separator,
      maxItems = 4,
      showHome = true,
      className,
      ...props
    },
    ref
  ) => {
    const { t, dir } = useLanguage();
    const location = useLocation();

    // Default home item
    const defaultHome: BreadcrumbItem = {
      label: t('common.home') || 'Home',
      href: '/',
      icon: Home,
    };

    const homeItem = home ?? defaultHome;

    // Auto-generate items from path if not provided
    const generateItemsFromPath = (): BreadcrumbItem[] => {
      const pathSegments = location.pathname.split('/').filter(Boolean);

      return pathSegments.map((segment, index) => {
        const href = '/' + pathSegments.slice(0, index + 1).join('/');
        // Format segment: remove ID-like patterns, capitalize
        const label = segment
          .replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, '...')
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        return {
          label,
          href,
        };
      });
    };

    const items = propItems || generateItemsFromPath();

    // Collapse middle items if too many
    const getVisibleItems = (): BreadcrumbItem[] => {
      if (items.length <= maxItems) {
        return items;
      }

      // Always show first item and last (maxItems - 2) items
      return [
        items[0],
        { label: '...', hidden: true },
        ...items.slice(-(maxItems - 2)),
      ];
    };

    const visibleItems = showHome ? [homeItem, ...getVisibleItems()] : getVisibleItems();

    // Default separator
    const defaultSeparator = (
      <ChevronRight className={cn(
        'w-4 h-4 text-zinc-muted/50 flex-shrink-0',
        dir === 'rtl' ? 'rotate-180' : ''
      )} />
    );

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn('flex items-center gap-1 text-sm', className)}
        {...props}
      >
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;
          const Icon = item.icon;

          return (
            <React.Fragment key={index}>
              {/* Item */}
              <div className={cn(
                'flex items-center gap-1',
                isLast ? 'text-zinc-text font-bold' : 'text-zinc-muted'
              )}>
                {Icon && !isLast && (
                  <Icon className="w-4 h-4 flex-shrink-0" />
                )}
                {item.hidden ? (
                  <MoreHorizontal className="w-4 h-4 flex-shrink-0" />
                ) : item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className={cn(
                      'hover:text-brand transition-colors truncate max-w-[150px]',
                      'flex items-center gap-1'
                    )}
                  >
                    <span className="truncate">{item.label}</span>
                  </Link>
                ) : (
                  <span className="truncate max-w-[150px]" aria-current="page">
                    {item.label}
                  </span>
                )}
              </div>

              {/* Separator */}
              {!isLast && (
                <span className={cn(
                  'flex-shrink-0 mx-1',
                  dir === 'rtl' ? 'rotate-180' : ''
                )}>
                  {separator || defaultSeparator}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    );
  }
);

AmberBreadcrumb.displayName = 'AmberBreadcrumb';

// --- Structured Breadcrumb Components ---

export interface AmberBreadcrumbListProps extends React.OlHTMLAttributes<HTMLOListElement> {
  separator?: React.ReactNode;
}

/**
 * AmberBreadcrumbList - Container for structured breadcrumbs
 *
 * @example
 * <AmberBreadcrumbList>
 *   <AmberBreadcrumbItem>
 *     <AmberBreadcrumbLink href="/home">Home</AmberBreadcrumbLink>
 *   </AmberBreadcrumbItem>
 *   <AmberBreadcrumbSeparator />
 *   <AmberBreadcrumbItem>
 *     <AmberBreadcrumbLink href="/products">Products</AmberBreadcrumbLink>
 *   </AmberBreadcrumbItem>
 *   <AmberBreadcrumbSeparator />
 *   <AmberBreadcrumbItem>
 *     <AmberBreadcrumbPage>Details</AmberBreadcrumbPage>
 *   </AmberBreadcrumbItem>
 * </AmberBreadcrumbList>
 */
export const AmberBreadcrumbList = React.forwardRef<
  HTMLOListElement,
  AmberBreadcrumbListProps
>(({ className, separator, children, ...props }, ref) => {
  const { dir } = useLanguage();

  const defaultSeparator = (
    <ChevronRight className={cn(
      'w-4 h-4 text-zinc-muted/50',
      dir === 'rtl' ? 'rotate-180' : ''
    )} />
  );

  // Clone children to inject separator between them
  const childrenArray = React.Children.toArray(children);
  const enhancedChildren = childrenArray.flatMap((child, index) => {
    if (index === childrenArray.length - 1) return [child];
    return [
      child,
      <li key={`separator-${index}`} className="flex-shrink-0 mx-1">
        {separator || defaultSeparator}
      </li>,
    ];
  });

  return (
    <ol
      ref={ref}
      className={cn('flex items-center gap-1', className)}
      {...props}
    >
      {enhancedChildren}
    </ol>
  );
});

AmberBreadcrumbList.displayName = 'AmberBreadcrumbList';

export interface AmberBreadcrumbItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  /**
   * The breadcrumb item
   */
  children: React.ReactNode;
}

/**
 * AmberBreadcrumbItem - Individual breadcrumb item container
 */
export const AmberBreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  AmberBreadcrumbItemProps
>(({ className, children, ...props }, ref) => {
  return (
    <li ref={ref} className={cn('flex items-center gap-1', className)} {...props}>
      {children}
    </li>
  );
});

AmberBreadcrumbItem.displayName = 'AmberBreadcrumbItem';

export interface AmberBreadcrumbLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  as?: React.ElementType;
  to?: string;
}

/**
 * AmberBreadcrumbLink - Clickable breadcrumb link
 */
export const AmberBreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  AmberBreadcrumbLinkProps
>(({ className, as: Component = Link, to, href, children, ...props }, ref) => {
  const content = (
    <Component
      ref={ref as any}
      to={to || (href as string)}
      href={href}
      className={cn(
        'text-zinc-muted hover:text-brand transition-colors truncate',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );

  return content;
});

AmberBreadcrumbLink.displayName = 'AmberBreadcrumbLink';

export interface AmberBreadcrumbPageProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

/**
 * AmberBreadcrumbPage - Current page breadcrumb (non-link)
 */
export const AmberBreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  AmberBreadcrumbPageProps
>(({ className, children, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn('text-zinc-text font-bold truncate', className)}
      aria-current="page"
      {...props}
    >
      {children}
    </span>
  );
});

AmberBreadcrumbPage.displayName = 'AmberBreadcrumbPage';

export interface AmberBreadcrumbSeparatorProps extends React.HTMLAttributes<HTMLLIElement> {
  children?: React.ReactNode;
}

/**
 * AmberBreadcrumbSeparator - Separator between breadcrumb items
 */
export const AmberBreadcrumbSeparator = React.forwardRef<
  HTMLLIElement,
  AmberBreadcrumbSeparatorProps
>(({ children, className, ...props }, ref) => {
  const { dir } = useLanguage();

  return (
    <li
      ref={ref}
      className={cn(
        'flex-shrink-0 mx-1 text-zinc-muted/50',
        dir === 'rtl' && 'rotate-180',
        className
      )}
      role="presentation"
      {...props}
    >
      {children || <ChevronRight className="w-4 h-4" />}
    </li>
  );
});

AmberBreadcrumbSeparator.displayName = 'AmberBreadcrumbSeparator';

// --- Ellipsis Indicator for Collapsed Breadcrumbs ---

export interface AmberBreadcrumbEllipsisProps extends React.HTMLAttributes<HTMLSpanElement> {}

/**
 * AmberBreadcrumbEllipsis - Ellipsis indicator for collapsed breadcrumbs
 */
export const AmberBreadcrumbEllipsis = React.forwardRef<
  HTMLSpanElement,
  AmberBreadcrumbEllipsisProps
>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn('flex items-center gap-1 text-zinc-muted', className)}
      {...props}
    >
      <MoreHorizontal className="w-4 h-4" />
      <span className="sr-only">More</span>
    </span>
  );
});

AmberBreadcrumbEllipsis.displayName = 'AmberBreadcrumbEllipsis';

// --- Hook for Dynamic Breadcrumbs ---

export interface UseBreadcrumbOptions {
  items?: BreadcrumbItem[];
  autoGenerate?: boolean;
  home?: BreadcrumbItem;
  showHome?: boolean;
}

/**
 * useBreadcrumb - Hook for managing breadcrumb state
 *
 * @example
 * function MyPage() {
 *   const { Breadcrumb, addItem } = useBreadcrumb({
 *     autoGenerate: true
 *   });
 *
 *   useEffect(() => {
 *     addItem({ label: 'My Page', href: '/my-page' });
 *   }, []);
 *
 *   return (
 *     <>
 *       <Breadcrumb />
 *       {/* Page content *\/}
 *     </>
 *   );
 * }
 */
export function useBreadcrumb(options: UseBreadcrumbOptions = {}) {
  const { items: propItems, autoGenerate = false, home, showHome = true } = options;
  const [items, setItems] = React.useState<BreadcrumbItem[]>(propItems || []);

  const addItem = React.useCallback((item: BreadcrumbItem) => {
    setItems(prev => [...prev, item]);
  }, []);

  const setItemsDirectly = React.useCallback((newItems: BreadcrumbItem[]) => {
    setItems(newItems);
  }, []);

  const clearItems = React.useCallback(() => {
    setItems([]);
  }, []);

  const BreadcrumbComponent = React.useCallback(
    (props?: Omit<AmberBreadcrumbProps, 'items' | 'home' | 'showHome'>) => (
      <AmberBreadcrumb
        items={items.length > 0 ? items : undefined}
        home={home}
        showHome={showHome}
        {...props}
      />
    ),
    [items, home, showHome]
  );

  return {
    items,
    addItem,
    setItems: setItemsDirectly,
    clearItems,
    Breadcrumb: BreadcrumbComponent,
  };
}

export default AmberBreadcrumb;
