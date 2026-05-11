"use client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { User, Lock } from "lucide-react";
import Link from "next/link";

interface LoginFormData {
  username?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    // 模拟调用 /api/Account/login
    console.log("Login Data:", data);
    router.push("/dashboard");
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
      <h2 className="text-2xl font-bold text-center mb-6">系统登录</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">用户名</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input {...register("username", { required: true })} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">密码</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input type="password" {...register("password", { required: true })} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors">
          进入系统
        </button>
      </form>
      <div className="mt-4 text-center text-sm text-slate-500">
        没有账号？ <Link href="/signup" className="text-blue-600 hover:underline">立即注册</Link>
      </div>
    </div>
  );
}