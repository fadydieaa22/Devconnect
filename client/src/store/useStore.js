import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem('token'),
      isAuthenticated: !!localStorage.getItem('token'),
      
      setUser: (user) => set({ user, isAuthenticated: true }),
      
      setToken: (token) => {
        localStorage.setItem('token', token);
        set({ token, isAuthenticated: true });
      },
      
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      updateUser: (updates) => set((state) => ({ 
        user: { ...state.user, ...updates } 
      })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + 1,
  })),
  
  setNotifications: (notifications) => set({ 
    notifications,
    unreadCount: notifications.filter(n => !n.isRead).length,
  }),
  
  markAsRead: (notificationId) => set((state) => ({
    notifications: state.notifications.map(n => 
      n._id === notificationId ? { ...n, isRead: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),
  
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true })),
    unreadCount: 0,
  })),
  
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));

export const useUIStore = create((set) => ({
  theme: localStorage.getItem('theme') || 'dark',
  sidebarOpen: true,
  
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('light', theme === 'light');
    set({ theme });
  },
  
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
    return { theme: newTheme };
  }),
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

export const useMessageStore = create((set) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  unreadMessages: 0,
  
  setConversations: (conversations) => set({ conversations }),
  
  setActiveConversation: (conversation) => set({ 
    activeConversation: conversation 
  }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),
  
  setMessages: (messages) => set({ messages }),
  
  updateUnreadCount: (count) => set({ unreadMessages: count }),
}));
