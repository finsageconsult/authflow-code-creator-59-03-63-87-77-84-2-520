import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const RazorpayTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testRazorpayKeys = async () => {
    setTesting(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('test-razorpay');
      
      if (error) {
        setResult({
          success: false,
          error: error.message,
          type: 'function_error'
        });
      } else {
        setResult({
          success: data.success || false,
          ...data
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        type: 'network_error'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔑 Razorpay API Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testRazorpayKeys}
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Testing...
            </>
          ) : (
            'Test Razorpay Keys'
          )}
        </Button>

        {result && (
          <div className={`p-4 rounded-lg border ${
            result.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.success ? 'API Keys Valid!' : 'API Test Failed'}
                </p>
                
                {result.message && (
                  <p className="text-sm mt-1 text-gray-600">
                    {result.message}
                  </p>
                )}
                
                {result.error && (
                  <p className="text-sm mt-1 text-red-600">
                    Error: {result.error}
                  </p>
                )}
                
                {result.details && (
                  <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                )}

                {result.testOrder && (
                  <div className="text-sm mt-2 text-green-700">
                    ✅ Test order created: {result.testOrder.id}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};