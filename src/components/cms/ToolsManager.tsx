import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Calculator,
  Plus, 
  Edit, 
  Archive,
  Crown,
  Users,
  Code,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FinancialTool {
  id: string;
  name: string;
  description: string;
  tool_type: string;
  tool_config: any;
  ui_component: string;
  is_premium: boolean;
  is_active: boolean;
  access_level: string;
  category: string;
  price: number;
  free_limit: number;
  tags: string[];
}

interface ToolsManagerProps {
  searchTerm: string;
  category: string;
}

export const ToolsManager = ({ searchTerm, category }: ToolsManagerProps) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [tools, setTools] = useState<FinancialTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<FinancialTool | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tool_type: 'calculator',
    ui_component: '',
    tool_config: '{}',
    is_premium: false,
    access_level: 'free',
    category: 'free',
    price: 0,
    free_limit: 5,
    tags: '',
    is_active: true
  });

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_tools')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error('Error fetching financial tools:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch financial tools',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let toolConfig;
      try {
        toolConfig = JSON.parse(formData.tool_config);
      } catch {
        toolConfig = {};
      }

      const toolData = {
        ...formData,
        tool_config: toolConfig,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        price: Math.round(formData.price * 100), // Convert rupees to paisa
        access_level: formData.category === 'paid' ? 'premium' : 'free'
      };

      if (editingTool) {
        const { error } = await supabase
          .from('financial_tools')
          .update(toolData)
          .eq('id', editingTool.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Financial tool updated successfully'
        });
      } else {
        const { error } = await supabase
          .from('financial_tools')
          .insert([toolData]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Financial tool created successfully'
        });
      }

      setFormData({
        name: '',
        description: '',
        tool_type: 'calculator',
        ui_component: '',
        tool_config: '{}',
        is_premium: false,
        access_level: 'free',
        category: 'free',
        price: 0,
        free_limit: 5,
        tags: '',
        is_active: true
      });
      setEditingTool(null);
      setIsCreateDialogOpen(false);
      fetchTools();
    } catch (error) {
      console.error('Error saving financial tool:', error);
      toast({
        title: 'Error',
        description: 'Failed to save financial tool',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (tool: FinancialTool) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      description: tool.description || '',
      tool_type: tool.tool_type,
      ui_component: tool.ui_component || '',
      tool_config: JSON.stringify(tool.tool_config, null, 2),
      is_premium: tool.is_premium,
      access_level: tool.access_level,
      category: tool.category || 'free',
      price: (tool.price || 0) / 100, // Convert paisa to rupees
      free_limit: tool.free_limit || 5,
      tags: tool.tags.join(', '),
      is_active: tool.is_active
    });
    setIsCreateDialogOpen(true);
  };

  const toggleActive = async (tool: FinancialTool) => {
    try {
      const { error } = await supabase
        .from('financial_tools')
        .update({ is_active: !tool.is_active })
        .eq('id', tool.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Tool ${!tool.is_active ? 'activated' : 'deactivated'}`
      });

      fetchTools();
    } catch (error) {
      console.error('Error toggling tool status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update tool status',
        variant: 'destructive'
      });
    }
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = category === 'all' || tool.tool_type === category;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading financial tools...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Financial Tools</h2>
          <p className="text-sm text-muted-foreground">
            Manage calculators, planners, and tracking tools
          </p>
        </div>
        {userProfile?.role === 'ADMIN' && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Tool
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTool ? 'Edit Financial Tool' : 'Create New Financial Tool'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tool_type">Tool Type</Label>
                    <Select value={formData.tool_type} onValueChange={(value) => setFormData({...formData, tool_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="calculator">Calculator</SelectItem>
                        <SelectItem value="planner">Planner</SelectItem>
                        <SelectItem value="tracker">Tracker</SelectItem>
                        <SelectItem value="analyzer">Analyzer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.category === 'paid' && (
                    <div>
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  )}

                  {formData.category === 'free' && (
                    <div>
                      <Label htmlFor="free_limit">Free Usage Limit</Label>
                      <Input
                        id="free_limit"
                        type="number"
                        min="0"
                        value={formData.free_limit}
                        onChange={(e) => setFormData({...formData, free_limit: parseInt(e.target.value) || 5})}
                      />
                    </div>
                  )}

                  <div className="col-span-2">
                    <Label htmlFor="ui_component">UI Component</Label>
                    <Input
                      id="ui_component"
                      value={formData.ui_component}
                      onChange={(e) => setFormData({...formData, ui_component: e.target.value})}
                      placeholder="EMICalculator, SIPCalculator, etc."
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="tool_config">Tool Configuration (JSON)</Label>
                    <Textarea
                      id="tool_config"
                      value={formData.tool_config}
                      onChange={(e) => setFormData({...formData, tool_config: e.target.value})}
                      rows={4}
                      className="font-mono text-sm"
                      placeholder='{"default_rate": 12, "min_amount": 1000}'
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      placeholder="emi, calculator, loan"
                    />
                  </div>

                  <div className="col-span-2 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_premium"
                        checked={formData.is_premium}
                        onCheckedChange={(checked) => setFormData({...formData, is_premium: checked})}
                      />
                      <Label htmlFor="is_premium">Premium Tool</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setEditingTool(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingTool ? 'Update' : 'Create'} Tool
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <Card key={tool.id} className={`${!tool.is_active ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    {tool.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{tool.tool_type}</Badge>
                    <Badge 
                      variant={tool.category === 'free' ? 'secondary' : 'default'}
                      className={tool.category === 'paid' ? 'bg-yellow-100 text-yellow-800' : ''}
                    >
                      {tool.category === 'paid' && <Crown className="h-3 w-3 mr-1" />}
                      {tool.category}
                      {tool.category === 'paid' && tool.price && ` - ₹${(tool.price / 100).toFixed(2)}`}
                    </Badge>
                    {!tool.is_active && (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {tool.description}
              </p>
              
              {tool.ui_component && (
                <div className="flex items-center gap-1 text-sm">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-xs">{tool.ui_component}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {tool.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {tool.tags.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{tool.tags.length - 4}
                  </Badge>
                )}
              </div>

              {userProfile?.role === 'ADMIN' && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(tool)}
                    className="flex-1 gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant={tool.is_active ? "destructive" : "default"}
                    onClick={() => toggleActive(tool)}
                    className="flex-1 gap-1"
                  >
                    <Archive className="h-3 w-3" />
                    {tool.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-8">
          <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No financial tools found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || category !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Financial tools help users with calculations and planning'
            }
          </p>
          {userProfile?.role === 'ADMIN' && (
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Tool
            </Button>
          )}
        </div>
      )}
    </div>
  );
};