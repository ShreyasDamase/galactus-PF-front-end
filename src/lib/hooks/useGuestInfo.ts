// src/lib/hooks/useGuestInfo.ts
import { useState, useEffect } from 'react';

interface GuestInfo {
  name: string;
  email: string;
}

/**
 * Hook to manage guest user information in localStorage
 */
export function useGuestInfo() {
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    name: '',
    email: ''
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('guestName');
    const savedEmail = localStorage.getItem('guestEmail');
    
    if (savedName && savedEmail) {
      setGuestInfo({
        name: savedName,
        email: savedEmail
      });
    }
    
    setIsLoaded(true);
  }, []);

  const saveGuestInfo = (name: string, email: string) => {
    localStorage.setItem('guestName', name);
    localStorage.setItem('guestEmail', email);
    setGuestInfo({ name, email });
  };

  const clearGuestInfo = () => {
    localStorage.removeItem('guestName');
    localStorage.removeItem('guestEmail');
    setGuestInfo({ name: '', email: '' });
  };

  const hasGuestInfo = Boolean(guestInfo.name && guestInfo.email);

  return {
    guestInfo,
    saveGuestInfo,
    clearGuestInfo,
    hasGuestInfo,
    isLoaded
  };
}