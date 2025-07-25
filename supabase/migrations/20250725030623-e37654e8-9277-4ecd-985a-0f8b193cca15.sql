
-- Create members table for user management
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  full_name TEXT NOT NULL,
  email TEXT,
  phone_number TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  status TEXT DEFAULT 'active',
  verification_status TEXT DEFAULT 'pending',
  balance DECIMAL(15,2) DEFAULT 0.00,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create partners table for mitra management
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  business_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT,
  business_license TEXT,
  tax_number TEXT,
  bank_name TEXT,
  bank_account TEXT,
  account_holder TEXT,
  status TEXT DEFAULT 'pending',
  verification_status TEXT DEFAULT 'pending',
  verification_notes TEXT,
  balance DECIMAL(15,2) DEFAULT 0.00,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_date TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create topup_requests table
CREATE TABLE IF NOT EXISTS public.topup_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_method TEXT NOT NULL,
  bank_account TEXT,
  payment_proof TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  processed_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT NOT NULL,
  from_user_id UUID,
  from_user_type TEXT,
  to_user_id UUID,
  to_user_type TEXT,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  reference_type TEXT,
  reference_id UUID,
  status TEXT DEFAULT 'completed',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,
  sender_id UUID NOT NULL,
  recipient_id UUID,
  sender_type TEXT NOT NULL,
  recipient_type TEXT,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  file_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL,
  member_id UUID,
  partner_id UUID,
  service_id UUID,
  service_name TEXT NOT NULL,
  service_price DECIMAL(15,2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  total_amount DECIMAL(15,2) NOT NULL,
  commission_amount DECIMAL(15,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  schedule_date TIMESTAMP WITH TIME ZONE,
  schedule_time TEXT,
  address TEXT,
  customer_notes TEXT,
  partner_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID,
  service_name TEXT NOT NULL,
  service_category TEXT NOT NULL,
  description TEXT,
  price DECIMAL(15,2) NOT NULL,
  duration_minutes INTEGER,
  availability_schedule JSONB,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create balance_vouchers table
CREATE TABLE IF NOT EXISTS public.balance_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_name TEXT NOT NULL,
  voucher_code TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  usage_limit INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'active',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create voucher_usage table
CREATE TABLE IF NOT EXISTS public.voucher_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID,
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL,
  amount_received DECIMAL(15,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_topup_requests_updated_at BEFORE UPDATE ON public.topup_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_balance_vouchers_updated_at BEFORE UPDATE ON public.balance_vouchers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access (bypass all restrictions for admin operations)
CREATE POLICY "Admin can view all members" ON public.members FOR SELECT USING (true);
CREATE POLICY "Admin can manage all members" ON public.members FOR ALL USING (true);

CREATE POLICY "Admin can view all partners" ON public.partners FOR SELECT USING (true);
CREATE POLICY "Admin can manage all partners" ON public.partners FOR ALL USING (true);

CREATE POLICY "Admin can view all topup requests" ON public.topup_requests FOR SELECT USING (true);
CREATE POLICY "Admin can manage all topup requests" ON public.topup_requests FOR ALL USING (true);

CREATE POLICY "Admin can view all transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Admin can manage all transactions" ON public.transactions FOR ALL USING (true);

CREATE POLICY "Admin can view all chat messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Admin can manage all chat messages" ON public.chat_messages FOR ALL USING (true);

CREATE POLICY "Admin can view all orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Admin can manage all orders" ON public.orders FOR ALL USING (true);

CREATE POLICY "Admin can view all services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admin can manage all services" ON public.services FOR ALL USING (true);

CREATE POLICY "Admin can view all vouchers" ON public.balance_vouchers FOR SELECT USING (true);
CREATE POLICY "Admin can manage all vouchers" ON public.balance_vouchers FOR ALL USING (true);

CREATE POLICY "Admin can view all voucher usage" ON public.voucher_usage FOR SELECT USING (true);
CREATE POLICY "Admin can manage all voucher usage" ON public.voucher_usage FOR ALL USING (true);

-- Insert sample data for testing
INSERT INTO public.members (full_name, email, phone_number, address, city, province, status, verification_status, balance) VALUES
('John Doe', 'john@example.com', '081234567890', 'Jl. Merdeka No. 123', 'Jakarta', 'DKI Jakarta', 'active', 'verified', 150000.00),
('Jane Smith', 'jane@example.com', '081234567891', 'Jl. Sudirman No. 456', 'Bandung', 'Jawa Barat', 'active', 'pending', 75000.00),
('Bob Wilson', 'bob@example.com', '081234567892', 'Jl. Thamrin No. 789', 'Surabaya', 'Jawa Timur', 'inactive', 'verified', 0.00);

INSERT INTO public.partners (business_name, owner_name, business_type, phone_number, email, address, city, province, status, verification_status, balance) VALUES
('Toko Elektronik Jaya', 'Ahmad Wijaya', 'Retail', '081234567893', 'ahmad@tokojaya.com', 'Jl. Raya No. 100', 'Jakarta', 'DKI Jakarta', 'pending', 'pending', 0.00),
('Service AC Prima', 'Budi Santoso', 'Service', '081234567894', 'budi@serviceac.com', 'Jl. Veteran No. 200', 'Bandung', 'Jawa Barat', 'active', 'verified', 250000.00),
('Bengkel Motor Sejahtera', 'Siti Rahayu', 'Service', '081234567895', 'siti@bengkelmotor.com', 'Jl. Pahlawan No. 300', 'Surabaya', 'Jawa Timur', 'active', 'verified', 180000.00);

INSERT INTO public.topup_requests (user_id, user_type, amount, payment_method, status) VALUES
(gen_random_uuid(), 'member', 100000.00, 'Bank Transfer', 'pending'),
(gen_random_uuid(), 'partner', 500000.00, 'Bank Transfer', 'pending'),
(gen_random_uuid(), 'member', 50000.00, 'E-Wallet', 'approved');

INSERT INTO public.orders (order_number, service_name, service_price, quantity, total_amount, commission_amount, status, payment_status) VALUES
('ORD-001', 'Service AC', 150000.00, 1, 150000.00, 15000.00, 'pending', 'pending'),
('ORD-002', 'Repair Motor', 200000.00, 1, 200000.00, 20000.00, 'completed', 'paid'),
('ORD-003', 'Jual Elektronik', 350000.00, 1, 350000.00, 35000.00, 'processing', 'paid');

INSERT INTO public.chat_messages (room_id, sender_id, sender_type, content, message_type) VALUES
('room-1', gen_random_uuid(), 'member', 'Halo, saya butuh bantuan', 'text'),
('room-1', gen_random_uuid(), 'admin', 'Halo, ada yang bisa saya bantu?', 'text'),
('room-2', gen_random_uuid(), 'partner', 'Kapan saldo saya akan diproses?', 'text');
