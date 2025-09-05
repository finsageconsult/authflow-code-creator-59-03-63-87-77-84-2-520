import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FinancialTool } from '@/types/financial-tools';
import { Calculator, TrendingUp, Target, BarChart3 } from 'lucide-react';

interface ToolLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  tool: FinancialTool;
}

// Simple tool implementations for demo
const BudgetPlanner = () => (
  <div className="space-y-4 p-4">
    <h3 className="text-lg font-semibold">Budget Planner</h3>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Monthly Income</label>
        <input type="number" className="w-full p-2 border rounded" placeholder="Enter amount" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Monthly Expenses</label>
        <input type="number" className="w-full p-2 border rounded" placeholder="Enter amount" />
      </div>
    </div>
    <div className="space-y-2">
      <label className="text-sm font-medium">Savings Goal (%)</label>
      <input type="number" className="w-full p-2 border rounded" placeholder="20" />
    </div>
    <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
      Calculate Budget
    </button>
  </div>
);

const SIPCalculator = () => (
  <div className="space-y-4 p-4">
    <h3 className="text-lg font-semibold">SIP Calculator</h3>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Monthly SIP Amount (₹)</label>
        <input type="number" className="w-full p-2 border rounded" placeholder="5000" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Investment Period (Years)</label>
        <input type="number" className="w-full p-2 border rounded" placeholder="10" />
      </div>
    </div>
    <div className="space-y-2">
      <label className="text-sm font-medium">Expected Return Rate (%)</label>
      <input type="number" className="w-full p-2 border rounded" placeholder="12" />
    </div>
    <button className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
      Calculate Returns
    </button>
  </div>
);

const EMICalculator = () => (
  <div className="space-y-4 p-4">
    <h3 className="text-lg font-semibold">EMI Calculator</h3>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Loan Amount (₹)</label>
        <input type="number" className="w-full p-2 border rounded" placeholder="1000000" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Interest Rate (%)</label>
        <input type="number" className="w-full p-2 border rounded" placeholder="8.5" />
      </div>
    </div>
    <div className="space-y-2">
      <label className="text-sm font-medium">Loan Tenure (Years)</label>
      <input type="number" className="w-full p-2 border rounded" placeholder="20" />
    </div>
    <button className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700">
      Calculate EMI
    </button>
  </div>
);

const RetirementCalculator = () => (
  <div className="space-y-4 p-4">
    <h3 className="text-lg font-semibold">Retirement Calculator</h3>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Current Age</label>
        <input type="number" className="w-full p-2 border rounded" placeholder="30" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Retirement Age</label>
        <input type="number" className="w-full p-2 border rounded" placeholder="60" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Current Savings (₹)</label>
        <input type="number" className="w-full p-2 border rounded" placeholder="500000" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Monthly Contribution (₹)</label>
        <input type="number" className="w-full p-2 border rounded" placeholder="10000" />
      </div>
    </div>
    <button className="w-full bg-orange-600 text-white p-2 rounded hover:bg-orange-700">
      Calculate Retirement Corpus
    </button>
  </div>
);

const PortfolioTracker = () => (
  <div className="space-y-4 p-4">
    <h3 className="text-lg font-semibold">Portfolio Tracker</h3>
    <div className="space-y-3">
      <div className="p-3 border rounded bg-gray-50">
        <div className="flex justify-between items-center">
          <span className="font-medium">Stocks</span>
          <span className="text-green-600">+12.5%</span>
        </div>
        <div className="text-sm text-gray-600">₹2,50,000</div>
      </div>
      <div className="p-3 border rounded bg-gray-50">
        <div className="flex justify-between items-center">
          <span className="font-medium">Mutual Funds</span>
          <span className="text-green-600">+8.2%</span>
        </div>
        <div className="text-sm text-gray-600">₹1,50,000</div>
      </div>
      <div className="p-3 border rounded bg-gray-50">
        <div className="flex justify-between items-center">
          <span className="font-medium">Bonds</span>
          <span className="text-green-600">+6.1%</span>
        </div>
        <div className="text-sm text-gray-600">₹1,00,000</div>
      </div>
    </div>
    <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
      Add Investment
    </button>
  </div>
);

const TaxCalculator = () => (
  <div className="space-y-4 p-4">
    <h3 className="text-lg font-semibold">Tax Calculator</h3>
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="text-sm font-medium">Annual Income (₹)</label>
        <input type="number" className="w-full p-2 border rounded" placeholder="1200000" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Tax Regime</label>
        <select className="w-full p-2 border rounded">
          <option>Old Tax Regime</option>
          <option>New Tax Regime</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">80C Deductions (₹)</label>
        <input type="number" className="w-full p-2 border rounded" placeholder="150000" />
      </div>
    </div>
    <button className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700">
      Calculate Tax
    </button>
  </div>
);

// Tool component mapping
const toolComponents: Record<string, React.ComponentType> = {
  'BudgetPlanner': BudgetPlanner,
  'SIPCalculator': SIPCalculator,
  'EMICalculator': EMICalculator,
  'RetirementCalculator': RetirementCalculator,
  'PortfolioTracker': PortfolioTracker,
  'TaxCalculator': TaxCalculator,
};

const getToolIcon = (toolType: string) => {
  switch (toolType) {
    case 'calculator': return Calculator;
    case 'planner': return Target;
    case 'tracker': return BarChart3;
    case 'analyzer': return TrendingUp;
    default: return Calculator;
  }
};

export const ToolLauncher: React.FC<ToolLauncherProps> = ({ isOpen, onClose, tool }) => {
  const ToolComponent = toolComponents[tool.ui_component] || (() => (
    <div className="p-4 text-center">
      <Calculator className="h-16 w-16 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-semibold mb-2">{tool.name}</h3>
      <p className="text-gray-600 mb-4">{tool.description}</p>
      <p className="text-sm text-gray-500">Tool interface coming soon...</p>
    </div>
  ));

  const IconComponent = getToolIcon(tool.tool_type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconComponent className="h-5 w-5" />
            {tool.name}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <ToolComponent />
        </div>
      </DialogContent>
    </Dialog>
  );
};