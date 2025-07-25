
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, X, Eye } from 'lucide-react';

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
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Verifikasi Mitra</h2>
        <Button onClick={loadPendingPartners} variant="outline">
          Refresh
        </Button>
      </div>

      {partners.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Tidak ada mitra yang perlu diverifikasi</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {partners.map((partner) => (
            <Card key={partner.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{partner.business_name}</CardTitle>
                    <p className="text-sm text-gray-600">{partner.owner_name}</p>
                  </div>
                  <Badge variant="outline">{partner.business_type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{partner.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Telepon</p>
                    <p className="font-medium">{partner.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Alamat</p>
                    <p className="font-medium">{partner.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kota</p>
                    <p className="font-medium">{partner.city}, {partner.province}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => verifyPartner(partner.id, true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Verifikasi
                  </Button>
                  <Button
                    onClick={() => verifyPartner(partner.id, false)}
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

export default PartnerVerification;
