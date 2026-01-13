import { useEffect } from 'react';
import { socketService } from '../services/socket';
import { useAuthStore } from '../store/useStore';

export const useSocket = () => {
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated && token) {
      socketService.connect(token);
    }

    return () => {
      if (!isAuthenticated) {
        socketService.disconnect();
      }
    };
  }, [isAuthenticated, token]);

  return socketService;
};
