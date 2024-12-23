"use client";

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-primary">
          ยินดีต้อนรับสู่
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold">
          ระบบจัดการโรงเรียนสตูลวิทยา
        </h2>
        <p className="text-xl text-gray-500 mt-4">
          ระบบบริหารจัดการงบประมาณและการเงิน
        </p>
      </div>
    </div>
  );
}
