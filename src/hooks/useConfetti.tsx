import { useCallback } from 'react';
import confetti from 'canvas-confetti';

export const useConfetti = () => {
  const celebrateSuccess = useCallback((intensity: 'gentle' | 'medium' | 'burst' = 'gentle') => {
    const configs = {
      gentle: {
        particleCount: 50,
        spread: 35,
        origin: { y: 0.7 },
        colors: ['#16a34a', '#22c55e', '#4ade80', '#86efac']
      },
      medium: {
        particleCount: 100,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#dcfce7']
      },
      burst: {
        particleCount: 200,
        spread: 70,
        origin: { y: 0.6 },
        startVelocity: 30,
        colors: ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#dcfce7', '#bbf7d0']
      }
    };

    const config = configs[intensity];
    confetti(config);
  }, []);

  const celebrateFinancialMilestone = useCallback(() => {
    // Special confetti for financial achievements with money-themed colors
    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
      shapes: ['circle', 'square']
    });
  }, []);

  const gentleEncouragement = useCallback(() => {
    // Very subtle confetti for gentle encouragement
    confetti({
      particleCount: 30,
      spread: 25,
      origin: { y: 0.8 },
      colors: ['#86efac', '#bbf7d0', '#dcfce7'],
      gravity: 0.3,
      drift: 0.1
    });
  }, []);

  return {
    celebrateSuccess,
    celebrateFinancialMilestone,
    gentleEncouragement
  };
};