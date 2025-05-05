
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useBork } from "@/context/BorkContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Rocket, Piggybank } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Target date - October 10, 2025
const TARGET_DATE = new Date('2025-10-10T00:00:00').getTime();

// Form schema for airdrop claims
const airdropFormSchema = z.object({
  email: z.string().email("Please enter a valid email address").optional().or(z.literal('')),
  twitter_handle: z.string().optional().or(z.literal('')),
  telegram_handle: z.string().optional().or(z.literal(''))
});

type AirdropFormValues = z.infer<typeof airdropFormSchema>;

const AirdropPage = () => {
  const { toast } = useToast();
  const { connected, account } = useBork();
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number}>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [hasPaid, setHasPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const form = useForm<AirdropFormValues>({
    resolver: zodResolver(airdropFormSchema),
    defaultValues: {
      email: "",
      twitter_handle: "",
      telegram_handle: ""
    }
  });

  // Calculate time remaining
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = TARGET_DATE - now;
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check if user has already paid for premium pass
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (connected && account) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('airdrop_claims')
            .select('paid')
            .eq('wallet_address', account)
            .maybeSingle();
            
          if (error) throw error;
          setHasPaid(!!data?.paid);
        } catch (error) {
          console.error("Error checking payment status:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkPaymentStatus();
  }, [connected, account]);

  const handlePayment = async () => {
    if (!connected || !account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    // In a real application, you would integrate with a payment processor or blockchain
    // For this demo, we'll simulate a payment and update the database

    setIsLoading(true);
    try {
      // Create a record or update existing one
      const { data, error } = await supabase
        .from('airdrop_claims')
        .upsert({
          wallet_address: account,
          paid: true,
          payment_tx_hash: 'simulated-tx-hash-' + Math.random().toString(36).substring(2, 15),
        }, {
          onConflict: 'wallet_address'
        });

      if (error) throw error;
      
      setHasPaid(true);
      toast({
        title: "Payment successful!",
        description: "You can now submit your airdrop claim",
      });
    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: AirdropFormValues) => {
    if (!connected || !account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('airdrop_claims')
        .update({
          email: values.email || null,
          twitter_handle: values.twitter_handle || null,
          telegram_handle: values.telegram_handle || null
        })
        .eq('wallet_address', account);

      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Your airdrop claim has been submitted",
      });
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-24 md:py-32">
      {/* Hero section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
          <span className="text-white">$BORK</span> <span className="text-bork-green neon-text">Airdrop</span>
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">
          Participate in the $BORK token airdrop by claiming your allocation. 
          Get early access by purchasing a Premier Pass for only $2 USDT.
        </p>
      </div>

      {/* Countdown Timer */}
      <div className="max-w-4xl mx-auto mb-16">
        <Card className="bg-black/60 border border-bork-green/50">
          <CardHeader className="text-center">
            <CardTitle className="text-xl md:text-2xl text-white">
              Airdrop Claiming Opens In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2 md:gap-4">
              <div className="flex flex-col items-center bg-black/80 p-4 rounded-lg border border-bork-green/30">
                <span className="text-2xl md:text-4xl lg:text-5xl font-bold text-bork-green neon-text">
                  {timeLeft.days}
                </span>
                <span className="text-xs md:text-sm mt-1">Days</span>
              </div>
              <div className="flex flex-col items-center bg-black/80 p-4 rounded-lg border border-bork-green/30">
                <span className="text-2xl md:text-4xl lg:text-5xl font-bold text-bork-green neon-text">
                  {timeLeft.hours}
                </span>
                <span className="text-xs md:text-sm mt-1">Hours</span>
              </div>
              <div className="flex flex-col items-center bg-black/80 p-4 rounded-lg border border-bork-green/30">
                <span className="text-2xl md:text-4xl lg:text-5xl font-bold text-bork-green neon-text">
                  {timeLeft.minutes}
                </span>
                <span className="text-xs md:text-sm mt-1">Minutes</span>
              </div>
              <div className="flex flex-col items-center bg-black/80 p-4 rounded-lg border border-bork-green/30">
                <span className="text-2xl md:text-4xl lg:text-5xl font-bold text-bork-green neon-text">
                  {timeLeft.seconds}
                </span>
                <span className="text-xs md:text-sm mt-1">Seconds</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Premier Pass and Form Section */}
      <div className="max-w-2xl mx-auto">
        {!connected ? (
          <div className="text-center py-8">
            <h2 className="text-xl md:text-2xl mb-4">Connect your wallet to participate</h2>
            <p className="mb-4 text-gray-400">You need to connect your wallet first to access the airdrop claim.</p>
          </div>
        ) : (
          <>
            {!hasPaid ? (
              <Card className="bg-black/60 border border-bork-green/50 mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-6 w-6 text-bork-green" />
                    Premier Pass
                  </CardTitle>
                  <CardDescription>
                    Purchase a Premier Pass for $2 USDT to unlock early access to the airdrop
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    The Premier Pass gives you priority access to the $BORK token airdrop
                    and increases your chances of eligibility.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handlePayment}
                    disabled={isLoading}
                    className="bork-button w-full"
                  >
                    {isLoading ? "Processing..." : "Purchase Premier Pass ($2 USDT)"}
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="bg-black/60 border border-bork-green/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-6 w-6 text-bork-green" />
                    Airdrop Claim Form
                  </CardTitle>
                  <CardDescription>
                    Fill in your details to complete your airdrop claim
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              We'll send you updates about the airdrop
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="twitter_handle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter Handle (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="@yourusername" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="telegram_handle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telegram Handle (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="@yourusername" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="py-2">
                        <p className="text-sm text-gray-400 mb-4">
                          Connected Wallet: {account}
                        </p>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="bork-button w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Submitting..." : "Submit Claim"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AirdropPage;
