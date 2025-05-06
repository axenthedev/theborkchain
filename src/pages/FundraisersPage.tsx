
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useBork } from "@/context/BorkContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Coins, PiggyBank, QrCode, Copy, Trophy, History, ArrowDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FundraiserBadge, { BADGE_TIERS, getBadgeTierByAmount } from "@/components/FundraiserBadge";
import ContributionHistory, { Contribution } from "@/components/ContributionHistory";

// Form schema for fundraiser contributions
const fundraiserFormSchema = z.object({
  amount: z.string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)), "Amount must be a number")
    .refine((val) => parseFloat(val) >= 5, "Minimum contribution is $5"),
  currency: z.string().min(1, "Please select a currency"),
  tx_hash: z.string().min(10, "Please enter a valid transaction hash")
});

type FundraiserFormValues = z.infer<typeof fundraiserFormSchema>;

const SUPPORTED_CURRENCIES = [
  { value: "USDT", label: "USDT (Tron)" },
  { value: "USDT_ETH", label: "USDT (Ethereum)" },
  { value: "ETH", label: "Ethereum (ETH)" },
  { value: "BNB", label: "BNB (BSC)" }
];

const FundraisersPage = () => {
  const { toast } = useToast();
  const { connected, account } = useBork();
  const [isLoading, setIsLoading] = useState(false);
  const [totalRaised, setTotalRaised] = useState(0);
  const [targetAmount] = useState(100000); // $100K target
  const [userContributions, setUserContributions] = useState<Contribution[]>([]);
  const [currentBadge, setCurrentBadge] = useState(BADGE_TIERS[0]);
  const [activeTab, setActiveTab] = useState("badges");
  
  const WALLET_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
  
  const form = useForm<FundraiserFormValues>({
    resolver: zodResolver(fundraiserFormSchema),
    defaultValues: {
      amount: "",
      currency: "",
      tx_hash: ""
    }
  });

  // Fetch total raised amount and user contributions
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch total raised
        const { data: totalData, error: totalError } = await supabase
          .from('presale_contributions')
          .select('amount')
          .eq('approved', true);
          
        if (totalError) throw totalError;
        
        const total = totalData.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0);
        setTotalRaised(total);
        
        // Fetch user contributions if connected
        if (connected && account) {
          const { data: userData, error: userError } = await supabase
            .from('presale_contributions')
            .select('*')
            .eq('wallet_address', account)
            .order('created_at', { ascending: false });
            
          if (userError) throw userError;
          
          if (userData && userData.length > 0) {
            setUserContributions(userData as Contribution[]);
            
            // Calculate total user contribution
            const totalUserAmount = userData.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0);
            const badge = getBadgeTierByAmount(totalUserAmount);
            setCurrentBadge(badge);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    
    // Set up real-time subscription for updates
    const channel = supabase
      .channel('fundraisers-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'presale_contributions'
      }, () => {
        fetchData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [connected, account]);

  const onSubmit = async (values: FundraiserFormValues) => {
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
        .from('presale_contributions')
        .insert({
          wallet_address: account,
          amount: parseFloat(values.amount),
          currency: values.currency,
          tx_hash: values.tx_hash,
        });

      if (error) throw error;
      
      toast({
        title: "Contribution submitted!",
        description: "Your contribution will be reviewed and approved shortly",
      });
      
      form.reset();
      setActiveTab("dashboard");
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

  // Calculate progress percentage
  const progressPercent = Math.min(100, (totalRaised / targetAmount) * 100);

  return (
    <div className="container mx-auto px-4 py-24 md:py-32">
      {/* Hero section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
          <span className="text-white">$BORK</span> <span className="text-bork-green neon-text">Fundraisers</span>
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-white">
          Become an early backer of BorkChain to receive exclusive badges and increased chances for a bigger airdrop. 
          Minimum contribution is just $5 USDT or equivalent.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-16">
        <Card className="bg-black/60 border border-bork-green/50">
          <CardHeader className="text-center">
            <CardTitle className="text-xl md:text-2xl text-white">
              Fundraising Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-400">
                Raised so far
              </span>
              <span className="font-bold text-bork-green">
                ${totalRaised.toLocaleString()} / ${targetAmount.toLocaleString()}
              </span>
            </div>
            <div className="h-4 w-full bg-gray-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-bork-green rounded-full transition-all duration-1000 ease-in-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="mt-2 text-right">
              <span className="text-sm text-gray-400">
                {progressPercent.toFixed(1)}% Complete
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="badges" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-8">
            <TabsTrigger value="badges" className="text-white">
              <Trophy className="w-4 h-4 mr-2" /> Badge Tiers
            </TabsTrigger>
            <TabsTrigger value="contribute" className="text-white">
              <ArrowDown className="w-4 h-4 mr-2" /> Contribute
            </TabsTrigger>
            {connected && (
              <TabsTrigger value="dashboard" className="text-white">
                <History className="w-4 h-4 mr-2" /> Your Contributions
              </TabsTrigger>
            )}
          </TabsList>

          {/* Badge Tiers */}
          <TabsContent value="badges">
            <Card className="bg-black/60 border border-bork-green/50 mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-bork-green" /> Badge Tiers & Benefits
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Contribute to BorkChain and earn exclusive badges with special benefits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {BADGE_TIERS.map((tier) => (
                    <FundraiserBadge 
                      key={tier.id} 
                      tier={tier} 
                      showBenefits={true}
                      className="bg-black/40 border-bork-green/30 hover:border-bork-green/80"
                    />
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  onClick={() => setActiveTab("contribute")}
                  className="w-full sm:w-auto"
                >
                  Make a Contribution
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Contribute */}
          <TabsContent value="contribute">
            {!connected ? (
              <div className="text-center py-12">
                <h2 className="text-xl md:text-2xl mb-4 text-white">Connect your wallet to participate</h2>
                <p className="mb-6 text-gray-400">You need to connect your wallet first to make a contribution.</p>
              </div>
            ) : (
              <Card className="bg-black/60 border border-bork-green/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <PiggyBank className="h-6 w-6 text-bork-green" />
                    Make a Contribution
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Support BorkChain and secure your badge
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="payment" className="w-full mb-6">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="payment">Send Payment</TabsTrigger>
                      <TabsTrigger value="form">Submit Transaction</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="payment">
                      <div className="space-y-6">
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-semibold text-white mb-2">Contribute with Crypto</h3>
                          <p className="text-gray-400 text-sm">Send your contribution to the wallet address below</p>
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
                            <Coins className="h-4 w-4 text-bork-green" /> 
                            Important Instructions
                          </h4>
                          <ul className="list-disc list-inside space-y-2 text-gray-400 text-sm">
                            <li>Minimum contribution is $5 USDT or equivalent</li>
                            <li>Supported currencies: USDT (TRC20/ERC20), ETH, BNB</li>
                            <li>After sending, copy your transaction hash</li>
                            <li>Submit your contribution details in the "Submit Transaction" tab</li>
                          </ul>
                        </div>
                        
                        <Button 
                          onClick={() => document.querySelector('[data-value="form"]')?.dispatchEvent(new Event('click'))}
                          className="w-full"
                        >
                          Go to Submission Form
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="form">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Amount ($)</FormLabel>
                                <FormControl>
                                  <Input placeholder="5.00" {...field} />
                                </FormControl>
                                <FormDescription className="text-gray-400">
                                  Minimum contribution: $5 USD equivalent
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Currency</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a currency" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {SUPPORTED_CURRENCIES.map((currency) => (
                                      <SelectItem key={currency.value} value={currency.value}>
                                        {currency.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="tx_hash"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Transaction Hash</FormLabel>
                                <FormControl>
                                  <Input placeholder="0x..." {...field} />
                                </FormControl>
                                <FormDescription className="text-gray-400">
                                  The transaction hash/ID of your payment
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full mt-6"
                            disabled={isLoading}
                          >
                            {isLoading ? "Submitting..." : "Submit Contribution"}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* User Dashboard */}
          {connected && (
            <TabsContent value="dashboard">
              <div className="space-y-8">
                {/* User current badge */}
                <Card className="bg-black/60 border border-bork-green/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-bork-green" /> Your Badge
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    {userContributions.length > 0 ? (
                      <div className="text-center">
                        <div className="inline-block p-6 rounded-full bg-black/60 border border-bork-green/40 mb-4">
                          {currentBadge.icon}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{currentBadge.name}</h3>
                        <p className="text-gray-400 mb-4">
                          Total Contributed: ${userContributions.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0).toLocaleString()}
                        </p>
                        <Button 
                          variant={currentBadge.badgeVariant} 
                          className="animate-pulse"
                          onClick={() => setActiveTab("contribute")}
                        >
                          Upgrade Badge
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-400 mb-4">You haven't made any contributions yet.</p>
                        <Button onClick={() => setActiveTab("contribute")}>Make First Contribution</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Contribution history */}
                <Card className="bg-black/60 border border-bork-green/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <History className="h-5 w-5 text-bork-green" /> Your Contribution History
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      View your previous contributions to BorkChain
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ContributionHistory 
                      contributions={userContributions} 
                      userWallet={account}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("contribute")}
                    >
                      Make Another Contribution
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default FundraisersPage;
