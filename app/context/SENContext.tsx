import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as LocalStorage from '@/app/lib/storage';

interface SENContextType {
  senMode: boolean;
  toggleSENMode: () => void;
}

const SENContext = createContext<SENContextType>({
  senMode: false,
  toggleSENMode: () => {},
});

export function SENProvider({ children }: { children: ReactNode }) {
  const [senMode, setSenMode] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load persisted SEN mode on mount
  useEffect(() => {
    LocalStorage.loadSENMode().then((savedMode) => {
      setSenMode(savedMode);
      setLoaded(true);
    }).catch(() => {
      setLoaded(true);
    });
  }, []);

  const toggleSENMode = () => {
    setSenMode(prev => {
      const newValue = !prev;
      // Persist to local storage
      LocalStorage.saveSENMode(newValue);
      return newValue;
    });
  };

  return (
    <SENContext.Provider value={{ senMode, toggleSENMode }}>
      {children}
    </SENContext.Provider>
  );
}

export function useSEN() {
  return useContext(SENContext);
}
