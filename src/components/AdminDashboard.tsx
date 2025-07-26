
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  CreditCard, 
  Send, 
  Settings, 
  BarChart3, 
  MessageSquare, 
  ShoppingCart, 
  Gift, 
  History, 
  LogOut,
  Menu,
  X,
  Shield,
  Bell,
  Search,
  BellRing,
  AlertCircle,
  MessageCircle,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Import admin components
import PartnerVerification from './admin/PartnerVerification';
import TopupConfirmation from './admin/TopupConfirmation';
import ManualBalance from './admin/ManualBalance';
import LiveChat from './admin/LiveChat';
import VoucherCreator from './admin/VoucherCreator';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface NotificationData {
  partnerVerificationCount: number;
  topupRequestCount: number;
  unreadChatCount: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [notifications, setNotifications] = useState<NotificationData>({
    partnerVerificationCount: 0,
    topupRequestCount: 0,
    unreadChatCount: 0
  });
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPartners: 0,
    pendingTopups: 0,
    totalOrders: 0
  });

  // Service grid items with modern design
  const serviceItems = [
    { 
      id: 'partner_verification', 
      title: 'Verifikasi Mitra', 
      icon: UserCheck, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Kelola verifikasi mitra baru',
      category: 'management'
    },
    { 
      id: 'topup_confirmation', 
      title: 'Konfirmasi Topup', 
      icon: CreditCard, 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      description: 'Setujui permintaan topup',
      category: 'finance'
    },
    { 
      id: 'manual_balance', 
      title: 'Kirim Saldo', 
      icon: Send, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Transfer saldo manual',
      category: 'finance'
    },
    { 
      id: 'live_chat', 
      title: 'Live Chat', 
      icon: MessageSquare, 
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50',
      description: 'Chat dengan users',
      category: 'communication'
    },
    { 
      id: 'voucher_creator', 
      title: 'Buat Voucher', 
      icon: Gift, 
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      description: 'Generate voucher saldo',
      category: 'finance'
    },
    { 
      id: 'user_management', 
      title: 'Kelola User', 
      icon: Users, 
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Manajemen pengguna',
      category: 'management'
    },
    { 
      id: 'orders', 
      title: 'Pesanan', 
      icon: ShoppingCart, 
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      description: 'Kelola pesanan masuk',
      category: 'orders'
    },
    { 
      id: 'statistics', 
      title: 'Statistik', 
      icon: BarChart3, 
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'Analitik & laporan',
      category: 'analytics'
    }
  ];

  useEffect(() => {
    loadDashboardStats();
    loadNotifications();
    
    // Setup real-time notifications
    const notificationChannel = supabase
      .channel('admin-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'partners' }, () => {
        loadNotifications();
        playNotificationSound();
        showDesktopNotification('Mitra Baru', 'Ada pendaftar mitra baru yang perlu diverifikasi');
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'topup_requests' }, () => {
        loadNotifications();
        playNotificationSound();
        showDesktopNotification('Permintaan Topup', 'Ada permintaan topup saldo baru');
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, () => {
        loadNotifications();
        playNotificationSound();
        showDesktopNotification('Pesan Baru', 'Ada pesan chat baru masuk');
      })
      .subscribe();

    // Request notification permission
    requestNotificationPermission();

    return () => {
      supabase.removeChannel(notificationChannel);
    };
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const showDesktopNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH8N2QQAoUXrTp66hVFApGn+DyvmccBjiS2O3GeykGJHfH=');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Fallback jika audio gagal
        console.log('Audio notification failed');
      });
    } catch (error) {
      console.log('Audio notification error:', error);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const [membersResult, partnersResult, topupsResult, ordersResult] = await Promise.all([
        supabase.from('members').select('*', { count: 'exact' }),
        supabase.from('partners').select('*', { count: 'exact' }),
        supabase.from('topup_requests').select('*', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('orders').select('*', { count: 'exact' })
      ]);

      setStats({
        totalUsers: membersResult.count || 0,
        totalPartners: partnersResult.count || 0,
        pendingTopups: topupsResult.count || 0,
        totalOrders: ordersResult.count || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const [partnersResult, topupsResult, chatsResult] = await Promise.all([
        supabase.from('partners').select('*', { count: 'exact' }).eq('verification_status', 'pending'),
        supabase.from('topup_requests').select('*', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('chat_messages').select('*', { count: 'exact' }).eq('is_read', false).neq('sender_type', 'admin')
      ]);

      setNotifications({
        partnerVerificationCount: partnersResult.count || 0,
        topupRequestCount: topupsResult.count || 0,
        unreadChatCount: chatsResult.count || 0
      });
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleMenuClick = (menuId: string, title: string) => {
    setCurrentView(menuId);
    toast.info(`Mengakses ${title}...`);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_login");
    toast.success("Logout berhasil!");
    onLogout();
  };

  const getTotalNotifications = () => {
    return notifications.partnerVerificationCount + notifications.topupRequestCount + notifications.unreadChatCount;
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'partner_verification':
        return <PartnerVerification />;
      case 'topup_confirmation':
        return <TopupConfirmation />;
      case 'manual_balance':
        return <ManualBalance />;
      case 'live_chat':
        return <LiveChat />;
      case 'voucher_creator':
        return <VoucherCreator />;
      case 'user_management':
        return <div className="p-8 text-center">Manajemen User - Coming Soon</div>;
      case 'partner_management':
        return <div className="p-8 text-center">Manajemen Mitra - Coming Soon</div>;
      case 'transaction_history':
        return <div className="p-8 text-center">Riwayat Transaksi - Coming Soon</div>;
      case 'orders':
        return <div className="p-8 text-center">Pesanan Masuk - Coming Soon</div>;
      case 'statistics':
        return <div className="p-8 text-center">Statistik & Laporan - Coming Soon</div>;
      case 'settings':
        return <div className="p-8 text-center">Setting Aplikasi - Coming Soon</div>;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Banner - GoLife Style */}
      <div className="relative bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 rounded-3xl p-6 text-white overflow-hidden">
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Selamat Datang Admin</h1>
                <p className="text-orange-100">SmartCare Indonesia</p>
              </div>
            </div>
            <p className="text-orange-100 text-sm">Kelola sistem dengan mudah dan efisien</p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <div className="text-3xl font-bold">Rp 50.000.000</div>
              <div className="text-orange-100 text-sm">Saldo Sistem</div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
      </div>

      {/* Stats Cards - Modern Design */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white rounded-2xl shadow-sm border-0 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total User</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-xs text-green-600">+12% dari bulan lalu</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-sm border-0 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Mitra</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPartners}</p>
                <p className="text-xs text-green-600">+8% dari bulan lalu</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-sm border-0 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending Topup</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingTopups}</p>
                <p className="text-xs text-orange-600">Perlu review</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-sm border-0 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Pesanan</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                <p className="text-xs text-purple-600">Hari ini: 24</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Grid - GoLife Style */}
      <Card className="bg-white rounded-3xl shadow-sm border-0 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Menu Administrasi</h2>
            <p className="text-gray-600 text-sm">Kelola semua fitur sistem</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari menu..."
              className="pl-10 w-64 rounded-xl border-gray-200 focus:border-orange-400"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {serviceItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all duration-300 group hover:scale-105 hover:shadow-lg"
              onClick={() => handleMenuClick(item.id, item.title)}
            >
              <div className={`w-14 h-14 ${item.bgColor} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className="w-7 h-7 text-gray-700" />
              </div>
              <span className="text-xs font-medium text-gray-900 text-center leading-tight">
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white rounded-3xl shadow-sm border-0 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Aksi Cepat</h2>
          <Badge variant="outline" className="text-orange-600 border-orange-200">
            Urgent
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={() => handleMenuClick('partner_verification', 'Verifikasi Mitra')}
            className="h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <UserCheck className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Verifikasi Mitra</div>
                <div className="text-xs opacity-80">{notifications.partnerVerificationCount} pending</div>
              </div>
            </div>
          </Button>
          
          <Button 
            onClick={() => handleMenuClick('topup_confirmation', 'Konfirmasi Top Up')}
            className="h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Konfirmasi Topup</div>
                <div className="text-xs opacity-80">{notifications.topupRequestCount} menunggu</div>
              </div>
            </div>
          </Button>
          
          <Button 
            onClick={() => handleMenuClick('live_chat', 'Live Chat')}
            className="h-16 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Live Chat</div>
                <div className="text-xs opacity-80">{notifications.unreadChatCount} pesan baru</div>
              </div>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="flex items-center ml-4 lg:ml-0">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-3">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">SmartCare Admin</h1>
                  <p className="text-sm text-gray-500">Dashboard Administratif</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentView !== 'dashboard' && (
                <Button
                  onClick={() => setCurrentView('dashboard')}
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex rounded-xl"
                >
                  Dashboard
                </Button>
              )}
              
              {/* Notification Bell */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="relative rounded-xl"
                  onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                >
                  {getTotalNotifications() > 0 ? <BellRing className="w-4 h-4 text-orange-500" /> : <Bell className="w-4 h-4" />}
                  {getTotalNotifications() > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {getTotalNotifications() > 99 ? '99+' : getTotalNotifications()}
                    </span>
                  )}
                </Button>
                
                {/* Notification Panel */}
                {showNotificationPanel && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border z-50">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Notifikasi</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowNotificationPanel(false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.partnerVerificationCount > 0 && (
                        <div 
                          className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            handleMenuClick('partner_verification', 'Verifikasi Mitra');
                            setShowNotificationPanel(false);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <UserCheck className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Verifikasi Mitra Baru</p>
                              <p className="text-sm text-gray-600">{notifications.partnerVerificationCount} mitra menunggu verifikasi</p>
                              <p className="text-xs text-gray-400">Baru saja</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {notifications.topupRequestCount > 0 && (
                        <div 
                          className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            handleMenuClick('topup_confirmation', 'Konfirmasi Topup');
                            setShowNotificationPanel(false);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <CreditCard className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Permintaan Topup</p>
                              <p className="text-sm text-gray-600">{notifications.topupRequestCount} permintaan topup saldo</p>
                              <p className="text-xs text-gray-400">Baru saja</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {notifications.unreadChatCount > 0 && (
                        <div 
                          className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            handleMenuClick('live_chat', 'Live Chat');
                            setShowNotificationPanel(false);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <MessageCircle className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Pesan Chat Baru</p>
                              <p className="text-sm text-gray-600">{notifications.unreadChatCount} pesan belum dibaca</p>
                              <p className="text-xs text-gray-400">Baru saja</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {getTotalNotifications() === 0 && (
                        <div className="p-8 text-center">
                          <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">Tidak ada notifikasi baru</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">Administrator</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
              
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default AdminDashboard;
