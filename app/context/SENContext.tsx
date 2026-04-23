import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as LocalStorage from '@/app/lib/storage';
import { useAuth } from '@/app/context/AuthContext';

interface SENContextType {
  senMode: boolean;
  toggleSENMode: () => void;
}

const SENContext = createContext<SENContextType>({
  senMode: false,
  toggleSENMode: () => {},
});

export function SENProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [senMode, setSenMode] = useState(false);

  useEffect(() => {
    let active = true;

    LocalStorage.loadSENMode(user?.id)
      .then((savedMode) => {
        if (active) {
          setSenMode(savedMode);
        }
      })
      .catch(() => {
        if (active) {
          setSenMode(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  const toggleSENMode = () => {
    setSenMode((previousValue) => {
      const nextValue = !previousValue;
      LocalStorage.saveSENMode(nextValue, user?.id);
      return nextValue;
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
