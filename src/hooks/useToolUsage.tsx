import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ToolUsage {
  id: string;
  user_id: string;
  tool_id: string;
  used_count: number;
  last_used_at: string;
  created_at: string;
  updated_at: string;
}

export const useToolUsage = () => {
  const { userProfile } = useAuth();
  const [toolUsages, setToolUsages] = useState<ToolUsage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchToolUsages = async () => {
    if (!userProfile) return;

    try {
      const { data, error } = await supabase
        .from('tool_usage')
        .select('*')
        .eq('user_id', userProfile.id);

      if (error) throw error;
      setToolUsages(data || []);
    } catch (error) {
      console.error('Error fetching tool usage:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToolUsages();
  }, [userProfile]);

  const getUsageCount = (toolId: string) => {
    const usage = toolUsages.find(u => u.tool_id === toolId);
    return usage?.used_count || 0;
  };

  const canUseFreeTool = (toolId: string, freeLimit: number) => {
    const usedCount = getUsageCount(toolId);
    return usedCount < freeLimit;
  };

  const incrementUsage = async (toolId: string) => {
    if (!userProfile) return false;

    try {
      const existingUsage = toolUsages.find(u => u.tool_id === toolId);
      
      if (existingUsage) {
        // Update existing usage
        const { data, error } = await supabase
          .from('tool_usage')
          .update({ 
            used_count: existingUsage.used_count + 1,
            last_used_at: new Date().toISOString()
          })
          .eq('id', existingUsage.id)
          .select()
          .single();

        if (error) throw error;
        
        // Update local state
        setToolUsages(prev => prev.map(u => 
          u.id === existingUsage.id ? data : u
        ));
      } else {
        // Create new usage record
        const { data, error } = await supabase
          .from('tool_usage')
          .insert({
            user_id: userProfile.id,
            tool_id: toolId,
            used_count: 1,
            last_used_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        
        // Update local state
        setToolUsages(prev => [...prev, data]);
      }

      return true;
    } catch (error) {
      console.error('Error incrementing tool usage:', error);
      toast.error('Failed to track tool usage');
      return false;
    }
  };

  return {
    toolUsages,
    loading,
    getUsageCount,
    canUseFreeTool,
    incrementUsage,
    refetch: fetchToolUsages
  };
};