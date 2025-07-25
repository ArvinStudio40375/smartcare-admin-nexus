
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, X, CreditCard, Clock, DollarSign, User, Calendar } from 'lucide-react';

interface TopupRequest {
  id: string;
  user_id: string;
  user_type: string;
  amount: number;
  payment_method: string;
  bank_account: string;
  payment_proof: string;
  status: string;
  created_at: string;
}

const TopupConfirmation: React.FC = () => {
  const [topups, setTopups] = useState<TopupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadPendingTopups();
  }, []);

  const loadPendingTopups = async () => {
    try {
      const { data, error } = await supabase
        .from('topup_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTopups(data || []);
    } catch (error) {
      console.error('Error loading topups:', error);
      toast.error('Gagal memuat data top up');
    } finally {
      setLoading(false);
    }
  };

  const processTopup = async (topupId: string, approved: boolean) => {
    setProcessingId(topupId);
    try {
      const { error } = await supabase
        .from('topup_requests')
        .update({
          status: approved ? 'approved' : 'rejected',
          processed_at: new Date().toISOString(),
          admin_notes: approved ? 'Disetujui oleh admin' : 'Ditolak oleh admin'
        })
        .eq('id', topupId);

      if (error) throw error;

      if (approved) {
        // Update user balance
        const topup = topups.find(t => t.id === topupId);
        if (topup) {
          const table = topup.user_type === 'member' ? 'members' : 'partners';
          
          // Get current balance first
          const { data: currentUser, error: fetchError } = await supabase
            .from(table)
            .select('balance')
            .eq('id', topup.user_id)
            .single();

          if (fetchError) throw fetchError;

          // Update balance
          const newBalance = currentUser.balance + topup.amount;
          const { error: balanceError } = await supabase
            .from(table)
            .update({ balance: newBalance })
            .eq('id', topup.user_id);

          if (balanceError) throw balanceError;

          // Create transaction record
          await supabase.from('transactions').insert({
            transaction_type: 'topup',
            to_user_id: topup.user_id,
            to_user_type: topup.user_type,
            amount: topup.amount,
            description: `Top up saldo via ${topup.payment_method}`,
            reference_type: 'topup_request',
            reference_id: topupId,
            status: 'completed'
          });
        }
      }

      toast.success(approved ? 'Top up berhasil disetujui' : 'Top up ditolak');
      loadPendingTopups();
    } catch (error) {
      console.error('Error processing topup:', error);
      toast.error('Gagal memproses top up');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Memuat data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Konfirmasi Top Up
          </h2>
          <p className="text-gray-600">Kelola dan setujui permintaan top up saldo</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">
              {topups.length} Menunggu
            </span>
          </div>
          <Button 
            onClick={loadPendingTopups} 
            variant="outline"
            className="border-2 border-green-200 text-green-700 hover:bg-green-50"
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              Refresh
            </div>
          </Button>
        </div>
      </div>

      {topups.length === 0 ? (
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Tidak ada permintaan top up</h3>
                <p className="text-gray-500">Semua permintaan top up telah diproses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {topups.map((topup) => (
            <Card key={topup.id} className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">Top Up Request</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-green-100" />
                        <span className="text-green-100 text-sm">
                          {new Date(topup.created_at).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="bg-white/20 text-white border-white/30"
                  >
                    {topup.user_type === 'member' ? 'Member' : 'Partner'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Jumlah</p>
                        <p className="text-2xl font-bold text-green-600">
                          Rp {topup.amount.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Metode Pembayaran</p>
                        <p className="font-semibold text-blue-600">{topup.payment_method}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Rekening</p>
                        <p className="font-semibold text-purple-600">{topup.bank_account || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">User ID</p>
                        <p className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {topup.user_id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button
                    onClick={() => processTopup(topup.id, true)}
                    disabled={processingId === topup.id}
                    className="flex-1 h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {processingId === topup.id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Memproses...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        Setujui
                      </div>
                    )}
                  </Button>
                  <Button
                    onClick={() => processTopup(topup.id, false)}
                    disabled={processingId === topup.id}
                    variant="destructive"
                    className="flex-1 h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {processingId === topup.id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Memproses...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <X className="w-5 h-5" />
                        Tolak
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopupConfirmation;
