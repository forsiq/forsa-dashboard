import React from 'react';
import { useRouteProgress } from './RouteProgressContext';

export function RouteProgressBar() {
  const { isNavigating } = useRouteProgress();

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[200] h-[3px] overflow-hidden">
      <div className="h-full bg-brand animate-route-progress origin-left" />
      <style jsx>{`
        @keyframes route-progress {
          0% {
            transform: scaleX(0);
          }
          20% {
            transform: scaleX(0.3);
          }
          50% {
            transform: scaleX(0.6);
          }
          80% {
            transform: scaleX(0.85);
          }
          100% {
            transform: scaleX(0.95);
          }
        }
        .animate-route-progress {
          animation: route-progress 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
