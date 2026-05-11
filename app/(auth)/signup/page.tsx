"use client";
import { useForm } from "react-hook-form";
import { Mail, UserPlus, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface SignUpData {
  email?: string;
  password?: string;
}

export default function SignUpPage() {
  const { register, handleSubmit } = useForm<SignUpData>();

  const onSubmit = (data: SignUpData) => console.log("Sign Up:", data);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
      <h2 className="text-2xl font-bold text-center mb-6">创建新账号</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">电子邮箱</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input type="email" {...register("email", { required: true })} className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">设置密码</label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input type="password" {...register("password", { required: true })} className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
          <UserPlus size={18} /> 注册
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        已有账号？ <Link href="/login" className="text-blue-600">返回登录</Link>
      </p>
    </div>
  );
}