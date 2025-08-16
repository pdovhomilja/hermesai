"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MessageCircle, FileText, Download, Crown } from "lucide-react";
import { useRouter } from "next/navigation";

interface UsageData {
  subscription: {
    status: string;
    plan: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    trialEnd: string | null;
  };
  usage: {
    current: {
      messages: number;
      conversations: number;
      exports: number;
    };
    limits: {
      messages: number;
      conversations: number;
      exports: number;
    };
    remaining: {
      messages: number;
      conversations: number;
      exports: number;
    };
    features: {
      messagesPerMonth: number;
      historyDays: number;
      exportEnabled: boolean;
      advancedFeatures: boolean;
    };
  };
  billingInfo: {
    canAccessBillingPortal: boolean;
    needsUpgrade: boolean;
  };
}

export function UsageStatus() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      const response = await fetch("/api/subscription/status");
      if (response.ok) {
        const usageData = await response.json();
        setData(usageData);
      }
    } catch (error) {
      console.error("Failed to fetch usage data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min(Math.round((current / limit) * 100), 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-green-600";
  };


  const formatLimit = (limit: number) => {
    return limit === -1 ? "Unlimited" : limit.toLocaleString();
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "SEEKER":
        return "bg-purple-100 text-purple-800";
      case "ADEPT":
        return "bg-blue-100 text-blue-800";
      case "MASTER":
        return "bg-amber-100 text-amber-800";
      case "FREE":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage & Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage & Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Failed to load usage data</p>
        </CardContent>
      </Card>
    );
  }

  const isTrialing = data.subscription.status === "TRIAL";
  const isPastDue = data.subscription.status === "PAST_DUE";

  return (
    <div className="space-y-6">
      {/* Plan Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Subscription Status</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getPlanBadgeColor(data.subscription.plan)}>
              {data.subscription.plan}
            </Badge>
            {isTrialing && <Badge variant="secondary">Trial</Badge>}
            {isPastDue && <Badge variant="destructive">Past Due</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isTrialing && data.subscription.trialEnd && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                Your free trial expires on{" "}
                {new Date(data.subscription.trialEnd).toLocaleDateString()}
              </p>
            </div>
          )}

          {isPastDue && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                Your subscription payment is past due. Please update your payment method.
              </p>
              {data.billingInfo.canAccessBillingPortal && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => router.push("/settings/billing")}
                >
                  Update Payment Method
                </Button>
              )}
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {isTrialing 
                ? "Trial Period" 
                : `Current period ends ${new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}`
              }
            </span>
            {data.billingInfo.canAccessBillingPortal && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push("/settings/billing")}
              >
                Manage Billing
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Messages */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-purple-600" />
                <span className="font-medium">Messages</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {data.usage.current.messages.toLocaleString()} / {formatLimit(data.usage.limits.messages)}
              </span>
            </div>
            {data.usage.limits.messages !== -1 && (
              <div className="space-y-1">
                <Progress 
                  value={getUsagePercentage(data.usage.current.messages, data.usage.limits.messages)}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{data.usage.remaining.messages} remaining</span>
                  <span className={getUsageColor(getUsagePercentage(data.usage.current.messages, data.usage.limits.messages))}>
                    {getUsagePercentage(data.usage.current.messages, data.usage.limits.messages)}%
                  </span>
                </div>
              </div>
            )}
            {data.usage.limits.messages === -1 && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Crown className="w-3 h-3" />
                Unlimited
              </div>
            )}
          </div>

          {/* Conversations */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Conversations</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {data.usage.current.conversations.toLocaleString()} / {formatLimit(data.usage.limits.conversations)}
              </span>
            </div>
            {data.usage.limits.conversations !== -1 && (
              <div className="space-y-1">
                <Progress 
                  value={getUsagePercentage(data.usage.current.conversations, data.usage.limits.conversations)}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{data.usage.remaining.conversations} remaining</span>
                  <span className={getUsageColor(getUsagePercentage(data.usage.current.conversations, data.usage.limits.conversations))}>
                    {getUsagePercentage(data.usage.current.conversations, data.usage.limits.conversations)}%
                  </span>
                </div>
              </div>
            )}
            {data.usage.limits.conversations === -1 && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Crown className="w-3 h-3" />
                Unlimited
              </div>
            )}
          </div>

          {/* Exports */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-green-600" />
                <span className="font-medium">Exports</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {data.usage.current.exports.toLocaleString()} / {formatLimit(data.usage.limits.exports)}
              </span>
            </div>
            {data.usage.limits.exports === 0 && (
              <div className="text-xs text-muted-foreground">
                Export feature not available in your plan
              </div>
            )}
            {data.usage.limits.exports > 0 && data.usage.limits.exports !== -1 && (
              <div className="space-y-1">
                <Progress 
                  value={getUsagePercentage(data.usage.current.exports, data.usage.limits.exports)}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{data.usage.remaining.exports} remaining</span>
                  <span className={getUsageColor(getUsagePercentage(data.usage.current.exports, data.usage.limits.exports))}>
                    {getUsagePercentage(data.usage.current.exports, data.usage.limits.exports)}%
                  </span>
                </div>
              </div>
            )}
            {data.usage.limits.exports === -1 && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Crown className="w-3 h-3" />
                Unlimited
              </div>
            )}
          </div>

          {/* Upgrade CTA */}
          {data.billingInfo.needsUpgrade && (
            <div className="pt-4 border-t">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Unlock unlimited conversations and advanced features
                </p>
                <Button onClick={() => router.push("/pricing")} size="sm">
                  Upgrade Plan
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}