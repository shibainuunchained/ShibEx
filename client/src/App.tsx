import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "@/hooks/use-wallet";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Navigation from "@/components/ui/navigation";
import NotFound from "@/pages/not-found";
import TradePage from "@/pages/trade";
import EarnPage from "@/pages/earn";
import BuyPage from "@/pages/buy";
import DashboardPage from "@/pages/dashboard";
import LeaderboardPage from "@/pages/leaderboard";
import ReferralsPage from "@/pages/referrals";
import SwapPage from "@/pages/swap";

function Router() {
  return (
    <>
      <Navigation />
      <Switch>
        <Route path="/" component={TradePage} />
        <Route path="/trade" component={TradePage} />
        <Route path="/earn" component={EarnPage} />
        <Route path="/buy" component={BuyPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/leaderboard" component={LeaderboardPage} />
        <Route path="/referrals" component={ReferralsPage} />
        <Route path="/swap" component={SwapPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-shiba-dark text-shiba-text-primary">
              <Router />
              <Toaster />
            </div>
          </TooltipProvider>
        </WalletProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
