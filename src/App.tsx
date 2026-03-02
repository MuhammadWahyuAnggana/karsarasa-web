/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  Instagram, 
  Twitter, 
  Facebook, 
  ArrowRight, 
  UtensilsCrossed, 
  Users, 
  Heart, 
  MapPin,
  Phone,
  Mail,
  Plus,
  Trash2,
  Edit2,
  LogOut,
  Settings as SettingsIcon,
  Save,
  LayoutDashboard,
  Upload,
  Globe
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_LINKS = [
  { name: 'Beranda', href: '#home' },
  { name: 'Tentang Kami', href: '#about' },
  { name: 'Produk', href: '#products' },
  { name: 'Tim', href: '#team' },
  { name: 'Kontak', href: '#contact' },
];

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  price: string;
  category: string;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
}

interface SiteSettings {
  site_name: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  about_title: string;
  about_text_1: string;
  about_text_2: string;
  about_image: string;
  contact_address: string;
  contact_phone: string;
  contact_email: string;
  whatsapp_number: string;
}

function ImageUpload({ value, onChange, label }: { value?: string, onChange: (url: string) => void, label: string }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        onChange(data.imageUrl);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest opacity-50 block">{label}</label>
      <div className="flex items-center gap-4">
        {value && (
          <img src={value} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-gray-100" />
        )}
        <label className="flex-1 cursor-pointer">
          <div className={cn(
            "border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-brand-accent transition-colors",
            uploading && "opacity-50 cursor-wait"
          )}>
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-500">{uploading ? 'Mengunggah...' : 'Klik untuk Unggah Foto'}</span>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
        </label>
      </div>
      {value && (
        <div className="text-[10px] text-gray-400 truncate max-w-full">
          URL: {value}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<'public' | 'login' | 'admin'>('public');
  const [adminTab, setAdminTab] = useState<'products' | 'team' | 'settings'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'KARSA RASA',
    hero_title: 'Cita Rasa Persahabatan',
    hero_subtitle: 'Menghadirkan kehangatan dalam setiap gigitan. Dibuat dengan cinta oleh tangan-tangan yang menghargai tradisi.',
    hero_image: 'https://picsum.photos/seed/food-hero/1920/1080',
    about_title: 'Berawal dari Dapur Kecil dan Mimpi Besar.',
    about_text_1: 'Karsa Rasa lahir dari perkumpulan teman masa kecil yang memiliki kegemaran yang sama: makan. Kami percaya bahwa makanan bukan sekadar pengisi perut, melainkan jembatan emosi.',
    about_text_2: 'Setiap resep yang kami sajikan telah melalui ratusan kali percobaan di dapur kami sendiri. Kami hanya menggunakan bahan lokal terbaik untuk mendukung petani di sekitar kami.',
    about_image: 'https://picsum.photos/seed/cooking/800/1000',
    contact_address: 'Jl. Rasa No. 123, Jakarta Selatan, Indonesia',
    contact_phone: '+62 812 3456 7890',
    contact_email: 'halo@karsarasa.com',
    whatsapp_number: '6281234567890',
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));

  // Admin Login State
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Admin Edit State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingMember, setEditingMember] = useState<Partial<TeamMember> | null>(null);
  const [editingSettings, setEditingSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetchData();
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, teamRes, settingsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/team'),
        fetch('/api/settings')
      ]);
      const prods = await prodRes.json();
      const teams = await teamRes.json();
      const sets = await settingsRes.json();
      setProducts(prods);
      setTeam(teams);
      setSettings(sets);
      setEditingSettings(sets);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        localStorage.setItem('admin_token', data.token);
        setView('admin');
        setLoginError('');
      } else {
        setLoginError(data.message);
      }
    } catch (err) {
      setLoginError("Login failed. Check server.");
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('admin_token');
    setView('public');
  };

  const handleWhatsAppClick = (productName?: string) => {
    const message = productName 
      ? `Halo ${settings.site_name}, saya ingin memesan *${productName}*. Apakah tersedia?`
      : `Halo ${settings.site_name}, saya tertarik untuk memesan produk Anda. Bisa dibantu?`;
    const url = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    const method = editingProduct.id ? 'PUT' : 'POST';
    const url = editingProduct.id ? `/api/products/${editingProduct.id}` : '/api/products';
    
    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      });
      setEditingProduct(null);
      fetchData();
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Hapus produk ini?")) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const saveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    
    const method = editingMember.id ? 'PUT' : 'POST';
    const url = editingMember.id ? `/api/team/${editingMember.id}` : '/api/team';
    
    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMember)
      });
      setEditingMember(null);
      fetchData();
    } catch (err) {
      console.error("Error saving member:", err);
    }
  };

  const deleteMember = async (id: number) => {
    if (!confirm("Hapus anggota tim ini?")) return;
    try {
      await fetch(`/api/team/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error("Error deleting member:", err);
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSettings) return;
    
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSettings)
      });
      fetchData();
      alert("Pengaturan berhasil disimpan!");
    } catch (err) {
      console.error("Error saving settings:", err);
    }
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-brand-paper flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl">
          <div className="text-center mb-10">
            <UtensilsCrossed className="w-12 h-12 text-brand-accent mx-auto mb-4" />
            <h2 className="text-3xl font-serif">Admin Login</h2>
            <p className="text-brand-primary/60 text-sm mt-2">Gunakan akun admin untuk mengelola konten</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest opacity-50 block mb-2">Username</label>
              <input 
                type="text" 
                value={loginForm.username}
                onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                className="w-full border-b border-brand-primary/10 py-2 focus:border-brand-accent outline-none" 
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest opacity-50 block mb-2">Password</label>
              <input 
                type="password" 
                value={loginForm.password}
                onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full border-b border-brand-primary/10 py-2 focus:border-brand-accent outline-none" 
                required
              />
            </div>
            {loginError && <p className="text-red-500 text-xs text-center">{loginError}</p>}
            <button className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-brand-accent transition-colors">
              Masuk
            </button>
            <button 
              type="button"
              onClick={() => setView('public')}
              className="w-full text-brand-primary/40 text-xs uppercase tracking-widest hover:text-brand-primary"
            >
              Kembali ke Website
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Admin Sidebar */}
        <aside className="w-64 bg-brand-primary text-white p-8 flex flex-col">
          <div className="text-xl font-serif font-bold tracking-tighter mb-12 flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-brand-accent" />
            <span>ADMIN PANEL</span>
          </div>
          <nav className="flex-1 space-y-2">
            <button 
              onClick={() => setAdminTab('products')}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all",
                adminTab === 'products' ? "bg-brand-accent text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <LayoutDashboard className="w-4 h-4" /> Manajemen Menu
            </button>
            <button 
              onClick={() => setAdminTab('team')}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all",
                adminTab === 'team' ? "bg-brand-accent text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Users className="w-4 h-4" /> Manajemen Tim
            </button>
            <button 
              onClick={() => setAdminTab('settings')}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all",
                adminTab === 'settings' ? "bg-brand-accent text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Globe className="w-4 h-4" /> Pengaturan Web
            </button>
          </nav>
          <button 
            onClick={handleLogout}
            className="mt-auto flex items-center gap-3 text-white/60 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </aside>

        {/* Admin Content */}
        <main className="flex-1 p-12 overflow-y-auto">
          {adminTab === 'products' && (
            <>
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h1 className="text-4xl font-serif mb-2">Manajemen Menu</h1>
                  <p className="text-gray-500">Tambah, edit, atau hapus menu makanan Anda.</p>
                </div>
                <button 
                  onClick={() => setEditingProduct({ name: '', description: '', price: '', category: 'Gurih', image: 'https://picsum.photos/seed/new/800/1000' })}
                  className="bg-brand-accent text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-brand-primary transition-colors"
                >
                  <Plus className="w-4 h-4" /> Tambah Menu
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {products.map(product => (
                  <div key={product.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-8">
                    <img src={product.image} className="w-24 h-24 rounded-xl object-cover" />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold">{product.name}</h3>
                        <span className="text-[10px] uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-full">{product.category}</span>
                      </div>
                      <p className="text-gray-500 text-sm mb-2">{product.description}</p>
                      <span className="text-brand-accent font-serif">{product.price}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditingProduct(product)}
                        className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:text-brand-primary hover:bg-gray-100 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteProduct(product.id)}
                        className="p-3 rounded-xl bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {adminTab === 'team' && (
            <>
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h1 className="text-4xl font-serif mb-2">Manajemen Tim</h1>
                  <p className="text-gray-500">Kelola profil anggota tim kreatif Anda.</p>
                </div>
                <button 
                  onClick={() => setEditingMember({ name: '', role: '', image: 'https://picsum.photos/seed/member/400/400' })}
                  className="bg-brand-accent text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-brand-primary transition-colors"
                >
                  <Plus className="w-4 h-4" /> Tambah Anggota
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {team.map(member => (
                  <div key={member.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
                    <img src={member.image} className="w-20 h-20 rounded-full object-cover" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{member.name}</h3>
                      <p className="text-brand-accent text-sm uppercase tracking-widest font-bold">{member.role}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditingMember(member)}
                        className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:text-brand-primary hover:bg-gray-100 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteMember(member.id)}
                        className="p-3 rounded-xl bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {adminTab === 'settings' && editingSettings && (
            <div className="max-w-4xl">
              <div className="mb-12">
                <h1 className="text-4xl font-serif mb-2">Pengaturan Web</h1>
                <p className="text-gray-500">Ubah konten utama website Anda secara langsung.</p>
              </div>

              <form onSubmit={saveSettings} className="space-y-12">
                {/* General Settings */}
                <section className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-serif mb-8 flex items-center gap-3">
                    <Globe className="w-6 h-6 text-brand-accent" /> Identitas & Kontak
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest opacity-50">Nama Website / Logo</label>
                      <input 
                        type="text" 
                        value={editingSettings.site_name}
                        onChange={e => setEditingSettings({...editingSettings, site_name: e.target.value})}
                        className="w-full border-b border-brand-primary/10 py-2 focus:border-brand-accent outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest opacity-50">Nomor WhatsApp (62...)</label>
                      <input 
                        type="text" 
                        value={editingSettings.whatsapp_number}
                        onChange={e => setEditingSettings({...editingSettings, whatsapp_number: e.target.value})}
                        className="w-full border-b border-brand-primary/10 py-2 focus:border-brand-accent outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest opacity-50">Email Kontak</label>
                      <input 
                        type="email" 
                        value={editingSettings.contact_email}
                        onChange={e => setEditingSettings({...editingSettings, contact_email: e.target.value})}
                        className="w-full border-b border-brand-primary/10 py-2 focus:border-brand-accent outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest opacity-50">Telepon Kontak</label>
                      <input 
                        type="text" 
                        value={editingSettings.contact_phone}
                        onChange={e => setEditingSettings({...editingSettings, contact_phone: e.target.value})}
                        className="w-full border-b border-brand-primary/10 py-2 focus:border-brand-accent outline-none" 
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest opacity-50">Alamat</label>
                      <input 
                        type="text" 
                        value={editingSettings.contact_address}
                        onChange={e => setEditingSettings({...editingSettings, contact_address: e.target.value})}
                        className="w-full border-b border-brand-primary/10 py-2 focus:border-brand-accent outline-none" 
                      />
                    </div>
                  </div>
                </section>

                {/* Hero Section Settings */}
                <section className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-serif mb-8 flex items-center gap-3">
                    <LayoutDashboard className="w-6 h-6 text-brand-accent" /> Hero Section (Beranda)
                  </h2>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest opacity-50">Judul Utama</label>
                      <input 
                        type="text" 
                        value={editingSettings.hero_title}
                        onChange={e => setEditingSettings({...editingSettings, hero_title: e.target.value})}
                        className="w-full border-b border-brand-primary/10 py-2 focus:border-brand-accent outline-none text-2xl font-serif" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest opacity-50">Sub-judul / Deskripsi</label>
                      <textarea 
                        rows={3}
                        value={editingSettings.hero_subtitle}
                        onChange={e => setEditingSettings({...editingSettings, hero_subtitle: e.target.value})}
                        className="w-full border-b border-brand-primary/10 py-2 focus:border-brand-accent outline-none resize-none" 
                      />
                    </div>
                    <ImageUpload 
                      label="Gambar Hero" 
                      value={editingSettings.hero_image} 
                      onChange={url => setEditingSettings({...editingSettings, hero_image: url})} 
                    />
                  </div>
                </section>

                {/* About Section Settings */}
                <section className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-serif mb-8 flex items-center gap-3">
                    <Heart className="w-6 h-6 text-brand-accent" /> About Section (Tentang Kami)
                  </h2>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest opacity-50">Judul Tentang Kami</label>
                      <input 
                        type="text" 
                        value={editingSettings.about_title}
                        onChange={e => setEditingSettings({...editingSettings, about_title: e.target.value})}
                        className="w-full border-b border-brand-primary/10 py-2 focus:border-brand-accent outline-none text-2xl font-serif" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest opacity-50">Paragraf 1</label>
                      <textarea 
                        rows={3}
                        value={editingSettings.about_text_1}
                        onChange={e => setEditingSettings({...editingSettings, about_text_1: e.target.value})}
                        className="w-full border-b border-brand-primary/10 py-2 focus:border-brand-accent outline-none resize-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest opacity-50">Paragraf 2</label>
                      <textarea 
                        rows={3}
                        value={editingSettings.about_text_2}
                        onChange={e => setEditingSettings({...editingSettings, about_text_2: e.target.value})}
                        className="w-full border-b border-brand-primary/10 py-2 focus:border-brand-accent outline-none resize-none" 
                      />
                    </div>
                    <ImageUpload 
                      label="Gambar Tentang Kami" 
                      value={editingSettings.about_image} 
                      onChange={url => setEditingSettings({...editingSettings, about_image: url})} 
                    />
                  </div>
                </section>

                <div className="sticky bottom-8 flex justify-end">
                  <button type="submit" className="bg-brand-primary text-white px-12 py-5 rounded-2xl font-bold uppercase tracking-widest shadow-2xl hover:bg-brand-accent transition-all flex items-center gap-3">
                    <Save className="w-5 h-5" /> Simpan Semua Perubahan
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>

        {/* Edit Product Modal */}
        <AnimatePresence>
          {editingProduct && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-brand-primary/20 backdrop-blur-sm"
                onClick={() => setEditingProduct(null)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl"
              >
                <h2 className="text-3xl font-serif mb-8">{editingProduct.id ? 'Edit Menu' : 'Tambah Menu Baru'}</h2>
                <form onSubmit={saveProduct} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest opacity-50">Nama Menu</label>
                      <input 
                        type="text" 
                        value={editingProduct.name}
                        onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                        className="w-full border-b border-brand-primary/10 py-2 focus:border-brand-accent outline-none" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest opacity-50">Harga</label>
                      <input 
                        type="text" 
                        value={editingProduct.price}
                        onChange={e => setEditingProduct({...editingProduct, price: e.target.value})}
                        className="w-full border-b border-brand-primary/10 py-2 focus:border-brand-accent outline-none" 
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-50">Kategori</label>
                    <select 
                      value={editingProduct.category}
                      onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                      className="w-full border-b border-brand-primary/10 py-2 focus:border-brand-accent outline-none bg-transparent"
                    >
                      <option>Gurih</option>
                      <option>Manis</option>
                      <option>Pedas</option>
                      <option>Minuman</option>
                    </select>
                  </div>
                  <ImageUpload 
                    label="Foto Menu" 
                    value={editingProduct.image} 
                    onChange={url => setEditingProduct({...editingProduct, image: url})} 
                  />
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-50">Deskripsi</label>
                    <textarea 
                      rows={3}
                      value={editingProduct.description}
                      onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                      className="w-full border-b border-brand-primary/10 py-2 focus:border-brand-accent outline-none resize-none" 
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 py-4 rounded-xl border border-gray-200 font-bold uppercase tracking-widest text-xs">Batal</button>
                    <button type="submit" className="flex-1 py-4 rounded-xl bg-brand-primary text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" /> Simpan
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Member Modal */}
        <AnimatePresence>
          {editingMember && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-brand-primary/20 backdrop-blur-sm"
                onClick={() => setEditingMember(null)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl"
              >
                <h2 className="text-3xl font-serif mb-8">{editingMember.id ? 'Edit Anggota' : 'Tambah Anggota Baru'}</h2>
                <form onSubmit={saveMember} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-50">Nama Lengkap</label>
                    <input 
                      type="text" 
                      value={editingMember.name}
                      onChange={e => setEditingMember({...editingMember, name: e.target.value})}
                      className="w-full border-b border-brand-primary/10 py-2 focus:border-brand-accent outline-none" 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-50">Jabatan / Role</label>
                    <input 
                      type="text" 
                      value={editingMember.role}
                      onChange={e => setEditingMember({...editingMember, role: e.target.value})}
                      className="w-full border-b border-brand-primary/10 py-2 focus:border-brand-accent outline-none" 
                      required
                    />
                  </div>
                  <ImageUpload 
                    label="Foto Profil" 
                    value={editingMember.image} 
                    onChange={url => setEditingMember({...editingMember, image: url})} 
                  />
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setEditingMember(null)} className="flex-1 py-4 rounded-xl border border-gray-200 font-bold uppercase tracking-widest text-xs">Batal</button>
                    <button type="submit" className="flex-1 py-4 rounded-xl bg-brand-primary text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" /> Simpan
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen selection:bg-brand-accent selection:text-white">
      {/* Navigation */}
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4",
          scrolled ? "bg-brand-paper/80 backdrop-blur-md border-b border-brand-primary/10 py-3" : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="#home" className="text-2xl font-serif font-bold tracking-tighter flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-brand-accent" />
            <span>{settings.site_name}</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="text-sm font-medium uppercase tracking-widest hover:text-brand-accent transition-colors"
              >
                {link.name}
              </a>
            ))}
            <button 
              onClick={() => handleWhatsAppClick()}
              className="bg-brand-primary text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-brand-accent transition-colors"
            >
              Pesan Sekarang
            </button>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-brand-paper pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 items-center">
              {NAV_LINKS.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-serif italic"
                >
                  {link.name}
                </a>
              ))}
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  handleWhatsAppClick();
                }}
                className="w-full bg-brand-primary text-white py-4 rounded-xl text-lg font-medium"
              >
                Pesan Sekarang
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-paper z-10" />
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
            src={settings.hero_image} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1 border border-white/30 backdrop-blur-sm rounded-full text-xs font-semibold tracking-[0.2em] uppercase mb-6 text-white">
              Est. 2024 • Artisanal Snacks
            </span>
            <h1 className="max-w-4xl mx-auto text-4xl md:text-7xl lg:text-8xl font-serif leading-[1.1] tracking-tighter mb-8 whitespace-pre-line text-white">
              {settings.hero_title}
            </h1>
            <p className="max-w-2xl mx-auto text-base md:text-lg text-white/80 font-light leading-relaxed mb-10">
              {settings.hero_subtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => handleWhatsAppClick()}
                className="group bg-brand-accent text-white px-8 py-4 rounded-full flex items-center gap-3 hover:bg-white hover:text-brand-primary transition-all duration-300 shadow-xl"
              >
                Pesan Sekarang
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <a href="#about" className="px-8 py-4 rounded-full border border-white/30 text-white backdrop-blur-sm hover:bg-white/10 transition-colors">
                Cerita Kami
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 md:py-40 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="relative">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative z-10 aspect-[4/5] overflow-hidden rounded-[40px] shadow-2xl"
              >
                <img 
                  src={settings.about_image} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl -z-10" />
              <div className="absolute -top-10 -left-10 w-40 h-40 border border-brand-accent/20 rounded-full -z-10" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative lg:pl-6"
            >
              <h2 className="text-3xl md:text-5xl lg:text-6xl mb-10 leading-tight font-serif">
                {settings.about_title}
              </h2>
              <div className="space-y-8 text-brand-primary/70 text-base md:text-lg font-light leading-relaxed">
                <p>
                  {settings.about_text_1}
                </p>
                <p>
                  {settings.about_text_2}
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-3 md:gap-6 mt-16">
                <div className="p-4 bg-brand-paper rounded-2xl border border-brand-primary/5">
                  <div className="text-2xl md:text-3xl font-serif text-brand-accent mb-1">100%</div>
                  <div className="text-[10px] uppercase tracking-widest font-bold opacity-50 leading-tight">Bahan Alami</div>
                </div>
                <div className="p-4 bg-brand-paper rounded-2xl border border-brand-primary/5">
                  <div className="text-2xl md:text-3xl font-serif text-brand-accent mb-1">24/7</div>
                  <div className="text-[10px] uppercase tracking-widest font-bold opacity-50 leading-tight">Produksi Segar</div>
                </div>
                <div className="p-4 bg-brand-paper rounded-2xl border border-brand-primary/5">
                  <div className="text-2xl md:text-3xl font-serif text-brand-accent mb-1">15+</div>
                  <div className="text-[10px] uppercase tracking-widest font-bold opacity-50 leading-tight">Varian Rasa</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24 md:py-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <span className="text-brand-accent font-bold tracking-[0.2em] uppercase text-xs mb-4 block">Koleksi Kami</span>
              <h2 className="text-4xl md:text-6xl font-serif">Menu <span className="italic">Andalan</span></h2>
            </div>
            <p className="max-w-xs text-brand-primary/60 font-light text-sm md:text-base">
              Pilihan jajanan terbaik yang kami kurasi khusus untuk menemani waktu santai Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, idx) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-3xl mb-6">
                  <img 
                    src={product.image} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {product.category}
                    </span>
                  </div>
                </div>
                <h3 className="text-2xl mb-2">{product.name}</h3>
                <p className="text-brand-primary/60 text-sm font-light mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-serif text-lg text-brand-accent">{product.price}</span>
                  <button 
                    onClick={() => handleWhatsAppClick(product.name)}
                    className="p-2 rounded-full border border-brand-primary/10 hover:bg-brand-primary hover:text-white transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-24 md:py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl mb-6">Para <span className="italic">Kreator</span></h2>
            <p className="max-w-xl mx-auto text-brand-primary/60 font-light">
              Dibalik setiap rasa, ada tangan-tangan yang berdedikasi untuk memberikan yang terbaik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {team.map((member, idx) => (
              <motion.div 
                key={member.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="relative mb-8 inline-block">
                  <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-brand-paper shadow-2xl mx-auto">
                    <img 
                      src={member.image} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-brand-accent text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    {member.role}
                  </div>
                </div>
                <h3 className="text-2xl">{member.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 md:py-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-brand-primary rounded-[40px] p-8 md:p-16 text-brand-paper grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div className="space-y-10">
              <h2 className="text-4xl md:text-6xl font-serif leading-tight">Mari <br /> <span className="italic text-brand-accent">Berbincang.</span></h2>
              <div className="space-y-6">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-brand-paper/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-brand-accent" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium mb-1">Lokasi Kami</h4>
                    <p className="text-brand-paper/60 font-light">{settings.contact_address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-brand-paper/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-brand-accent" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium mb-1">Telepon</h4>
                    <p className="text-brand-paper/60 font-light">{settings.contact_phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-brand-paper/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-brand-accent" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium mb-1">Email</h4>
                    <p className="text-brand-paper/60 font-light">{settings.contact_email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 md:p-10 text-brand-primary">
              <div className="text-center space-y-6">
                <h3 className="text-2xl font-serif">Kirim Pesan via WhatsApp</h3>
                <p className="text-brand-primary/60 font-light">Lebih cepat dan responsif. Klik tombol di bawah untuk langsung terhubung dengan tim kami.</p>
                <button 
                  onClick={() => handleWhatsAppClick()}
                  className="w-full bg-brand-accent text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-brand-primary transition-colors flex items-center justify-center gap-3"
                >
                  Chat WhatsApp Sekarang
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-brand-primary/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-xl font-serif font-bold tracking-tighter">
              {settings.site_name}
            </div>
            
            <div className="flex gap-8">
              <a href="#" className="hover:text-brand-accent transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-brand-accent transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-brand-accent transition-colors"><Facebook className="w-5 h-5" /></a>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="text-[10px] uppercase tracking-widest font-bold opacity-50">
                © 2024 {settings.site_name}. All rights reserved.
              </div>
              <button 
                onClick={() => setView('login')}
                className="text-[10px] uppercase tracking-widest font-bold text-brand-accent hover:underline"
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
