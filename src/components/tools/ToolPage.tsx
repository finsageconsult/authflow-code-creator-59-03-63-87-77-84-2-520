import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calculator, TrendingUp, Target, BarChart3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ToolPageProps {
  toolId?: string;
}

const getToolIcon = (toolType: string) => {
  switch (toolType) {
    case 'calculator': return Calculator;
    case 'planner': return Target;
    case 'tracker': return BarChart3;
    case 'analyzer': return TrendingUp;
    default: return Calculator;
  }
};

// Individual tool components
const BudgetPlannerTool = () => {
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('20');
  const [result, setResult] = useState<any>(null);

  const calculateBudget = () => {
    const monthlyIncome = parseFloat(income);
    const monthlyExpenses = parseFloat(expenses);
    const savingsPercent = parseFloat(savingsGoal);
    
    if (monthlyIncome && monthlyExpenses && savingsPercent) {
      const targetSavings = (monthlyIncome * savingsPercent) / 100;
      const availableForExpenses = monthlyIncome - targetSavings;
      const surplus = availableForExpenses - monthlyExpenses;
      
      setResult({
        targetSavings,
        availableForExpenses,
        surplus,
        status: surplus >= 0 ? 'healthy' : 'over-budget'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="income">Monthly Income (₹)</Label>
          <Input
            id="income"
            type="number"
            placeholder="Enter your monthly income"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expenses">Monthly Expenses (₹)</Label>
          <Input
            id="expenses"
            type="number"
            placeholder="Enter your monthly expenses"
            value={expenses}
            onChange={(e) => setExpenses(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="savings">Savings Goal (%)</Label>
          <Input
            id="savings"
            type="number"
            placeholder="20"
            value={savingsGoal}
            onChange={(e) => setSavingsGoal(e.target.value)}
          />
        </div>
      </div>
      
      <Button onClick={calculateBudget} className="w-full" size="lg">
        Calculate Budget
      </Button>

      {result && (
        <Card className={`border-2 ${result.status === 'healthy' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardHeader>
            <CardTitle className={result.status === 'healthy' ? 'text-green-700' : 'text-red-700'}>
              Budget Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Target Savings:</span>
              <span className="font-medium">₹{result.targetSavings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Available for Expenses:</span>
              <span className="font-medium">₹{result.availableForExpenses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>{result.surplus >= 0 ? 'Surplus' : 'Over Budget'}:</span>
              <span className={`font-medium ${result.surplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{Math.abs(result.surplus).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const SIPCalculatorTool = () => {
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [years, setYears] = useState('');
  const [returnRate, setReturnRate] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculateSIP = () => {
    const P = parseFloat(monthlyAmount);
    const r = parseFloat(returnRate) / 100 / 12; // Monthly rate
    const n = parseFloat(years) * 12; // Total months
    
    if (P && r && n) {
      const maturityAmount = P * (((Math.pow(1 + r, n)) - 1) / r) * (1 + r);
      const totalInvestment = P * n;
      const totalReturns = maturityAmount - totalInvestment;
      
      setResult({
        maturityAmount,
        totalInvestment,
        totalReturns
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="sipAmount">Monthly SIP Amount (₹)</Label>
          <Input
            id="sipAmount"
            type="number"
            placeholder="5000"
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="period">Investment Period (Years)</Label>
          <Input
            id="period"
            type="number"
            placeholder="10"
            value={years}
            onChange={(e) => setYears(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="return">Expected Return Rate (%)</Label>
          <Input
            id="return"
            type="number"
            placeholder="12"
            value={returnRate}
            onChange={(e) => setReturnRate(e.target.value)}
          />
        </div>
      </div>
      
      <Button onClick={calculateSIP} className="w-full" size="lg">
        Calculate Returns
      </Button>

      {result && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-700">SIP Projection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Total Investment:</span>
              <span className="font-medium">₹{result.totalInvestment.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Returns:</span>
              <span className="font-medium text-green-600">₹{result.totalReturns.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Maturity Amount:</span>
              <span className="text-green-700">₹{result.maturityAmount.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const EMICalculatorTool = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculateEMI = () => {
    const P = parseFloat(loanAmount);
    const r = parseFloat(interestRate) / 100 / 12; // Monthly rate
    const n = parseFloat(tenure) * 12; // Total months
    
    if (P && r && n) {
      const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalAmount = emi * n;
      const totalInterest = totalAmount - P;
      
      setResult({
        emi,
        totalAmount,
        totalInterest
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="loan">Loan Amount (₹)</Label>
          <Input
            id="loan"
            type="number"
            placeholder="1000000"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rate">Interest Rate (% p.a.)</Label>
          <Input
            id="rate"
            type="number"
            placeholder="8.5"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tenure">Loan Tenure (Years)</Label>
          <Input
            id="tenure"
            type="number"
            placeholder="20"
            value={tenure}
            onChange={(e) => setTenure(e.target.value)}
          />
        </div>
      </div>
      
      <Button onClick={calculateEMI} className="w-full" size="lg">
        Calculate EMI
      </Button>

      {result && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-700">EMI Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-lg font-semibold">
              <span>Monthly EMI:</span>
              <span className="text-blue-700">₹{result.emi.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Interest:</span>
              <span className="font-medium text-red-600">₹{result.totalInterest.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span className="font-medium">₹{result.totalAmount.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const RetirementCalculatorTool = () => {
  const [currentAge, setCurrentAge] = useState('');
  const [retirementAge, setRetirementAge] = useState('');
  const [currentSavings, setCurrentSavings] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('10');
  const [result, setResult] = useState<any>(null);

  const calculateRetirement = () => {
    const currentAgeNum = parseFloat(currentAge);
    const retirementAgeNum = parseFloat(retirementAge);
    const currentSavingsNum = parseFloat(currentSavings);
    const monthlyContributionNum = parseFloat(monthlyContribution);
    const returnRate = parseFloat(expectedReturn) / 100;
    
    if (currentAgeNum && retirementAgeNum && currentSavingsNum >= 0 && monthlyContributionNum && returnRate) {
      const yearsToRetirement = retirementAgeNum - currentAgeNum;
      const monthsToRetirement = yearsToRetirement * 12;
      const monthlyReturnRate = returnRate / 12;
      
      // Future value of current savings
      const futureValueCurrent = currentSavingsNum * Math.pow(1 + returnRate, yearsToRetirement);
      
      // Future value of monthly contributions
      const futureValueContributions = monthlyContributionNum * 
        (((Math.pow(1 + monthlyReturnRate, monthsToRetirement)) - 1) / monthlyReturnRate);
      
      const totalCorpus = futureValueCurrent + futureValueContributions;
      const totalContributions = currentSavingsNum + (monthlyContributionNum * monthsToRetirement);
      const totalReturns = totalCorpus - totalContributions;
      
      setResult({
        totalCorpus,
        totalContributions,
        totalReturns,
        yearsToRetirement
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="currentAge">Current Age</Label>
          <Input
            id="currentAge"
            type="number"
            placeholder="30"
            value={currentAge}
            onChange={(e) => setCurrentAge(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="retirementAge">Retirement Age</Label>
          <Input
            id="retirementAge"
            type="number"
            placeholder="60"
            value={retirementAge}
            onChange={(e) => setRetirementAge(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentSavings">Current Savings (₹)</Label>
          <Input
            id="currentSavings"
            type="number"
            placeholder="500000"
            value={currentSavings}
            onChange={(e) => setCurrentSavings(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthlyContribution">Monthly Contribution (₹)</Label>
          <Input
            id="monthlyContribution"
            type="number"
            placeholder="10000"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expectedReturn">Expected Annual Return (%)</Label>
          <Input
            id="expectedReturn"
            type="number"
            placeholder="10"
            value={expectedReturn}
            onChange={(e) => setExpectedReturn(e.target.value)}
          />
        </div>
      </div>
      
      <Button onClick={calculateRetirement} className="w-full" size="lg">
        Calculate Retirement Corpus
      </Button>

      {result && (
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-700">Retirement Projection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Years to Retirement:</span>
              <span className="font-medium">{result.yearsToRetirement} years</span>
            </div>
            <div className="flex justify-between">
              <span>Total Contributions:</span>
              <span className="font-medium">₹{result.totalContributions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Returns:</span>
              <span className="font-medium text-green-600">₹{result.totalReturns.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Retirement Corpus:</span>
              <span className="text-orange-700">₹{result.totalCorpus.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const PortfolioTrackerTool = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Portfolio Tracker</h3>
        <p className="text-muted-foreground mb-4">Track your investment portfolio performance</p>
        <p className="text-sm text-muted-foreground">Full portfolio tracking feature coming soon...</p>
      </div>
      
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Stocks</span>
              <span className="text-green-600">+12.5%</span>
            </div>
            <div className="text-sm text-muted-foreground">₹2,50,000</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Mutual Funds</span>
              <span className="text-green-600">+8.2%</span>
            </div>
            <div className="text-sm text-muted-foreground">₹1,50,000</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Bonds</span>
              <span className="text-green-600">+6.1%</span>
            </div>
            <div className="text-sm text-muted-foreground">₹1,00,000</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const TaxCalculatorTool = () => {
  const [income, setIncome] = useState('');
  const [regime, setRegime] = useState('old');
  const [deductions, setDeductions] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculateTax = () => {
    const annualIncome = parseFloat(income);
    const deductionAmount = parseFloat(deductions) || 0;
    
    if (annualIncome) {
      let taxableIncome = annualIncome;
      let tax = 0;
      
      if (regime === 'old') {
        taxableIncome = annualIncome - deductionAmount - 50000; // Standard deduction
        
        if (taxableIncome <= 250000) tax = 0;
        else if (taxableIncome <= 500000) tax = (taxableIncome - 250000) * 0.05;
        else if (taxableIncome <= 1000000) tax = 12500 + (taxableIncome - 500000) * 0.20;
        else tax = 12500 + 100000 + (taxableIncome - 1000000) * 0.30;
      } else {
        // New regime
        if (taxableIncome <= 300000) tax = 0;
        else if (taxableIncome <= 600000) tax = (taxableIncome - 300000) * 0.05;
        else if (taxableIncome <= 900000) tax = 15000 + (taxableIncome - 600000) * 0.10;
        else if (taxableIncome <= 1200000) tax = 15000 + 30000 + (taxableIncome - 900000) * 0.15;
        else if (taxableIncome <= 1500000) tax = 15000 + 30000 + 45000 + (taxableIncome - 1200000) * 0.20;
        else tax = 15000 + 30000 + 45000 + 60000 + (taxableIncome - 1500000) * 0.30;
      }
      
      const cess = tax * 0.04; // 4% health and education cess
      const totalTax = tax + cess;
      const netIncome = annualIncome - totalTax;
      
      setResult({
        taxableIncome,
        tax,
        cess,
        totalTax,
        netIncome
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="annualIncome">Annual Income (₹)</Label>
          <Input
            id="annualIncome"
            type="number"
            placeholder="1200000"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="taxRegime">Tax Regime</Label>
          <Select value={regime} onValueChange={setRegime}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="old">Old Tax Regime</SelectItem>
              <SelectItem value="new">New Tax Regime</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {regime === 'old' && (
          <div className="space-y-2">
            <Label htmlFor="deductions">80C Deductions (₹)</Label>
            <Input
              id="deductions"
              type="number"
              placeholder="150000"
              value={deductions}
              onChange={(e) => setDeductions(e.target.value)}
            />
          </div>
        )}
      </div>
      
      <Button onClick={calculateTax} className="w-full" size="lg">
        Calculate Tax
      </Button>

      {result && (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Tax Calculation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Taxable Income:</span>
              <span className="font-medium">₹{result.taxableIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Income Tax:</span>
              <span className="font-medium text-red-600">₹{result.tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Health & Education Cess:</span>
              <span className="font-medium text-red-600">₹{result.cess.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Tax:</span>
              <span className="text-red-700">₹{result.totalTax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Net Income:</span>
              <span className="text-green-700">₹{result.netIncome.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Tool component mapping
const toolComponents: Record<string, React.ComponentType> = {
  'BudgetPlanner': BudgetPlannerTool,
  'SIPCalculator': SIPCalculatorTool,
  'EMICalculator': EMICalculatorTool,
  'RetirementCalculator': RetirementCalculatorTool,
  'PortfolioTracker': PortfolioTrackerTool,
  'TaxCalculator': TaxCalculatorTool,
};

const toolInfo: Record<string, { name: string; description: string; type: string }> = {
  'BudgetPlanner': { name: 'Budget Planner', description: 'Plan your monthly budget and track savings goals', type: 'planner' },
  'SIPCalculator': { name: 'SIP Calculator', description: 'Calculate Systematic Investment Plan returns', type: 'calculator' },
  'EMICalculator': { name: 'EMI Calculator', description: 'Calculate loan EMI and total interest', type: 'calculator' },
  'RetirementCalculator': { name: 'Retirement Calculator', description: 'Plan your retirement corpus', type: 'planner' },
  'PortfolioTracker': { name: 'Portfolio Tracker', description: 'Track your investment portfolio', type: 'tracker' },
  'TaxCalculator': { name: 'Tax Calculator', description: 'Calculate income tax liability', type: 'calculator' },
};

export const ToolPage: React.FC<ToolPageProps> = ({ toolId }) => {
  const navigate = useNavigate();
  const params = useParams();
  const currentToolId = toolId || params.toolId || '';
  
  const tool = toolInfo[currentToolId];
  const ToolComponent = toolComponents[currentToolId];
  
  if (!tool || !ToolComponent) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/tools')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Button>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Tool Not Found</h1>
            <p className="text-muted-foreground">The requested tool could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = getToolIcon(tool.type);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/tools')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tools
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <IconComponent className="h-6 w-6" />
              {tool.name}
            </CardTitle>
            <p className="text-muted-foreground">{tool.description}</p>
          </CardHeader>
          <CardContent>
            <ToolComponent />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};