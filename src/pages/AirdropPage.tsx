
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useBork } from "@/context/BorkContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Rocket, PiggyBank, Copy, QrCode } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Target date - October 10, 2025
const TARGET_DATE = new Date('2025-10-10T00:00:00').getTime();

// Form schema for airdrop claims
const airdropFormSchema = z.object({
  email: z.string().email("Please enter a valid email address").optional().or(z.literal('')),
  twitter_handle: z.string().optional().or(z.literal('')),
  telegram_handle: z.string().optional().or(z.literal(''))
});

type AirdropFormValues = z.infer<typeof airdropFormSchema>;

// Payment schema
const paymentFormSchema = z.object({
  tx_hash: z.string().min(10, "Please enter a valid transaction hash")
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

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
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const WALLET_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

  const claimForm = useForm<AirdropFormValues>({
    resolver: zodResolver(airdropFormSchema),
    defaultValues: {
      email: "",
      twitter_handle: "",
      telegram_handle: ""
    }
  });

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      tx_hash: ""
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

  const handleManualPayment = async (values: PaymentFormValues) => {
    if (!connected || !account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Create a record or update existing one
      const { data, error } = await supabase
        .from('airdrop_claims')
        .upsert({
          wallet_address: account,
          paid: true,
          payment_tx_hash: values.tx_hash,
        }, {
          onConflict: 'wallet_address'
        });

      if (error) throw error;
      
      setHasPaid(true);
      toast({
        title: "Payment verified!",
        description: "You can now submit your airdrop claim",
      });
      
      paymentForm.reset();
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleDemoPayment = async () => {
    if (!connected || !account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingPayment(true);
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
      setIsProcessingPayment(false);
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(WALLET_ADDRESS);
    toast({
      title: "Wallet address copied!",
      description: "The address has been copied to your clipboard",
    });
  };

  return (
    <div className="container mx-auto px-4 py-24 md:py-32">
      {/* Hero section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
          <span className="text-white">Anticipate the</span> <span className="text-bork-green neon-text">$BORK</span> <span className="text-white">airdrop claim</span>
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-white">
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
                <span className="text-xs md:text-sm mt-1 text-white">Days</span>
              </div>
              <div className="flex flex-col items-center bg-black/80 p-4 rounded-lg border border-bork-green/30">
                <span className="text-2xl md:text-4xl lg:text-5xl font-bold text-bork-green neon-text">
                  {timeLeft.hours}
                </span>
                <span className="text-xs md:text-sm mt-1 text-white">Hours</span>
              </div>
              <div className="flex flex-col items-center bg-black/80 p-4 rounded-lg border border-bork-green/30">
                <span className="text-2xl md:text-4xl lg:text-5xl font-bold text-bork-green neon-text">
                  {timeLeft.minutes}
                </span>
                <span className="text-xs md:text-sm mt-1 text-white">Minutes</span>
              </div>
              <div className="flex flex-col items-center bg-black/80 p-4 rounded-lg border border-bork-green/30">
                <span className="text-2xl md:text-4xl lg:text-5xl font-bold text-bork-green neon-text">
                  {timeLeft.seconds}
                </span>
                <span className="text-xs md:text-sm mt-1 text-white">Seconds</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Premier Pass and Form Section */}
      <div className="max-w-2xl mx-auto">
        {!connected ? (
          <div className="text-center py-8">
            <h2 className="text-xl md:text-2xl mb-4 text-white">Connect your wallet to participate</h2>
            <p className="mb-4 text-gray-400">You need to connect your wallet first to access the airdrop claim.</p>
          </div>
        ) : (
          <>
            {!hasPaid ? (
              <Card className="bg-black/60 border border-bork-green/50 mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Rocket className="h-6 w-6 text-bork-green" />
                    Premier Pass
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Purchase a Premier Pass for $2 USDT to unlock early access to the airdrop
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="payment" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="payment">Make Payment</TabsTrigger>
                      <TabsTrigger value="verify">Verify Payment</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="payment">
                      <div className="space-y-6">
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-semibold text-white mb-2">Pay $2 USDT for Premier Pass</h3>
                          <p className="text-gray-400 text-sm">Send payment to the wallet address below</p>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center">
                          <div className="bg-white p-4 rounded-xl mb-4">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${WALLET_ADDRESS}`}
                              alt="Payment QR Code"
                              className="w-48 h-48"
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2 bg-black/40 p-3 rounded-xl border border-bork-green/30 w-full">
                            <div className="font-mono text-sm text-bork-green break-all flex-1">
                              {WALLET_ADDRESS}
                            </div>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="shrink-0"
                              onClick={copyToClipboard}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="bg-black/40 p-4 rounded-xl border border-bork-green/30">
                          <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                            <PiggyBank className="h-4 w-4 text-bork-green" /> 
                            Payment Instructions
                          </h4>
                          <ul className="list-disc list-inside space-y-2 text-gray-400 text-sm">
                            <li>Send exactly $2 USDT (TRC20 or ERC20)</li>
                            <li>Save your transaction hash/ID</li>
                            <li>Go to the "Verify Payment" tab and submit your transaction hash</li>
                            <li>Once verified, you'll gain access to the airdrop claim form</li>
                          </ul>
                        </div>
                        
                        <Button
                          onClick={() => document.querySelector('[data-value="verify"]')?.dispatchEvent(new Event('click'))}
                          className="bork-button w-full"
                        >
                          I've Made the Payment
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="verify">
                      <Form {...paymentForm}>
                        <form onSubmit={paymentForm.handleSubmit(handleManualPayment)} className="space-y-4">
                          <FormField
                            control={paymentForm.control}
                            name="tx_hash"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Transaction Hash</FormLabel>
                                <FormControl>
                                  <Input placeholder="0x..." {...field} />
                                </FormControl>
                                <FormDescription className="text-gray-400">
                                  Enter the transaction hash/ID from your $2 USDT payment
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex flex-col md:flex-row gap-3 mt-6">
                            <Button 
                              type="submit" 
                              className="bork-button w-full md:w-2/3"
                              disabled={isProcessingPayment}
                            >
                              {isProcessingPayment ? "Verifying..." : "Verify Payment"}
                            </Button>
                            
                            <Button 
                              type="button"
                              variant="outline"
                              className="w-full md:w-1/3"
                              onClick={handleDemoPayment}
                              disabled={isProcessingPayment}
                            >
                              Simulate Payment
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-black/60 border border-bork-green/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Rocket className="h-6 w-6 text-bork-green" />
                    Airdrop Claim Form
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Fill in your details to complete your airdrop claim
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...claimForm}>
                    <form onSubmit={claimForm.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={claimForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Email (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormDescription className="text-gray-400">
                              We'll send you updates about the airdrop
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={claimForm.control}
                        name="twitter_handle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Twitter Handle (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="@yourusername" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={claimForm.control}
                        name="telegram_handle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Telegram Handle (Optional)</FormLabel>
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
