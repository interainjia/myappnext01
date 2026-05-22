"use client";

import React, { useEffect, useState } from 'react';
import { Save, Key, User, Loader2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation'; // ✅ 1. 引入 useRouter

// ✅ 2. 引入环境变量指向真实后端 API 地址
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function MyProfilePage() {
  // === State Management ===
  const [loading, setLoading] = useState(true);
  
  // Profile Form State
  const [profileData, setProfileData] = useState({
    eid: '',
    userName: '',
    phone: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    oldPwd: '',
    pwd: '',
    pwd2: ''
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const router = useRouter(); // ✅ 3. 初始化 router

  // ✅ 统一的 401 处理函数
  const handleUnauthorized = () => {
    console.warn("Unauthorized. Token is missing or expired. Redirecting to login...");
    localStorage.removeItem('token');
    router.push('/login');
  };

  // === Data Fetching ===
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/Account/profile`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (res.status === 401) return handleUnauthorized();
        if (!res.ok) throw new Error("Failed to fetch profile");
        
        const result = await res.json();
        const data = result.data || result;
        
        setProfileData({
          eid: data.eid || '',
          userName: data.userName || '',
          phone: data.phone || ''
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // === Event Handlers ===
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.userName.trim()) {
      alert("Please enter your name!");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE}/api/Account/info`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          UserName: profileData.userName,
          Phone: profileData.phone
        })
      });
      
      if (res.status === 401) return handleUnauthorized();
      if (!res.ok) throw new Error("Failed to update profile");
      
      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      alert("An error occurred while updating the profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!passwordData.oldPwd) return alert("Please enter your old password!");
    if (!passwordData.pwd) return alert("Please enter a new password!");
    if (!passwordData.pwd2) return alert("Please re-enter the new password!");
    if (passwordData.pwd !== passwordData.pwd2) return alert("New passwords do not match!");

    setSavingPassword(true);
    try {
      const res = await fetch(`${API_BASE}/api/Account/password`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          OldPwd: passwordData.oldPwd,
          Pwd: passwordData.pwd
        })
      });
      
      if (res.status === 401) return handleUnauthorized();
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to change password");
      }
      
      alert("Password updated successfully! Please log out and log in again.");
      setPasswordData({ oldPwd: '', pwd: '', pwd2: '' }); // Clear form
      
      // ✅ 密码修改成功后自动清除 Token 并跳转到登录页，强制重新登录
      localStorage.removeItem('token');
      router.push('/login');
      
    } catch (error: any) {
      console.error(error);
      alert(error.message || "An error occurred while changing the password.");
    } finally {
      setSavingPassword(false);
    }
  };

  // === UI Rendering ===
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800">Account Settings</h2>
        <p className="text-slate-500 mt-1">Manage your personal information and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* === Left Column: My Profile === */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <User className="text-blue-500" size={20} />
            <h3 className="text-lg font-semibold text-slate-800">My Profile</h3>
          </div>
          
          <div className="p-6 flex-1">
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Account ID</label>
                <input 
                  type="text" 
                  value={profileData.eid} 
                  disabled
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed focus:outline-none"
                />
                <p className="text-xs text-slate-400 mt-1">Your unique login identifier cannot be changed.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">User Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={profileData.userName} 
                  onChange={(e) => setProfileData({...profileData, userName: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mobile</label>
                <input 
                  type="tel" 
                  value={profileData.phone} 
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Enter your contact number"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button 
                  type="submit" 
                  disabled={savingProfile}
                  className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-70"
                >
                  {savingProfile ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* === Right Column: Change Password === */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Key className="text-emerald-500" size={20} />
            <h3 className="text-lg font-semibold text-slate-800">Change Password</h3>
          </div>
          
          <div className="p-6 flex-1">
            <form onSubmit={handleUpdatePassword} className="space-y-5">
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Old Password <span className="text-red-500">*</span></label>
                <input 
                  type="password" 
                  value={passwordData.oldPwd} 
                  onChange={(e) => setPasswordData({...passwordData, oldPwd: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">New Password <span className="text-red-500">*</span></label>
                <input 
                  type="password" 
                  value={passwordData.pwd} 
                  onChange={(e) => setPasswordData({...passwordData, pwd: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                <input 
                  type="password" 
                  value={passwordData.pwd2} 
                  onChange={(e) => setPasswordData({...passwordData, pwd2: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  placeholder="Re-enter new password"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button 
                  type="submit" 
                  disabled={savingPassword}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-70"
                >
                  {savingPassword ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}