import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, History, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useCredits } from '@/hooks/useCredits';
import { ExtraCreditPurchase } from '@/components/employee/ExtraCreditPurchase';

export const CreditWallet = () => {
  const { userWallets, userTransactions, loadingUserWallets, loadingTransactions, getBalance } = useCredits();

  if (loadingUserWallets) {
    return <div>Loading credit information...</div>;
  }

  const session1on1Balance = getBalance('SESSION_1_1');
  const webinarBalance = getBalance('WEBINAR');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="balance" className="w-full">
        <TabsList>
          <TabsTrigger value="balance">My Credits</TabsTrigger>
          <TabsTrigger value="purchase">Buy Extra</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
          <TabsTrigger value="expiry">Expiry Information</TabsTrigger>
        </TabsList>

        <TabsContent value="balance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">1-on-1 Sessions</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{session1on1Balance}</div>
                <p className="text-xs text-muted-foreground">Available credits</p>
                {session1on1Balance <= 0 && (
                  <Badge variant="destructive" className="mt-2">
                    No Credits Left
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Webinars</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{webinarBalance}</div>
                <p className="text-xs text-muted-foreground">Available credits</p>
                {webinarBalance <= 0 && (
                  <Badge variant="destructive" className="mt-2">
                    No Credits Left
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="purchase" className="space-y-4">
          <ExtraCreditPurchase 
            session1on1Balance={session1on1Balance}
            webinarBalance={webinarBalance}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <div>Loading transactions...</div>
              ) : userTransactions?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userTransactions.slice(0, 10).map((transaction) => {
                      const wallet = userWallets?.find(w => w.id === transaction.wallet_id);
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {format(new Date(transaction.created_at), 'PPp')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={transaction.delta > 0 ? "default" : "secondary"}>
                              {transaction.delta > 0 ? '+' : ''}{transaction.delta}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {wallet?.credit_type === 'SESSION_1_1' ? '1-on-1' : 'Webinar'}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {transaction.reason}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No transactions found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiry" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Credit Expiry Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userWallets?.length ? (
                <div className="space-y-4">
                  {userWallets.map((wallet) => (
                    <div key={wallet.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {wallet.credit_type === 'SESSION_1_1' ? '1-on-1 Sessions' : 'Webinars'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Balance: {wallet.balance} credits
                        </div>
                      </div>
                      <div className="text-right">
                        {wallet.expires_at ? (
                          <div className="text-sm">
                            Expires: {format(new Date(wallet.expires_at), 'PPP')}
                          </div>
                        ) : (
                          <Badge variant="outline">No Expiry</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No credit wallets found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};