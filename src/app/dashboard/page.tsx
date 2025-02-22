"use client";
import { useEffect, useState } from "react";
import { Card, CardBody, Spinner } from "@nextui-org/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Statistics {
  counts: {
    transactions: number;
    projects: number;
    subsidies: number;
    fiscalYears: number;
    users: number;
    total: number;
  };
  projectStatistics: {
    totalBudget: number;
    totalWithdrawal: number;
    totalRemaining: number;
  };
  subsidyStatistics: {
    totalBudget: number;
    totalWithdrawal: number;
    totalRemaining: number;
  };
  fiscalYearStatistics: {
    summary: {
      totalYears: number;
      totalBudget: number;
      totalExpense: number;
      totalRemaining: number;
    };
    byYear: {
      year: string;
      totalBudget: number;
      totalExpense: number;
      remainingBudget: number;
      subsidyCount: number;
      projectCount: number;
      withdrawalAmount: number;
    }[];
  };
}

export default function DashboardPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 วินาที

    const fetchWithRetry = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("กรุณาเข้าสู่ระบบ");
        }

        const response = await fetch(
          "http://localhost:3001/statistics/detailed",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          // ถ้าเป็น error เรื่อง max_user_connections และยังไม่เกิน maxRetries
          if (
            result.error?.includes("max_user_connections") &&
            retryCount < maxRetries
          ) {
            retryCount++;
            console.log(`Retrying... Attempt ${retryCount} of ${maxRetries}`);
            // รอ 1 วินาทีแล้วลองใหม่
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            return fetchWithRetry();
          }
          throw new Error(result.error || "ไม่สามารถดึงข้อมูลสถิติได้");
        }

        if (result.success && isMounted) {
          setStatistics(result.data);
        } else {
          throw new Error("ข้อมูลไม่ถูกต้อง");
        }
      } catch (err) {
        console.error("Error fetching statistics:", err);
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการดึงข้อมูล"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWithRetry();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-danger min-h-[60vh] flex items-center justify-center">
        <p>เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}</p>
      </div>
    );
  }

  const chartData = [
    {
      name: "โครงการ",
      งบประมาณ: statistics?.projectStatistics.totalBudget || 0,
      เบิกจ่าย: statistics?.projectStatistics.totalWithdrawal || 0,
      คงเหลือ: statistics?.projectStatistics.totalRemaining || 0,
    },
    {
      name: "ประเภทเงิน",
      งบประมาณ: statistics?.subsidyStatistics.totalBudget || 0,
      เบิกจ่าย: statistics?.subsidyStatistics.totalWithdrawal || 0,
      คงเหลือ: statistics?.subsidyStatistics.totalRemaining || 0,
    },
    {
      name: "ปีงบประมาณทั้งหมด",
      งบประมาณ: statistics?.fiscalYearStatistics.summary.totalBudget || 0,
      เบิกจ่าย: statistics?.fiscalYearStatistics.summary.totalExpense || 0,
      คงเหลือ: statistics?.fiscalYearStatistics.summary.totalRemaining || 0,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
          ยินดีต้อนรับสู่
        </h1>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
          ระบบจัดการโรงเรียนสตูลวิทยา
        </h2>
        <p className="text-base md:text-xl text-gray-500">
          ระบบบริหารจัดการงบประมาณและการเงิน
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <Card className="min-w-[140px]">
          <CardBody className="text-center p-3 md:p-4">
            <p className="text-sm md:text-lg">รายการเบิกจ่าย</p>
            <p className="text-xl md:text-2xl font-bold">
              {statistics?.counts.transactions}
            </p>
          </CardBody>
        </Card>
        <Card className="min-w-[140px]">
          <CardBody className="text-center p-3 md:p-4">
            <p className="text-sm md:text-lg">โครงการ</p>
            <p className="text-xl md:text-2xl font-bold">
              {statistics?.counts.projects}
            </p>
          </CardBody>
        </Card>
        <Card className="min-w-[140px]">
          <CardBody className="text-center p-3 md:p-4">
            <p className="text-sm md:text-lg">ประเภทเงิน</p>
            <p className="text-xl md:text-2xl font-bold">
              {statistics?.counts.subsidies}
            </p>
          </CardBody>
        </Card>
        <Card className="min-w-[140px]">
          <CardBody className="text-center p-3 md:p-4">
            <p className="text-sm md:text-lg">ปีงบประมาณ</p>
            <p className="text-xl md:text-2xl font-bold">
              {statistics?.fiscalYearStatistics.summary.totalYears}
            </p>
            <p className="text-sm text-gray-500">
              งบประมาณรวม{" "}
              {statistics?.fiscalYearStatistics.summary.totalBudget.toLocaleString()}{" "}
              บาท
            </p>
          </CardBody>
        </Card>
        <Card className="min-w-[140px]">
          <CardBody className="text-center p-3 md:p-4">
            <p className="text-sm md:text-lg">ผู้ใช้งาน</p>
            <p className="text-xl md:text-2xl font-bold">
              {statistics?.counts.users}
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <div className="min-w-[800px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 md:p-3 text-left">ปีงบประมาณ</th>
                <th className="p-2 md:p-3 text-right">งบประมาณ</th>
                <th className="p-2 md:p-3 text-right">เบิกจ่าย</th>
                <th className="p-2 md:p-3 text-right">คงเหลือ</th>
                <th className="p-2 md:p-3 text-center">จำนวนโครงการ</th>
                <th className="p-2 md:p-3 text-center">จำนวนประเภทเงิน</th>
              </tr>
            </thead>
            <tbody>
              {statistics?.fiscalYearStatistics.byYear.map((year) => (
                <tr key={year.year} className="border-b hover:bg-gray-50">
                  <td className="p-2 md:p-3">ปีงบประมาณ {year.year}</td>
                  <td className="p-2 md:p-3 text-right">
                    {year.totalBudget.toLocaleString()} บาท
                  </td>
                  <td className="p-2 md:p-3 text-right">
                    {year.totalExpense.toLocaleString()} บาท
                  </td>
                  <td className="p-2 md:p-3 text-right">
                    {year.remainingBudget.toLocaleString()} บาท
                  </td>
                  <td className="p-2 md:p-3 text-center">
                    {year.projectCount}
                  </td>
                  <td className="p-2 md:p-3 text-center">
                    {year.subsidyCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="h-[300px] md:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 20,
                left: 20,
                bottom: 70,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={70}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                width={80}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  value >= 1000000
                    ? (value / 1000000).toFixed(1) + "M"
                    : value >= 1000
                    ? (value / 1000).toFixed(1) + "K"
                    : value
                }
              />
              <Tooltip
                formatter={(value) => value.toLocaleString() + " บาท"}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar
                dataKey="งบประมาณ"
                fill="#0070F0"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Bar
                dataKey="เบิกจ่าย"
                fill="#F31260"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Bar
                dataKey="คงเหลือ"
                fill="#17C964"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
