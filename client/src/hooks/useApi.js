import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

// User hooks
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await api.get('/user/me');
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/user');
      return data;
    },
  });
};

export const useUser = (username) => {
  return useQuery({
    queryKey: ['user', username],
    queryFn: async () => {
      const { data } = await api.get(`/user/${username}`);
      return data;
    },
    enabled: !!username,
  });
};

// Project hooks
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get('/projects');
      return data;
    },
  });
};

export const useProject = (id) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useUserProjects = (userId) => {
  return useQuery({
    queryKey: ['userProjects', userId],
    queryFn: async () => {
      const { data } = await api.get(`/projects/user/${userId}`);
      return data;
    },
    enabled: !!userId,
  });
};

// Mutations
export const useFollowUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId) => {
      const { data } = await api.post(`/user/${userId}/follow`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      queryClient.invalidateQueries(['users']);
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId) => {
      const { data } = await api.post(`/user/${userId}/unfollow`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      queryClient.invalidateQueries(['users']);
    },
  });
};

export const useLikeProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (projectId) => {
      const { data } = await api.post(`/projects/${projectId}/like`);
      return data;
    },
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries(['project', projectId]);
      queryClient.invalidateQueries(['projects']);
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.put('/user/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
    },
  });
};

// Notifications
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications');
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId) => {
      const { data } = await api.patch(`/notifications/${notificationId}/read`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });
};
