import { HRCreditAllocation } from '@/components/credits/HRCreditAllocation';

export const HRCredits = () => {
  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold">Credits Management</h1>
      <HRCreditAllocation />
    </div>
  );
};