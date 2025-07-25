
import { createClient } from '@supabase/supabase-js';

// Your Supabase configuration
const SUPABASE_URL = 'https://xcixfelzxcqbhhhebczh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjaXhmZWx6eGNxYmhoaGViY3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MDg0MjksImV4cCI6MjA2ODk4NDQyOX0.laI5x-dBkeQtObzJDoykeDl3po5fEtM4Qt9Jpt8qPAg';

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper functions for admin operations
export const adminOperations = {
  // Get all members
  async getMembers() {
    const { data, error } = await supabaseAdmin
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get all partners
  async getPartners() {
    const { data, error } = await supabaseAdmin
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get pending topup requests
  async getPendingTopups() {
    const { data, error } = await supabaseAdmin
      .from('topup_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get all orders
  async getOrders() {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get all transactions
  async getTransactions() {
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get chat messages
  async getChatMessages() {
    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get vouchers
  async getVouchers() {
    const { data, error } = await supabaseAdmin
      .from('balance_vouchers')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Update topup request status
  async updateTopupStatus(id: string, status: string, adminNotes?: string) {
    const { data, error } = await supabaseAdmin
      .from('topup_requests')
      .update({
        status,
        admin_notes: adminNotes,
        processed_at: new Date().toISOString()
      })
      .eq('id', id);
    return { data, error };
  },

  // Update partner verification status
  async updatePartnerStatus(id: string, status: string, verificationStatus: string, notes?: string) {
    const { data, error } = await supabaseAdmin
      .from('partners')
      .update({
        status,
        verification_status: verificationStatus,
        verification_notes: notes,
        approved_date: status === 'active' ? new Date().toISOString() : null
      })
      .eq('id', id);
    return { data, error };
  },

  // Create a new voucher
  async createVoucher(voucherData: {
    voucher_name: string;
    voucher_code: string;
    amount: number;
    usage_limit: number;
    valid_until: string;
  }) {
    const { data, error } = await supabaseAdmin
      .from('balance_vouchers')
      .insert([voucherData]);
    return { data, error };
  },

  // Send manual balance
  async sendManualBalance(userId: string, userType: string, amount: number, description: string) {
    // Insert transaction record
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .insert([{
        transaction_type: 'manual_credit',
        to_user_id: userId,
        to_user_type: userType,
        amount,
        description,
        status: 'completed'
      }]);
    
    if (!error) {
      // Update user balance
      const table = userType === 'member' ? 'members' : 'partners';
      await supabaseAdmin.rpc('increment_balance', {
        user_id: userId,
        table_name: table,
        amount: amount
      });
    }
    
    return { data, error };
  }
};
