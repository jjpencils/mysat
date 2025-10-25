import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bitcoin, TrendingUp, TrendingDown } from "lucide-react";

interface BitcoinPrice {
  usd: number;
  thb: number;
  usd_24h_change: number;
}

const BitcoinCalculator = () => {
  const [price, setPrice] = useState<BitcoinPrice | null>(null);
  const [btc, setBtc] = useState<string>("");
  const [satoshi, setSatoshi] = useState<string>("");
  const [usd, setUsd] = useState<string>("");
  const [thb, setThb] = useState<string>("");

  const SATOSHI_PER_BTC = 100000000;

  const resetFields = () => {
    setBtc("");
    setSatoshi("");
    setUsd("");
    setThb("");
  };

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


  const calculateFromThb = (thbValue: string) => {
    if (price && thbValue) {
      const thb = parseFloat(thbValue) || 0;
      const btcValue = thb / price.thb;
      setBtc(btcValue.toFixed(8));
      setSatoshi(String(btcValue * SATOSHI_PER_BTC));
      setUsd(String(btcValue * price.usd));
    }
  };

  const calculateFromBtc = (btcValue: string) => {
    if (price && btcValue) {
      const btc = parseFloat(btcValue) || 0;
      setSatoshi(String(btc * SATOSHI_PER_BTC));
      setUsd(String(btc * price.usd));
      setThb(String(btc * price.thb));
    }
  };

  const calculateFromSatoshi = (satoshiValue: string) => {
    if (price && satoshiValue) {
      const satoshi = parseFloat(satoshiValue) || 0;
      const btcValue = satoshi / SATOSHI_PER_BTC;
      setBtc(btcValue.toFixed(8));
      setUsd(String(btcValue * price.usd));
      setThb(String(btcValue * price.thb));
    }
  };

  const calculateFromUsd = (usdValue: string) => {
    if (price && usdValue) {
      const usd = parseFloat(usdValue) || 0;
      const btcValue = usd / price.usd;
      setBtc(btcValue.toFixed(8));
      setSatoshi(String(btcValue * SATOSHI_PER_BTC));
      setThb(String(btcValue * price.thb));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, field: string) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLInputElement;
      const value = target.value;
      
      switch (field) {
        case 'thb':
          calculateFromThb(value);
          break;
        case 'btc':
          calculateFromBtc(value);
          break;
        case 'satoshi':
          calculateFromSatoshi(value);
          break;
        case 'usd':
          calculateFromUsd(value);
          break;
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">
            Bitcoin Calculator
          </h1>
          <p className="text-muted-foreground text-lg">
            แปลงหน่วย Bitcoin และ Satoshi แบบ real-time
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
                  <p className="text-sm text-muted-foreground">THB</p>
                  <p className="text-xl md:text-3xl font-bold text-gradient">
                    ฿{price.thb.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">USD</p>
                  <p className="text-lg md:text-2xl font-bold text-secondary">
                    ${price.usd.toLocaleString()}
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
              {/* THB */}
              <div className="space-y-2">
                <Label htmlFor="thb" className="text-base text-foreground">
                  Thai Baht (THB)
                </Label>
                <Input
                  id="thb"
                  type="number"
                  value={thb}
                  onChange={(e) => setThb(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'thb')}
                  className="text-lg h-12 bg-input border-border text-foreground"
                  autoFocus
                  placeholder="กรอกจำนวนเงินบาท"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => calculateFromThb(thb)}
                    className="w-full"
                    size="lg"
                  >
                    คำนวณ
                  </Button>
                  <Button 
                    onClick={resetFields}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    ล้างตัวเลข
                  </Button>
                </div>
              </div>

              {/* BTC */}
              <div className="space-y-2">
                <Label htmlFor="btc" className="text-base text-foreground">
                  Bitcoin (BTC)
                </Label>
                <Input
                  id="btc"
                  type="number"
                  value={btc}
                  onChange={(e) => setBtc(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'btc')}
                  className="text-lg h-12 bg-input border-border text-foreground"
                  placeholder="กรอกจำนวน BTC"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => calculateFromBtc(btc)}
                    className="w-full"
                    size="lg"
                  >
                    คำนวณ
                  </Button>
                  <Button 
                    onClick={resetFields}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    ล้างตัวเลข
                  </Button>
                </div>
              </div>

              {/* Satoshi */}
              <div className="space-y-2">
                <Label htmlFor="satoshi" className="text-base text-foreground">
                  Satoshi (Sats)
                </Label>
                <Input
                  id="satoshi"
                  type="number"
                  value={satoshi}
                  onChange={(e) => setSatoshi(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'satoshi')}
                  className="text-lg h-12 bg-input border-border text-foreground"
                  placeholder="กรอกจำนวน Satoshi"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => calculateFromSatoshi(satoshi)}
                    className="w-full"
                    size="lg"
                  >
                    คำนวณ
                  </Button>
                  <Button 
                    onClick={resetFields}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    ล้างตัวเลข
                  </Button>
                </div>
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
                  onChange={(e) => setUsd(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'usd')}
                  className="text-lg h-12 bg-input border-border text-foreground"
                  placeholder="กรอกจำนวนดอลลาร์"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => calculateFromUsd(usd)}
                    className="w-full"
                    size="lg"
                  >
                    คำนวณ
                  </Button>
                  <Button 
                    onClick={resetFields}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    ล้างตัวเลข
                  </Button>
                </div>
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
