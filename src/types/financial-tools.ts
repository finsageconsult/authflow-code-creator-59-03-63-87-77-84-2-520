export interface FinancialTool {
  id: string;
  name: string;
  description: string;
  tool_type: string;
  tool_config: any;
  ui_component: string;
  is_active: boolean;
  employee_access: string;
  employee_free_limit: number;
  individual_access: string;
  price: number;
  tags: string[];
}