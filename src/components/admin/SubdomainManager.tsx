import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Subdomain {
  subdomain: string;
  directory: string;
}

export const SubdomainManager: React.FC = () => {
  const [subdomain, setSubdomain] = useState('');
  const [domain] = useState('finsage.co');
  const [customFolder, setCustomFolder] = useState(false);
  const { toast } = useToast();

  // Mock data for existing subdomains
  const [subdomains, setSubdomains] = useState<Subdomain[]>([
    {
      subdomain: 'hr.finsage.co',
      directory: '/home/u277147647/domains/finsage.co/public_html/hr'
    },
    {
      subdomain: 'admin.finsage.co',
      directory: '/home/u277147647/domains/finsage.co/public_html/admin'
    },
    {
      subdomain: 'coach.finsage.co',
      directory: '/home/u277147647/domains/finsage.co/public_html/coach'
    }
  ]);

  const handleCreateSubdomain = () => {
    if (!subdomain.trim()) {
      toast({
        title: "Error",
        description: "Please enter a subdomain name",
        variant: "destructive"
      });
      return;
    }

    const newSubdomain: Subdomain = {
      subdomain: `${subdomain}.${domain}`,
      directory: `/home/u277147647/domains/${domain}/public_html/${subdomain}`
    };

    setSubdomains([...subdomains, newSubdomain]);
    setSubdomain('');
    setCustomFolder(false);

    toast({
      title: "Success",
      description: `Subdomain ${subdomain}.${domain} created successfully`,
    });
  };

  const handleDeleteSubdomain = (subdomainToDelete: string) => {
    setSubdomains(subdomains.filter(s => s.subdomain !== subdomainToDelete));
    toast({
      title: "Success",
      description: `Subdomain ${subdomainToDelete} deleted successfully`,
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>🏠</span>
        <span>→ Websites → finsage.co → Domains → Subdomains</span>
      </div>

      <h1 className="text-2xl font-bold">Subdomains</h1>

      {/* Create New Subdomain */}
      <Card>
        <CardHeader>
          <CardTitle>Create a New Subdomain</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomain</Label>
              <Input
                id="subdomain"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="coach"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Domains</Label>
              <Input
                id="domain"
                value={domain}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="custom-folder"
              checked={customFolder}
              onCheckedChange={(checked) => setCustomFolder(checked as boolean)}
            />
            <Label htmlFor="custom-folder">Custom folder for subdomain</Label>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleCreateSubdomain} className="bg-primary hover:bg-primary/90">
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List of Current Subdomains */}
      <Card>
        <CardHeader>
          <CardTitle>List of Current Subdomains</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 font-semibold text-sm border-b pb-2">
              <div className="col-span-3">Subdomain ↕</div>
              <div className="col-span-7">Directory ↕</div>
              <div className="col-span-2">Actions</div>
            </div>

            {/* Table Rows */}
            {subdomains.map((sub, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 py-3 border-b border-border/50">
                <div className="col-span-3 text-sm">{sub.subdomain}</div>
                <div className="col-span-7 text-sm text-muted-foreground">{sub.directory}</div>
                <div className="col-span-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSubdomain(sub.subdomain)}
                    className="w-8 h-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};