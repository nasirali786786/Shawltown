'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Phone, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/customer-login';
    const payload = isRegister ? { name, email, password, phone } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/account');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif font-bold text-stone-900">
          {isRegister ? 'Join Shawl Ghar Club' : 'Welcome Back'}
        </h1>
        <p className="text-xs uppercase tracking-wider text-stone-500">
          {isRegister ? 'Create an account to track orders & save addresses' : 'Sign in to access your orders & saved addresses'}
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
        
        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(null); }}
            className={`py-2 rounded-lg transition ${!isRegister ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(null); }}
            className={`py-2 rounded-lg transition ${isRegister ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'}`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Ayesha Khan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-none focus:border-stone-800"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Email Address *</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-none focus:border-stone-800"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Password *</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-none focus:border-stone-800"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Phone Number (Optional)</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="0300-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-none focus:border-stone-800"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold uppercase tracking-wider transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer pt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link href="/" className="text-xs text-stone-500 hover:text-stone-900 font-medium">
            ← Return to Storefront
          </Link>
        </div>

      </div>
    </div>
  );
}
