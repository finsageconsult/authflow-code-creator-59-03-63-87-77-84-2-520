import { HRCreditAllocation } from '@/components/credits/HRCreditAllocation';

export const HRCredits = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Credits Management</h1>
      <HRCreditAllocation />
    </div>
  );
};