
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Gift, Plus, Eye, Calendar } from 'lucide-react';

interface Voucher {
  id: string;
  voucher_name: string;
  voucher_code: string;
  amount: number;
  usage_limit: number;
  used_count: number;
  valid_until: string;
  status: string;
  created_at: string;
}

const VoucherCreator: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [voucherName, setVoucherName] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [amount, setAmount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      const { data, error } = await supabase
        .from('balance_vouchers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVouchers(data || []);
    } catch (error) {
      console.error('Error loading vouchers:', error);
      toast.error('Gagal memuat voucher');
    }
  };

  const generateVoucherCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setVoucherCode(code);
  };

  const createVoucher = async () => {
    if (!voucherName || !voucherCode || !amount || !usageLimit || !validUntil) {
      toast.error('Semua field harus diisi');
      return;
    }

    const numAmount = parseFloat(amount);
    const numUsageLimit = parseInt(usageLimit);

    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Nominal harus berupa angka positif');
      return;
    }

    if (isNaN(numUsageLimit) || numUsageLimit <= 0) {
      toast.error('Batas penggunaan harus berupa angka positif');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('balance_vouchers')
        .insert({
          voucher_name: voucherName,
          voucher_code: voucherCode,
          amount: numAmount,
          usage_limit: numUsageLimit,
          valid_until: validUntil,
          status: 'active'
        });

      if (error) throw error;

      toast.success('Voucher berhasil dibuat');
      setVoucherName('');
      setVoucherCode('');
      setAmount('');
      setUsageLimit('');
      setValidUntil('');
      loadVouchers();
    } catch (error) {
      console.error('Error creating voucher:', error);
      toast.error('Gagal membuat voucher');
    } finally {
      setLoading(false);
    }
  };

  const toggleVoucherStatus = async (voucherId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('balance_vouchers')
        .update({ status: newStatus })
        .eq('id', voucherId);

      if (error) throw error;

      toast.success(`Voucher ${newStatus === 'active' ? 'diaktifkan' : 'dinonaktifkan'}`);
      loadVouchers();
    } catch (error) {
      console.error('Error updating voucher status:', error);
      toast.error('Gagal mengubah status voucher');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Buat Voucher Saldo</h2>
        <Button onClick={loadVouchers} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Voucher Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Buat Voucher Baru
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="voucherName">Nama Voucher</Label>
              <Input
                id="voucherName"
                placeholder="Masukkan nama voucher"
                value={voucherName}
                onChange={(e) => setVoucherName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="voucherCode">Kode Voucher</Label>
              <div className="flex gap-2">
                <Input
                  id="voucherCode"
                  placeholder="Kode voucher"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                />
                <Button onClick={generateVoucherCode} variant="outline">
                  Generate
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="amount">Nominal (Rp)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Masukkan nominal voucher"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="usageLimit">Batas Penggunaan</Label>
              <Input
                id="usageLimit"
                type="number"
                placeholder="Masukkan batas penggunaan"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="validUntil">Berlaku Hingga</Label>
              <Input
                id="validUntil"
                type="datetime-local"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>

            <Button 
              onClick={createVoucher} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Membuat...' : 'Buat Voucher'}
            </Button>
          </CardContent>
        </Card>

        {/* Voucher Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Statistik Voucher
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Voucher Aktif</p>
                  <p className="text-2xl font-bold text-green-600">
                    {vouchers.filter(v => v.status === 'active').length}
                  </p>
                </div>
                <Gift className="w-8 h-8 text-green-600" />
              </div>

              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Voucher</p>
                  <p className="text-2xl font-bold text-blue-600">{vouchers.length}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-600" />
              </div>

              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Nominal</p>
                  <p className="text-lg font-bold text-purple-600">
                    Rp {vouchers.reduce((sum, voucher) => sum + voucher.amount, 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voucher List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Voucher</CardTitle>
        </CardHeader>
        <CardContent>
          {vouchers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada voucher yang dibuat
            </div>
          ) : (
            <div className="space-y-4">
              {vouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{voucher.voucher_name}</h3>
                      <Badge variant={voucher.status === 'active' ? 'default' : 'secondary'}>
                        {voucher.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Kode: <span className="font-mono font-bold">{voucher.voucher_code}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Nominal: Rp {voucher.amount.toLocaleString('id-ID')} | 
                      Digunakan: {voucher.used_count}/{voucher.usage_limit}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Berlaku hingga: {new Date(voucher.valid_until).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <Button
                    onClick={() => toggleVoucherStatus(voucher.id, voucher.status)}
                    variant={voucher.status === 'active' ? 'destructive' : 'default'}
                    size="sm"
                  >
                    {voucher.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoucherCreator;
