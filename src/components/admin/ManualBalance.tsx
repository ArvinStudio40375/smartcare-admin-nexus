
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Send, Users, Shield, Wallet, TrendingUp, DollarSign } from 'lucide-react';

interface User {
  id: string;
  full_name?: string;
  business_name?: string;
  email: string;
  balance: number;
}

const ManualBalance: React.FC = () => {
  const [members, setMembers] = useState<User[]>([]);
  const [partners, setPartners] = useState<User[]>([]);
  const [selectedUserType, setSelectedUserType] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const [membersResult, partnersResult] = await Promise.all([
        supabase.from('members').select('id, full_name, email, balance').eq('status', 'active'),
        supabase.from('partners').select('id, business_name, email, balance').eq('status', 'active')
      ]);

      if (membersResult.error) throw membersResult.error;
      if (partnersResult.error) throw partnersResult.error;

      setMembers(membersResult.data || []);
      setPartners(partnersResult.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Gagal memuat data pengguna');
    }
  };

  const sendManualBalance = async () => {
    if (!selectedUserType || !selectedUserId || !amount || !description) {
      toast.error('Semua field harus diisi');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Jumlah saldo harus berupa angka positif');
      return;
    }

    setLoading(true);

    try {
      // Get current balance first
      const table = selectedUserType === 'member' ? 'members' : 'partners';
      const { data: currentUser, error: fetchError } = await supabase
        .from(table)
        .select('balance')
        .eq('id', selectedUserId)
        .single();

      if (fetchError) throw fetchError;

      // Update user balance
      const newBalance = currentUser.balance + numAmount;
      const { error: balanceError } = await supabase
        .from(table)
        .update({ balance: newBalance })
        .eq('id', selectedUserId);

      if (balanceError) throw balanceError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          transaction_type: 'manual_credit',
          to_user_id: selectedUserId,
          to_user_type: selectedUserType,
          amount: numAmount,
          description: description,
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      toast.success('Saldo berhasil dikirim');
      setSelectedUserType('');
      setSelectedUserId('');
      setAmount('');
      setDescription('');
      loadUsers();
    } catch (error) {
      console.error('Error sending balance:', error);
      toast.error('Gagal mengirim saldo');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUsers = () => {
    return selectedUserType === 'member' ? members : partners;
  };

  const getUserName = (user: User) => {
    return user.full_name || user.business_name || 'Unknown';
  };

  const totalMemberBalance = members.reduce((sum, member) => sum + member.balance, 0);
  const totalPartnerBalance = partners.reduce((sum, partner) => sum + partner.balance, 0);

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Kirim Saldo Manual
          </h2>
          <p className="text-gray-600">Transfer saldo langsung ke member atau partner</p>
        </div>
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border">
          <Wallet className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">Manajemen Saldo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Send Balance Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl font-bold">Kirim Saldo</div>
                <div className="text-blue-100 text-sm font-normal">Transfer saldo ke pengguna</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="userType" className="text-sm font-semibold text-gray-700">
                Tipe Pengguna
              </Label>
              <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg">
                  <SelectValue placeholder="Pilih tipe pengguna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      Member
                    </div>
                  </SelectItem>
                  <SelectItem value="partner">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      Partner
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedUserType && (
              <div className="space-y-2">
                <Label htmlFor="userId" className="text-sm font-semibold text-gray-700">
                  Pilih Pengguna
                </Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg">
                    <SelectValue placeholder="Pilih pengguna" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCurrentUsers().map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex justify-between items-center w-full">
                          <span className="font-medium">{getUserName(user)}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            Saldo: Rp {user.balance.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-semibold text-gray-700">
                Jumlah Saldo
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="Masukkan jumlah saldo"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                Deskripsi
              </Label>
              <Input
                id="description"
                placeholder="Masukkan deskripsi transaksi"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
              />
            </div>

            <Button 
              onClick={sendManualBalance} 
              disabled={loading || !selectedUserType || !selectedUserId || !amount || !description}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Mengirim...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Kirim Saldo
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl font-bold">Statistik Pengguna</div>
                <div className="text-green-100 text-sm font-normal">Ringkasan data pengguna</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Member</p>
                      <p className="text-3xl font-bold">{members.length}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <Users className="w-8 h-8" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total Partner</p>
                      <p className="text-3xl font-bold">{partners.length}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <Shield className="w-8 h-8" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Total Saldo Member</p>
                      <p className="text-xl font-bold">
                        Rp {totalMemberBalance.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <Wallet className="w-8 h-8" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Total Saldo Partner</p>
                      <p className="text-xl font-bold">
                        Rp {totalPartnerBalance.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <Wallet className="w-8 h-8" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManualBalance;
