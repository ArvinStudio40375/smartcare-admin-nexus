
import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [accessCode, setAccessCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const ADMIN_CODE = "011090";

  useEffect(() => {
    // Check if already logged in
    const adminLogin = localStorage.getItem("admin_login");
    if (adminLogin === ADMIN_CODE) {
      onLoginSuccess();
    }
  }, [onLoginSuccess]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (accessCode === ADMIN_CODE) {
        localStorage.setItem("admin_login", ADMIN_CODE);
        toast.success("Login berhasil! Selamat datang Admin.");
        onLoginSuccess();
      } else {
        toast.error("Kode akses salah! Silakan coba lagi.");
        setAccessCode('');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center backdrop-blur-sm">
            <Shield className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SmartCare Admin</h1>
          <p className="text-slate-300">Masukkan kode akses untuk melanjutkan</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-center text-white flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" />
              Verifikasi Akses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Kode Akses Admin
                </label>
                <div className="relative">
                  <Input
                    type={showCode ? "text" : "password"}
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Masukkan kode akses"
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !accessCode}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full loading-spinner"></div>
                    Memverifikasi...
                  </div>
                ) : (
                  'Masuk Dashboard'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            © 2024 SmartCare Platform. Secure Admin Access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
