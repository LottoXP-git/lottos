 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { LotteryResult } from "@/data/lotteryData";
 
 interface LotteryApiResponse {
   results?: LotteryResult[];
   result?: LotteryResult;
   error?: string;
 }
 
 async function fetchLotteryResults(): Promise<LotteryResult[]> {
   const { data, error } = await supabase.functions.invoke<LotteryApiResponse>(
     "fetch-lottery-results",
     { body: {} }
   );
 
   if (error) {
     console.error("Error fetching lottery results:", error);
     throw new Error(error.message);
   }
 
   if (data?.error) {
     throw new Error(data.error);
   }
 
   return data?.results || [];
 }
 
 async function fetchLotteryHistory(
   lotteryId: string,
   count: number = 100
 ): Promise<LotteryResult[]> {
   const { data, error } = await supabase.functions.invoke<LotteryApiResponse>(
     "fetch-lottery-results",
     {
       body: {},
       headers: {},
     }
   );
 
   // Use URL params via query string approach
   const response = await fetch(
     `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-lottery-results?lottery=${lotteryId}&mode=history&count=${count}`,
     {
       headers: {
         Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
         "Content-Type": "application/json",
       },
     }
   );
 
   if (!response.ok) {
     throw new Error(`Failed to fetch history: ${response.statusText}`);
   }
 
   const responseData = await response.json();
   return responseData?.results || [];
 }
 
 export function useLotteryResults() {
   return useQuery({
     queryKey: ["lottery-results"],
     queryFn: fetchLotteryResults,
     staleTime: 1000 * 60 * 5, // 5 minutes
     refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
   });
 }
 
 export function useLotteryHistory(lotteryId: string, count: number = 100) {
   return useQuery({
     queryKey: ["lottery-history", lotteryId, count],
     queryFn: () => fetchLotteryHistory(lotteryId, count),
     staleTime: 1000 * 60 * 30, // 30 minutes
     enabled: !!lotteryId,
   });
 }