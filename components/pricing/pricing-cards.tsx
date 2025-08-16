"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Zap, Loader2 } from "lucide-react";
import { SUBSCRIPTION_PLANS, formatPrice, calculateAnnualSavings } from "@/lib/stripe/config";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";

interface PricingCardsProps {
  currentPlan?: string;
  onPlanSelect?: (planKey: string) => void;
}

export function PricingCards({ onPlanSelect }: PricingCardsProps) {
  const [annual, setAnnual] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    subscription?: {
      plan: string;
      status: string;
    };
  } | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchSubscriptionStatus();
    }
  }, [session]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch("/api/subscription/status");
      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch subscription status:", error);
    }
  };

  const handleSubscribe = async (priceId: string, planKey: string) => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=/pricing");
      return;
    }

    if (onPlanSelect) {
      onPlanSelect(planKey);
      return;
    }

    // Check if user already has this plan
    if (subscriptionStatus?.subscription?.plan === planKey && 
        subscriptionStatus?.subscription?.status === "ACTIVE") {
      toast.info("You already have this plan!");
      return;
    }

    setLoading(planKey);

    try {
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        if (response.status === 409) {
          // User already has a subscription
          toast.error(data.error || "You already have an active subscription");
          if (data.upgradeUrl) {
            router.push(data.upgradeUrl);
          }
        } else {
          toast.error(data.error || "Failed to start checkout");
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const getPlanIcon = (planKey: string) => {
    switch (planKey) {
      case "SEEKER":
        return <Sparkles className="w-8 h-8" />;
      case "ADEPT":
        return <Zap className="w-8 h-8" />;
      case "MASTER":
        return <Crown className="w-8 h-8" />;
      default:
        return <Sparkles className="w-8 h-8" />;
    }
  };

  const getPlanColor = (planKey: string, isPopular: boolean) => {
    if (isPopular) {
      return "border-purple-400 shadow-lg scale-105 ring-2 ring-purple-200";
    }
    
    switch (planKey) {
      case "SEEKER":
        return "border-purple-200 hover:border-purple-300";
      case "ADEPT":
        return "border-purple-300 hover:border-purple-400";
      case "MASTER":
        return "border-amber-300 hover:border-amber-400";
      default:
        return "border-purple-200";
    }
  };

  const getButtonText = (planKey: string) => {
    if (loading === planKey) {
      return (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      );
    }

    if (subscriptionStatus?.subscription?.plan === planKey && 
        subscriptionStatus?.subscription?.status === "ACTIVE") {
      return "Current Plan";
    }

    if (subscriptionStatus?.subscription?.status === "ACTIVE" && 
        subscriptionStatus?.subscription?.plan !== planKey) {
      return "Switch Plan";
    }

    return "Start Free Trial";
  };

  const isCurrentPlan = (planKey: string) => {
    return subscriptionStatus?.subscription?.plan === planKey && 
           subscriptionStatus?.subscription?.status === "ACTIVE";
  };

  const plans = [
    {
      key: "SEEKER",
      popular: false,
    },
    {
      key: "ADEPT",
      popular: true,
    },
    {
      key: "MASTER",
      popular: false,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Annual/Monthly Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>
          Monthly
        </span>
        <Switch checked={annual} onCheckedChange={setAnnual} />
        <span className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}>
          Annual
          <Badge variant="secondary" className="ml-2 text-xs">
            Save {calculateAnnualSavings("ADEPT")}%
          </Badge>
        </span>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((planConfig) => {
          const plan = SUBSCRIPTION_PLANS[planConfig.key as keyof typeof SUBSCRIPTION_PLANS];
          const price = annual ? plan.prices.annual : plan.prices.monthly;
          const displayPrice = formatPrice(price.amount);
          const monthlyEquivalent = annual ? formatPrice(price.amount / 12) : null;

          return (
            <Card
              key={planConfig.key}
              className={`relative transition-all duration-200 ${getPlanColor(planConfig.key, planConfig.popular)} ${
                planConfig.popular ? "md:-mt-4" : ""
              } ${isCurrentPlan(planConfig.key) ? "ring-2 ring-green-500" : ""}`}
            >
              {planConfig.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              {isCurrentPlan(planConfig.key) && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Current
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 text-purple-600 dark:text-purple-400">
                  {getPlanIcon(planConfig.key)}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Pricing */}
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{displayPrice}</span>
                    <span className="text-muted-foreground text-lg">
                      /{annual ? "year" : "month"}
                    </span>
                  </div>
                  {annual && monthlyEquivalent && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {monthlyEquivalent}/month when paid annually
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={planConfig.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(price.priceId, planConfig.key)}
                  disabled={loading === planConfig.key || isCurrentPlan(planConfig.key)}
                >
                  {getButtonText(planConfig.key)}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Free Trial Notice */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          All plans include a 7-day free trial. Cancel anytime.
        </p>
        <p className="text-xs text-muted-foreground">
          No credit card charged during trial period.
        </p>
      </div>

      {/* Plan Comparison */}
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Questions about pricing? 
          <Link href="/support" className="text-purple-600 hover:text-purple-700 ml-1 underline">
            Contact our support team
          </Link>
        </p>
      </div>
    </div>
  );
}