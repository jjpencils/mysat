import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

interface ChartDataPoint {
  date: string;
  price: number;
  timestamp: number;
}

const BitcoinPriceChart = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true);
        
        // Use CoinCap API - higher rate limit and no API key required
        const response = await fetch(
          "https://api.coincap.io/v2/assets/bitcoin/history?interval=d1"
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Check if data exists
        if (!result || !result.data || !Array.isArray(result.data)) {
          console.error("Invalid data format:", result);
          setLoading(false);
          return;
        }
        
        // Convert data to chart format
        const formattedData: ChartDataPoint[] = result.data.map((item: any) => ({
          timestamp: item.time,
          date: new Date(item.time).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short',
            day: 'numeric'
          }),
          price: Math.round(parseFloat(item.priceUsd))
        }));

        setChartData(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching historical Bitcoin price:", error);
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, []);

  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground mb-1">{payload[0].payload.date}</p>
          <p className="text-lg font-bold text-gradient">
            ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-muted-foreground">กำลังโหลดข้อมูลกราฟ...</div>
        </div>
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-muted-foreground">ไม่สามารถโหลดข้อมูลกราฟได้ กรุณาลองใหม่อีกครั้ง</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            ราคา Bitcoin ตั้งแต่ปี 2009 ถึงปัจจุบัน
          </h2>
        </div>
        
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
                tickFormatter={(value, index) => {
                  // Show only year for better readability
                  if (index % Math.floor(chartData.length / 10) === 0) {
                    return new Date(chartData[index].timestamp).getFullYear().toString();
                  }
                  return '';
                }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
                tickFormatter={formatYAxis}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          ข้อมูลจาก CoinCap API (อัปเดตรายวัน)
        </p>
      </div>
    </Card>
  );
};

export default BitcoinPriceChart;
