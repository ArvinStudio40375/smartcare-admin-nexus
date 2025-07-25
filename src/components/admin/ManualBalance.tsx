
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Send, Users, Shield } from 'lucide-react';

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
      // Update user balance
      const table = selectedUserType === 'member' ? 'members' : 'partners';
      const { error: balanceError } = await supabase
        .from(table)
        .update({
          balance: supabase.sql`balance + ${numAmount}`
        })
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Kirim Saldo Manual</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Kirim Saldo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="userType">Tipe Pengguna</Label>
              <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe pengguna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedUserType && (
              <div>
                <Label htmlFor="userId">Pilih Pengguna</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pengguna" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCurrentUsers().map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {getUserName(user)} - Saldo: Rp {user.balance.toLocaleString('id-ID')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="amount">Jumlah Saldo</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Masukkan jumlah saldo"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Input
                id="description"
                placeholder="Masukkan deskripsi transaksi"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button 
              onClick={sendManualBalance} 
              disabled={loading || !selectedUserType || !selectedUserId || !amount || !description}
              className="w-full"
            >
              {loading ? 'Mengirim...' : 'Kirim Saldo'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Statistik Pengguna
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Member</p>
                  <p className="text-2xl font-bold text-blue-600">{members.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>

              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Partner</p>
                  <p className="text-2xl font-bold text-green-600">{partners.length}</p>
                </div>
                <Shield className="w-8 h-8 text-green-600" />
              </div>

              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Saldo Member</p>
                  <p className="text-lg font-bold text-purple-600">
                    Rp {members.reduce((sum, member) => sum + member.balance, 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Saldo Partner</p>
                  <p className="text-lg font-bold text-orange-600">
                    Rp {partners.reduce((sum, partner) => sum + partner.balance, 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManualBalance;
