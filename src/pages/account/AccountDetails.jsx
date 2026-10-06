const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Save } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export default function AccountDetails() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ full_name: '', phone: '' });

  useEffect(() => {
    if (user) {
      setForm({ full_name: user.full_name || '', phone: user.phone || '' });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await db.auth.updateMe({ full_name: form.full_name });
      toast({ title: '✦ Profile Updated', description: 'Your details have been saved.' });
    } catch (e) {
      toast({ title: 'Failed to update profile', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Account Details</h2>
      <div className="nebula-card p-6 space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Full Name</label>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl glass border border-border">
            <User className="w-4 h-4 text-muted-foreground" />
            <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="flex-1 bg-transparent text-sm outline-none" placeholder="Your name" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Email</label>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl glass border border-border">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <input value={user?.email || ''} disabled className="flex-1 bg-transparent text-sm outline-none text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Phone</label>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl glass border border-border">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="flex-1 bg-transparent text-sm outline-none" placeholder="Your phone number" />
          </div>
        </div>
        <button onClick={handleSave} className="btn-cosmic px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>
    </div>
  );
}