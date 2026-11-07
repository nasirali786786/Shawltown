'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Boxes,
  Layers,
  Tag,
  UserCheck,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  Shield
} from 'lucide-react';

interface AdminSidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  const navItems = [
    { name: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Orders & Tracking', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Product Catalog', href: '/admin/products', icon: Package },
    { name: 'Inventory & Stock', href: '/admin/inventory', icon: Boxes },
    { name: 'Categories', href: '/admin/categories', icon: Layers },
    { name: 'Coupons & Discounts', href: '/admin/coupons', icon: Tag },
    { name: 'Customers CRM', href: '/admin/customers', icon: UserCheck },
    { name: 'Users & Roles', href: '/admin/users', icon: Users },
    { name: 'Website & Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col shrink-0 border-r border-stone-800 min-h-screen">
      {/* Brand Header */}
      <div className="p-6 border-b border-stone-800 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-serif font-bold text-white tracking-wider uppercase">
              Shawl Ghar
            </div>
            <div className="text-[10px] tracking-widest text-amber-400 uppercase font-semibold">
              Admin Portal
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="p-4 flex-1 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-stone-500">
          Management Suite
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium tracking-wide transition-all ${
                isActive
                  ? 'bg-amber-600 text-white font-semibold shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-4 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-stone-500">
          Public Storefront
        </div>

        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-stone-400 hover:text-white hover:bg-stone-800 transition"
        >
          <span className="flex items-center gap-3">
            <ExternalLink className="w-4 h-4" />
            <span>View Live Site</span>
          </span>
          <span className="text-[10px] bg-stone-800 px-1.5 py-0.5 rounded text-stone-400">new tab</span>
        </Link>
      </div>

      {/* User Information & Logout */}
      <div className="p-4 border-t border-stone-800 space-y-3">
        <div className="bg-stone-800/80 rounded-xl p-3 flex items-center gap-3 border border-stone-700/60">
          <div className="w-9 h-9 rounded-full bg-amber-700 text-white font-bold flex items-center justify-center text-xs shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="truncate flex-1">
            <div className="text-xs font-semibold text-white truncate">{user.name}</div>
            <div className="text-[10px] text-stone-400 truncate">{user.email}</div>
          </div>
          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {user.role}
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Admin</span>
        </button>
      </div>
    </aside>
  );
}
