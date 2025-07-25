
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
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPartners: 0,
    pendingTopups: 0,
    totalOrders: 0
  });

  const menuItems = [
    { id: 1, title: 'Verifikasi Mitra', icon: UserCheck, color: 'bg-blue-500', description: 'Lihat dan verifikasi mitra baru' },
    { id: 2, title: 'Konfirmasi Top Up', icon: CreditCard, color: 'bg-green-500', description: 'Setujui permintaan top up' },
    { id: 3, title: 'Kirim Saldo Manual', icon: Send, color: 'bg-purple-500', description: 'Transfer saldo ke user/mitra' },
    { id: 4, title: 'Manajemen User', icon: Users, color: 'bg-indigo-500', description: 'Kelola akun pengguna' },
    { id: 5, title: 'Manajemen Mitra', icon: Shield, color: 'bg-teal-500', description: 'Edit dan kelola data mitra' },
    { id: 6, title: 'Buat Voucher Saldo', icon: Gift, color: 'bg-pink-500', description: 'Generate voucher digital' },
    { id: 7, title: 'Riwayat Transaksi', icon: History, color: 'bg-orange-500', description: 'Lihat semua transaksi' },
    { id: 8, title: 'Pesanan Masuk', icon: ShoppingCart, color: 'bg-red-500', description: 'Pesanan layanan terbaru' },
    { id: 9, title: 'Statistik & Laporan', icon: BarChart3, color: 'bg-yellow-500', description: 'Analitik dan laporan' },
    { id: 10, title: 'Live Chat', icon: MessageSquare, color: 'bg-cyan-500', description: 'Chat dengan user/mitra' },
    { id: 11, title: 'Setting Aplikasi', icon: Settings, color: 'bg-gray-500', description: 'Pengaturan sistem' },
    { id: 12, title: 'Logout', icon: LogOut, color: 'bg-red-600', description: 'Keluar dari dashboard' }
  ];

  useEffect(() => {
    // Load initial stats - you can integrate with your Supabase data here
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    // Placeholder for Supabase integration
    // You can uncomment and modify this when integrating with your Supabase tables
    /*
    try {
      const { data: members } = await supabase.from('members').select('*');
      const { data: partners } = await supabase.from('partners').select('*');
      const { data: topups } = await supabase.from('topup_requests').select('*').eq('status', 'pending');
      const { data: orders } = await supabase.from('orders').select('*');
      
      setStats({
        totalUsers: members?.length || 0,
        totalPartners: partners?.length || 0,
        pendingTopups: topups?.length || 0,
        totalOrders: orders?.length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
    */
    
    // Demo data
    setStats({
      totalUsers: 1250,
      totalPartners: 89,
      pendingTopups: 15,
      totalOrders: 340
    });
  };

  const handleMenuClick = (menuId: number, title: string) => {
    if (menuId === 12) {
      // Logout
      localStorage.removeItem("admin_login");
      toast.success("Logout berhasil!");
      onLogout();
      return;
    }

    toast.info(`Mengakses ${title}...`);
    // Here you can add navigation to specific admin pages
    console.log(`Navigate to menu: ${title}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_login");
    toast.success("Logout berhasil!");
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
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
                <Shield className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">SmartCare Admin</h1>
                  <p className="text-sm text-gray-500">Dashboard Administratif</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">Administrator</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="animate-fade-in-up">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total User</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Mitra</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPartners}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Top Up</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingTopups}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pesanan</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Menu Administrasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {menuItems.map((item, index) => (
                <div
                  key={item.id}
                  className="menu-card p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => handleMenuClick(item.id, item.title)}
                >
                  <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-4`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
