
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, X, CreditCard } from 'lucide-react';

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
          const { error: balanceError } = await supabase
            .from(table)
            .update({
              balance: supabase.sql`balance + ${topup.amount}`
            })
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
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Konfirmasi Top Up</h2>
        <Button onClick={loadPendingTopups} variant="outline">
          Refresh
        </Button>
      </div>

      {topups.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Tidak ada permintaan top up yang menunggu</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {topups.map((topup) => (
            <Card key={topup.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Top Up Request
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {new Date(topup.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <Badge variant="outline">{topup.user_type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Jumlah</p>
                    <p className="font-medium text-lg">
                      Rp {topup.amount.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Metode Pembayaran</p>
                    <p className="font-medium">{topup.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rekening</p>
                    <p className="font-medium">{topup.bank_account || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">User ID</p>
                    <p className="font-medium font-mono text-xs">{topup.user_id}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => processTopup(topup.id, true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Setujui
                  </Button>
                  <Button
                    onClick={() => processTopup(topup.id, false)}
                    variant="destructive"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Tolak
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
