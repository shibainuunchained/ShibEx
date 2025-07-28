import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const referralStats = [
  {
    title: "Total Referrals",
    value: "24",
    icon: "👥"
  },
  {
    title: "Total Earnings",
    value: "$2,456",
    icon: "🪙"
  },
  {
    title: "Commission Rate",
    value: "12%",
    icon: "📊"
  }
];

const recentReferrals = [
  {
    date: "Dec 24, 2024",
    trader: "0x1234...5678",
    volume: "$12,450",
    earned: "+$149.40"
  },
  {
    date: "Dec 23, 2024",
    trader: "0x2345...6789",
    volume: "$8,750",
    earned: "+$105.00"
  },
  {
    date: "Dec 22, 2024",
    trader: "0x3456...7890",
    volume: "$23,100",
    earned: "+$277.20"
  }
];

const howItWorks = [
  {
    step: "1",
    title: "Share",
    description: "Share your referral link with friends and social media",
    icon: "📤"
  },
  {
    step: "2",
    title: "Sign Up",
    description: "Friends sign up and start trading using your link",
    icon: "👤"
  },
  {
    step: "3",
    title: "Earn",
    description: "Earn 12% of their trading fees as rewards",
    icon: "🪙"
  }
];

export default function ReferralsPage() {
  const [referralLink] = useState("https://shibau.io/trade?ref=0x1234567890abcdef");
  const { toast } = useToast();

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "Link Copied",
        description: "Referral link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Referral Program</h1>
        <p className="text-shiba-text-secondary">Earn rewards by referring new traders to ShibaU</p>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {referralStats.map((stat) => (
          <Card key={stat.title} className="glass-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl mb-4">{stat.icon}</div>
              <div className="text-2xl font-bold mb-2">{stat.value}</div>
              <div className="text-shiba-text-muted">{stat.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Referral Link */}
      <Card className="glass-card mb-8">
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-3">
            <Input
              value={referralLink}
              readOnly
              className="flex-1 bg-shiba-dark border-border"
            />
            <Button onClick={copyReferralLink} className="shiba-gradient">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </Button>
          </div>
          <div className="text-sm text-shiba-text-muted">
            Share this link with friends and earn 12% of their trading fees
          </div>
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card className="glass-card mb-8">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorks.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-16 h-16 shiba-gradient rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  {step.icon}
                </div>
                <h4 className="font-semibold mb-2">{step.step}. {step.title}</h4>
                <p className="text-sm text-shiba-text-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-4 gap-4 text-sm text-shiba-text-muted border-b border-border pb-2 mb-4 min-w-[400px]">
              <div>Date</div>
              <div>Trader</div>
              <div>Volume</div>
              <div>Earned</div>
            </div>
            
            <div className="space-y-2 min-w-[400px]">
              {recentReferrals.map((referral, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 text-sm items-center py-2 border-b border-border/50 hover:bg-shiba-card/30 transition-colors">
                  <div>{referral.date}</div>
                  <div>{referral.trader}</div>
                  <div>{referral.volume}</div>
                  <div className="text-shiba-success">{referral.earned}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
