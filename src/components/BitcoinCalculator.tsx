import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bitcoin, TrendingUp, TrendingDown } from "lucide-react";

interface BitcoinPrice {
  usd: number;
  thb: number;
  usd_24h_change: number;
}

const BitcoinCalculator = () => {
  const [price, setPrice] = useState<BitcoinPrice | null>(null);
  const [btc, setBtc] = useState<string>("1");
  const [satoshi, setSatoshi] = useState<string>("100000000");
  const [usd, setUsd] = useState<string>("0");
  const [thb, setThb] = useState<string>("0");

  const SATOSHI_PER_BTC = 100000000;

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,thb&include_24hr_change=true"
        );
        const data = await response.json();
        setPrice({
          usd: data.bitcoin.usd,
          thb: data.bitcoin.thb,
          usd_24h_change: data.bitcoin.usd_24h_change,
        });
      } catch (error) {
        console.error("Error fetching Bitcoin price:", error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (price) {
      const btcValue = parseFloat(btc) || 0;
      setUsd((btcValue * price.usd).toFixed(2));
      setThb((btcValue * price.thb).toFixed(2));
    }
  }, [btc, price]);

  const handleBtcChange = (value: string) => {
    setBtc(value);
    const btcValue = parseFloat(value) || 0;
    setSatoshi((btcValue * SATOSHI_PER_BTC).toFixed(0));
  };

  const handleSatoshiChange = (value: string) => {
    setSatoshi(value);
    const satoshiValue = parseFloat(value) || 0;
    setBtc((satoshiValue / SATOSHI_PER_BTC).toFixed(8));
  };

  const handleUsdChange = (value: string) => {
    setUsd(value);
    if (price) {
      const usdValue = parseFloat(value) || 0;
      const btcValue = usdValue / price.usd;
      setBtc(btcValue.toFixed(8));
      setSatoshi((btcValue * SATOSHI_PER_BTC).toFixed(0));
    }
  };

  const handleThbChange = (value: string) => {
    setThb(value);
    if (price) {
      const thbValue = parseFloat(value) || 0;
      const btcValue = thbValue / price.thb;
      setBtc(btcValue.toFixed(8));
      setSatoshi((btcValue * SATOSHI_PER_BTC).toFixed(0));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Bitcoin className="w-12 h-12 text-primary animate-glow" />
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">
              Bitcoin Calculator
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            แปลงหน่วย Bitcoin และ Satoshi แบบเรียลไทม์
          </p>
        </div>

        {/* Price Card */}
        {price && (
          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  ราคา Bitcoin ปัจจุบัน
                </h2>
                <div
                  className={`flex items-center gap-2 ${
                    price.usd_24h_change >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {price.usd_24h_change >= 0 ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  <span className="font-semibold">
                    {price.usd_24h_change.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">USD</p>
                  <p className="text-2xl font-bold text-gradient">
                    ${price.usd.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">THB</p>
                  <p className="text-2xl font-bold text-secondary">
                    ฿{price.thb.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Calculator Card */}
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">
              เครื่องคิดเลข
            </h2>

            <div className="grid gap-6">
              {/* BTC */}
              <div className="space-y-2">
                <Label htmlFor="btc" className="text-base text-foreground">
                  Bitcoin (BTC)
                </Label>
                <Input
                  id="btc"
                  type="number"
                  value={btc}
                  onChange={(e) => handleBtcChange(e.target.value)}
                  className="text-lg h-12 bg-input border-border text-foreground"
                  step="0.00000001"
                />
              </div>

              {/* Satoshi */}
              <div className="space-y-2">
                <Label htmlFor="satoshi" className="text-base text-foreground">
                  Satoshi (โตชิ)
                </Label>
                <Input
                  id="satoshi"
                  type="number"
                  value={satoshi}
                  onChange={(e) => handleSatoshiChange(e.target.value)}
                  className="text-lg h-12 bg-input border-border text-foreground"
                  step="1"
                />
              </div>

              {/* USD */}
              <div className="space-y-2">
                <Label htmlFor="usd" className="text-base text-foreground">
                  US Dollar (USD)
                </Label>
                <Input
                  id="usd"
                  type="number"
                  value={usd}
                  onChange={(e) => handleUsdChange(e.target.value)}
                  className="text-lg h-12 bg-input border-border text-foreground"
                  step="0.01"
                />
              </div>

              {/* THB */}
              <div className="space-y-2">
                <Label htmlFor="thb" className="text-base text-foreground">
                  Thai Baht (THB)
                </Label>
                <Input
                  id="thb"
                  type="number"
                  value={thb}
                  onChange={(e) => handleThbChange(e.target.value)}
                  className="text-lg h-12 bg-input border-border text-foreground"
                  step="0.01"
                />
              </div>
            </div>

            {/* Info */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                1 BTC = 100,000,000 Satoshi
              </p>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          ข้อมูลอัปเดตทุก 30 วินาที จาก CoinGecko API
        </p>
      </div>
    </div>
  );
};

export default BitcoinCalculator;
