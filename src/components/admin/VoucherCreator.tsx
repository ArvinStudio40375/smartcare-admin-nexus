
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Gift, Plus, Eye, Calendar, Sparkles, Zap, DollarSign, Users, Clock } from 'lucide-react';

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

  const activeVouchers = vouchers.filter(v => v.status === 'active');
  const totalVoucherValue = vouchers.reduce((sum, voucher) => sum + voucher.amount, 0);

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Buat Voucher Saldo
          </h2>
          <p className="text-gray-600">Kelola dan buat voucher digital untuk member dan partner</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border">
            <Gift className="w-5 h-5 text-pink-500" />
            <span className="text-sm font-medium text-gray-700">
              {vouchers.length} Voucher
            </span>
          </div>
          <Button 
            onClick={loadVouchers} 
            variant="outline"
            className="border-2 border-pink-200 text-pink-700 hover:bg-pink-50"
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              Refresh
            </div>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Voucher Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl font-bold">Buat Voucher Baru</div>
                <div className="text-pink-100 text-sm font-normal">Generate voucher digital</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="voucherName" className="text-sm font-semibold text-gray-700">
                Nama Voucher
              </Label>
              <Input
                id="voucherName"
                placeholder="Masukkan nama voucher"
                value={voucherName}
                onChange={(e) => setVoucherName(e.target.value)}
                className="h-12 border-2 border-gray-200 focus:border-pink-500 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="voucherCode" className="text-sm font-semibold text-gray-700">
                Kode Voucher
              </Label>
              <div className="flex gap-2">
                <Input
                  id="voucherCode"
                  placeholder="Kode voucher"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  className="h-12 border-2 border-gray-200 focus:border-pink-500 rounded-lg"
                />
                <Button 
                  onClick={generateVoucherCode} 
                  variant="outline"
                  className="h-12 px-4 border-2 border-pink-200 text-pink-700 hover:bg-pink-50"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-semibold text-gray-700">
                Nominal (Rp)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="Masukkan nominal voucher"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10 h-12 border-2 border-gray-200 focus:border-pink-500 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="usageLimit" className="text-sm font-semibold text-gray-700">
                Batas Penggunaan
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="usageLimit"
                  type="number"
                  placeholder="Masukkan batas penggunaan"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  className="pl-10 h-12 border-2 border-gray-200 focus:border-pink-500 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil" className="text-sm font-semibold text-gray-700">
                Berlaku Hingga
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="validUntil"
                  type="datetime-local"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="pl-10 h-12 border-2 border-gray-200 focus:border-pink-500 rounded-lg"
                />
              </div>
            </div>

            <Button 
              onClick={createVoucher} 
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Membuat...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Buat Voucher
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Voucher Statistics */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl font-bold">Statistik Voucher</div>
                <div className="text-purple-100 text-sm font-normal">Ringkasan voucher digital</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Voucher Aktif</p>
                      <p className="text-3xl font-bold">{activeVouchers.length}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <Gift className="w-8 h-8" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Voucher</p>
                      <p className="text-3xl font-bold">{vouchers.length}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <Eye className="w-8 h-8" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Total Nominal</p>
                      <p className="text-xl font-bold">
                        Rp {totalVoucherValue.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <DollarSign className="w-8 h-8" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voucher List */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-bold">Daftar Voucher</div>
              <div className="text-indigo-100 text-sm font-normal">Kelola semua voucher digital</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {vouchers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Belum ada voucher</h3>
                <p className="text-gray-500">Buat voucher pertama untuk memulai</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {vouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="group relative overflow-hidden bg-gradient-to-r from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Gift className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{voucher.voucher_name}</h3>
                          <Badge 
                            variant={voucher.status === 'active' ? 'default' : 'secondary'}
                            className={voucher.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                          >
                            {voucher.status === 'active' ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Kode:</span>
                          <span className="font-mono font-bold bg-gray-100 px-2 py-1 rounded text-sm">
                            {voucher.voucher_code}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Nominal:</span>
                          <span className="font-bold text-green-600">
                            Rp {voucher.amount.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>Digunakan: {voucher.used_count}/{voucher.usage_limit}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Berlaku hingga: {new Date(voucher.valid_until).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => toggleVoucherStatus(voucher.id, voucher.status)}
                      variant={voucher.status === 'active' ? 'destructive' : 'default'}
                      size="sm"
                      className={`${
                        voucher.status === 'active' 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-green-500 hover:bg-green-600'
                      } text-white font-semibold`}
                    >
                      {voucher.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                    </Button>
                  </div>
                  
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100/50 to-transparent rounded-full -mr-16 -mt-16 group-hover:from-purple-200/50 transition-all duration-300"></div>
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
