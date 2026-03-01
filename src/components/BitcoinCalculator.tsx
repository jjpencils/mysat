import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Trash2 } from "lucide-react";

interface BitcoinPrice {
  usd: number;
  thb: number;
  usd_24h_change: number;
}

interface BitcoinAverages {
  avg7d: number;
  avg30d: number;
  avg100d: number;
}

const BitcoinCalculator = () => {
  const [price, setPrice] = useState<BitcoinPrice | null>(null);
  const [averages, setAverages] = useState<BitcoinAverages | null>(null);
  const [thbUsdRate, setThbUsdRate] = useState<number | null>(null);
  const [btc, setBtc] = useState<string>("");
  const [satoshi, setSatoshi] = useState<string>("");
  const [usd, setUsd] = useState<string>("");
  const [thb, setThb] = useState<string>("");
  const [activeField, setActiveField] = useState<string | null>(null);

  const SATOSHI_PER_BTC = 100000000;

  const formatNumber = (value: number): string => {
    return value.toLocaleString('en-US', { maximumFractionDigits: 8 });
  };

  const parseNumber = (value: string): number => {
    return parseFloat(value.replace(/,/g, '')) || 0;
  };

  const resetFields = () => {
    setBtc("");
    setSatoshi("");
    setUsd("");
    setThb("");
    setActiveField(null);
  };

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,thb&include_24hr_change=true"
        );
        const data = await response.json();
        const btcPrice = {
          usd: data.bitcoin.usd,
          thb: data.bitcoin.thb,
          usd_24h_change: data.bitcoin.usd_24h_change,
        };
        setPrice(btcPrice);
        setThbUsdRate(btcPrice.thb / btcPrice.usd);
      } catch (error) {
        console.error("Error fetching Bitcoin price:", error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchAverages = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=100&interval=daily"
        );
        const data = await response.json();
        const prices: number[] = data.prices.map((p: [number, number]) => p[1]);
        
        const last7 = prices.slice(-7);
        const last30 = prices.slice(-30);
        const last100 = prices;

        const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

        setAverages({
          avg7d: avg(last7),
          avg30d: avg(last30),
          avg100d: avg(last100),
        });
      } catch (error) {
        console.error("Error fetching averages:", error);
      }
    };

    fetchAverages();
  }, []);

  const calculateFromThb = useCallback((thbValue: string) => {
    if (price && thbValue) {
      const t = parseNumber(thbValue);
      const btcValue = t / price.thb;
      setBtc(formatNumber(btcValue));
      setSatoshi(formatNumber(btcValue * SATOSHI_PER_BTC));
      setUsd(formatNumber(btcValue * price.usd));
    } else if (!thbValue) {
      setBtc(""); setSatoshi(""); setUsd("");
    }
  }, [price]);

  const calculateFromBtc = useCallback((btcValue: string) => {
    if (price && btcValue) {
      const b = parseNumber(btcValue);
      setSatoshi(formatNumber(b * SATOSHI_PER_BTC));
      setUsd(formatNumber(b * price.usd));
      setThb(formatNumber(b * price.thb));
    } else if (!btcValue) {
      setSatoshi(""); setUsd(""); setThb("");
    }
  }, [price]);

  const calculateFromSatoshi = useCallback((satoshiValue: string) => {
    if (price && satoshiValue) {
      const s = parseNumber(satoshiValue);
      const btcValue = s / SATOSHI_PER_BTC;
      setBtc(formatNumber(btcValue));
      setUsd(formatNumber(btcValue * price.usd));
      setThb(formatNumber(btcValue * price.thb));
    } else if (!satoshiValue) {
      setBtc(""); setUsd(""); setThb("");
    }
  }, [price]);

  const calculateFromUsd = useCallback((usdValue: string) => {
    if (price && usdValue) {
      const u = parseNumber(usdValue);
      const btcValue = u / price.usd;
      setBtc(formatNumber(btcValue));
      setSatoshi(formatNumber(btcValue * SATOSHI_PER_BTC));
      setThb(formatNumber(btcValue * price.thb));
    } else if (!usdValue) {
      setBtc(""); setSatoshi(""); setThb("");
    }
  }, [price]);

  const handleChange = (value: string, field: string) => {
    const clean = value.replace(/,/g, '');
    if (clean !== '' && !/^\d*\.?\d*$/.test(clean)) return;

    setActiveField(field);
    switch (field) {
      case 'thb':
        setThb(clean);
        calculateFromThb(clean);
        break;
      case 'btc':
        setBtc(clean);
        calculateFromBtc(clean);
        break;
      case 'satoshi':
        setSatoshi(clean);
        calculateFromSatoshi(clean);
        break;
      case 'usd':
        setUsd(clean);
        calculateFromUsd(clean);
        break;
    }
  };

  const handleBlur = (value: string, setter: (v: string) => void) => {
    const clean = value.replace(/,/g, '');
    if (clean && !isNaN(Number(clean))) {
      setter(formatNumber(parseNumber(clean)));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">
            THB ⇄ BTC Converter
          </h1>
          <p className="text-muted-foreground text-lg">
            convert THB ⇄ BTC ⇄ SAT ⇄ USD แบบ real-time
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

              {/* THB/USD Exchange Rate */}
              {thbUsdRate && (
                <div className="pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">อัตราแลกเปลี่ยน THB/USD</p>
                    <p className="text-base font-semibold text-foreground">
                      1 USD = ฿{thbUsdRate.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {/* BTC Averages USD */}
              {averages && (
                <div className="pt-3 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-2">ราคาเฉลี่ย Bitcoin (USD)</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground">7 วัน</p>
                      <p className="text-sm font-semibold text-foreground">
                        ${averages.avg7d.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground">30 วัน</p>
                      <p className="text-sm font-semibold text-foreground">
                        ${averages.avg30d.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground">100 วัน</p>
                      <p className="text-sm font-semibold text-foreground">
                        ${averages.avg100d.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* BTC Averages THB */}
              {averages && thbUsdRate && (
                <div className="pt-3 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-2">ราคาเฉลี่ย Bitcoin (THB)</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground">7 วัน</p>
                      <p className="text-sm font-semibold text-gradient">
                        ฿{(averages.avg7d * thbUsdRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground">30 วัน</p>
                      <p className="text-sm font-semibold text-gradient">
                        ฿{(averages.avg30d * thbUsdRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground">100 วัน</p>
                      <p className="text-sm font-semibold text-gradient">
                        ฿{(averages.avg100d * thbUsdRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Calculator Card */}
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
          <div className="space-y-6">
            <div className="grid gap-5">
              {/* THB */}
              <div className="space-y-2">
                <Label htmlFor="thb" className="text-base text-foreground">
                  Thai Baht (THB)
                </Label>
                <Input
                  id="thb"
                  type="text"
                  value={thb}
                  onChange={(e) => handleChange(e.target.value, 'thb')}
                  onBlur={(e) => handleBlur(e.target.value, setThb)}
                  className="text-lg h-12 bg-input border-border text-foreground"
                  autoFocus
                  placeholder="กรอกจำนวนเงินบาท"
                />
              </div>

              {/* BTC */}
              <div className="space-y-2">
                <Label htmlFor="btc" className="text-base text-foreground">
                  Bitcoin (BTC)
                </Label>
                <Input
                  id="btc"
                  type="text"
                  value={btc}
                  onChange={(e) => handleChange(e.target.value, 'btc')}
                  onBlur={(e) => handleBlur(e.target.value, setBtc)}
                  className="text-lg h-12 bg-input border-border text-foreground"
                  placeholder="กรอกจำนวน BTC"
                />
              </div>

              {/* Satoshi */}
              <div className="space-y-2">
                <Label htmlFor="satoshi" className="text-base text-foreground">
                  Satoshi (Sat)
                </Label>
                <Input
                  id="satoshi"
                  type="text"
                  value={satoshi}
                  onChange={(e) => handleChange(e.target.value, 'satoshi')}
                  onBlur={(e) => handleBlur(e.target.value, setSatoshi)}
                  className="text-lg h-12 bg-input border-border text-foreground"
                  placeholder="กรอกจำนวน Satoshi"
                />
              </div>

              {/* USD */}
              <div className="space-y-2">
                <Label htmlFor="usd" className="text-base text-foreground">
                  US Dollar (USD)
                </Label>
                <Input
                  id="usd"
                  type="text"
                  value={usd}
                  onChange={(e) => handleChange(e.target.value, 'usd')}
                  onBlur={(e) => handleBlur(e.target.value, setUsd)}
                  className="text-lg h-12 bg-input border-border text-foreground"
                  placeholder="กรอกจำนวนดอลลาร์"
                />
              </div>
            </div>

            {/* Clear Button */}
            <Button
              onClick={resetFields}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              ล้างตัวเลข
            </Button>

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
