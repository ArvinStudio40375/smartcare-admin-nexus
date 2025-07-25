
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, X, Shield, MapPin, Mail, Phone, Building2, User, Calendar } from 'lucide-react';

interface Partner {
  id: string;
  business_name: string;
  owner_name: string;
  business_type: string;
  phone_number: string;
  email: string;
  address: string;
  city: string;
  province: string;
  status: string;
  verification_status: string;
  created_at: string;
}

const PartnerVerification: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadPendingPartners();
  }, []);

  const loadPendingPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error loading partners:', error);
      toast.error('Gagal memuat data mitra');
    } finally {
      setLoading(false);
    }
  };

  const verifyPartner = async (partnerId: string, approved: boolean) => {
    setProcessingId(partnerId);
    try {
      const { error } = await supabase
        .from('partners')
        .update({
          verification_status: approved ? 'verified' : 'rejected',
          status: approved ? 'active' : 'inactive',
          approved_date: approved ? new Date().toISOString() : null
        })
        .eq('id', partnerId);

      if (error) throw error;
      
      toast.success(approved ? 'Mitra berhasil diverifikasi' : 'Mitra ditolak');
      loadPendingPartners();
    } catch (error) {
      console.error('Error verifying partner:', error);
      toast.error('Gagal memverifikasi mitra');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Memuat data mitra...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Verifikasi Mitra
          </h2>
          <p className="text-gray-600">Kelola dan verifikasi pendaftaran mitra baru</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">
              {partners.length} Menunggu Verifikasi
            </span>
          </div>
          <Button 
            onClick={loadPendingPartners} 
            variant="outline"
            className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Refresh
            </div>
          </Button>
        </div>
      </div>

      {partners.length === 0 ? (
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Tidak ada mitra yang perlu diverifikasi</h3>
                <p className="text-gray-500">Semua mitra telah diverifikasi atau belum ada pendaftaran baru</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {partners.map((partner) => (
            <Card key={partner.id} className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-t-lg">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">{partner.business_name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="w-4 h-4 text-blue-100" />
                        <span className="text-blue-100 text-sm">{partner.owner_name}</span>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="bg-white/20 text-white border-white/30"
                  >
                    {partner.business_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold text-blue-600">{partner.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Telepon</p>
                        <p className="font-semibold text-green-600">{partner.phone_number}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <MapPin className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Alamat</p>
                        <p className="font-semibold text-purple-600">{partner.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <MapPin className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Kota</p>
                        <p className="font-semibold text-orange-600">{partner.city}, {partner.province}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Mendaftar pada: {new Date(partner.created_at).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="flex gap-4">
                  <Button
                    onClick={() => verifyPartner(partner.id, true)}
                    disabled={processingId === partner.id}
                    className="flex-1 h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {processingId === partner.id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Memproses...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        Verifikasi
                      </div>
                    )}
                  </Button>
                  <Button
                    onClick={() => verifyPartner(partner.id, false)}
                    disabled={processingId === partner.id}
                    variant="destructive"
                    className="flex-1 h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {processingId === partner.id ? (
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

export default PartnerVerification;
