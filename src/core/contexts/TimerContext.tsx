import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const TimerContext = createContext<number>(Date.now());

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [now, setNow] = useState(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <TimerContext.Provider value={now}>
      {children}
    </TimerContext.Provider>
  );
};

export function useSharedNow(): number {
  return useContext(TimerContext);
}
