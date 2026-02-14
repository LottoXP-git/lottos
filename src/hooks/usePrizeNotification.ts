import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { LotteryResult } from "@/data/lotteryData";

// Thresholds per lottery for mega prize notification
const PRIZE_THRESHOLDS: Record<string, number> = {
  megasena: 40000000,       // R$ 40 milhões
  maismilionaria: 20000000, // R$ 20 milhões
  lotofacil: 5000000,       // R$ 5 milhões
  quina: 10000000,          // R$ 10 milhões
  lotomania: 5000000,       // R$ 5 milhões
  timemania: 5000000,       // R$ 5 milhões
  duplasena: 3000000,       // R$ 3 milhões
  diadesorte: 2000000,      // R$ 2 milhões
  supersete: 2000000,       // R$ 2 milhões
};
const DEFAULT_THRESHOLD = 50000000;

// Parse prize value from string like "R$ 42.350.000,00"
function parsePrizeValue(prize: string): number {
  const cleaned = prize.replace(/[R$\s.]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

// Create a pleasant notification chime using Web Audio API
function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a pleasant chime sound (3 ascending notes)
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (major chord)
    
    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      const startTime = audioContext.currentTime + (index * 0.15);
      const endTime = startTime + 0.3;
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);
      
      oscillator.start(startTime);
      oscillator.stop(endTime);
    });

    // Add a final "sparkle" sound
    setTimeout(() => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1046.5; // C6 (high octave)
      oscillator.type = 'sine';
      
      const startTime = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.5);
    }, 500);

  } catch (error) {
    console.log("Audio notification not supported:", error);
  }
}

export function usePrizeNotification(results: LotteryResult[] | undefined) {
  const { toast } = useToast();
  const hasNotifiedRef = useRef(false);
  const previousResultsRef = useRef<string>("");

  useEffect(() => {
    if (!results || results.length === 0) return;

    // Create a key based on current results to detect changes
    const resultsKey = results.map(r => `${r.id}-${r.nextPrize}`).join("|");
    
    // Only notify on new data, not on every render
    if (resultsKey === previousResultsRef.current) return;
    previousResultsRef.current = resultsKey;

    // Find lotteries with mega prizes
    const megaPrizeLotteries = results.filter(lottery => {
      const prizeValue = parsePrizeValue(lottery.nextPrize);
      const threshold = PRIZE_THRESHOLDS[lottery.id] || DEFAULT_THRESHOLD;
      return prizeValue >= threshold;
    });

    if (megaPrizeLotteries.length > 0 && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true;

      // Play notification sound
      playNotificationSound();

      // Show toast notification for each mega prize lottery
      megaPrizeLotteries.forEach((lottery, index) => {
        setTimeout(() => {
          toast({
            title: `🎰 ${lottery.name} - MEGA PRÊMIO!`,
            description: `O próximo sorteio tem prêmio estimado de ${lottery.nextPrize}! Não perca essa oportunidade!`,
            duration: 8000,
          });
        }, index * 1500); // Stagger notifications
      });
    }
  }, [results, toast]);

  // Reset notification flag when results change significantly
  useEffect(() => {
    const timeout = setTimeout(() => {
      hasNotifiedRef.current = false;
    }, 60000); // Reset after 1 minute

    return () => clearTimeout(timeout);
  }, [results]);
}
