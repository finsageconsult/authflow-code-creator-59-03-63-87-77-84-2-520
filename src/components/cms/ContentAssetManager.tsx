import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, 
  Edit, 
  FileText,
  Video,
  Image,
  Download,
  Upload,
  Eye,
  Link,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContentAsset {
  id: string;
  name: string;
  description: string;
  file_url: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  content_id: string;
  content_type: string;
  uploaded_by: string;
  is_public: boolean;
  download_count: number;
  created_at: string;
  uploader?: {
    name: string;
  };
}

interface ContentAssetManagerProps {
  searchTerm: string;
  category: string;
}

export const ContentAssetManager = ({ searchTerm, category }: ContentAssetManagerProps) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [assets, setAssets] = useState<ContentAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<ContentAsset | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    file_url: '',
    file_type: 'document',
    content_id: '',
    content_type: 'program',
    is_public: false
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      let query = supabase
        .from('content_assets')
        .select(`
          *,
          uploader:users(name)
        `)
        .order('created_at', { ascending: false });

      // If not admin, only show assets uploaded by current user or public assets
      if (userProfile?.role !== 'ADMIN') {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', userProfile?.auth_id)
          .single();

        if (userData) {
          query = query.or(`uploaded_by.eq.${userData.id},is_public.eq.true`);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching content assets:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch content assets',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', userProfile?.auth_id)
        .single();

      if (!userData) {
        toast({
          title: 'Error',
          description: 'User not found',
          variant: 'destructive'
        });
        return;
      }

      const assetData = {
        ...formData,
        uploaded_by: userData.id,
        mime_type: getMimeType(formData.file_url),
        file_size: 0 // This would be set during actual file upload
      };

      if (editingAsset) {
        const { error } = await supabase
          .from('content_assets')
          .update(assetData)
          .eq('id', editingAsset.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Content asset updated successfully'
        });
      } else {
        const { error } = await supabase
          .from('content_assets')
          .insert([assetData]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Content asset created successfully'
        });
      }

      setFormData({
        name: '',
        description: '',
        file_url: '',
        file_type: 'document',
        content_id: '',
        content_type: 'program',
        is_public: false
      });
      setEditingAsset(null);
      setIsCreateDialogOpen(false);
      fetchAssets();
    } catch (error) {
      console.error('Error saving content asset:', error);
      toast({
        title: 'Error',
        description: 'Failed to save content asset',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (asset: ContentAsset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      description: asset.description || '',
      file_url: asset.file_url,
      file_type: asset.file_type,
      content_id: asset.content_id || '',
      content_type: asset.content_type || 'program',
      is_public: asset.is_public
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (asset: ContentAsset) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const { error } = await supabase
        .from('content_assets')
        .delete()
        .eq('id', asset.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Content asset deleted successfully'
      });

      fetchAssets();
    } catch (error) {
      console.error('Error deleting content asset:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete content asset',
        variant: 'destructive'
      });
    }
  };

  const getMimeType = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'application/pdf';
      case 'doc':
      case 'docx': return 'application/msword';
      case 'xls':
      case 'xlsx': return 'application/vnd.ms-excel';
      case 'ppt':
      case 'pptx': return 'application/vnd.ms-powerpoint';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'mp4': return 'video/mp4';
      case 'mp3': return 'audio/mpeg';
      default: return 'application/octet-stream';
    }
  };

  const getFileIcon = (fileType: string, mimeType: string) => {
    if (mimeType.startsWith('video/')) return <Video className="h-6 w-6" />;
    if (mimeType.startsWith('image/')) return <Image className="h-6 w-6" />;
    return <FileText className="h-6 w-6" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = category === 'all' || asset.file_type === category;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading content assets...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Content Assets</h2>
          <p className="text-sm text-muted-foreground">
            Manage attachments, slides, recordings, and worksheets
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAsset ? 'Edit Content Asset' : 'Add New Content Asset'}
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
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="file_url">File URL *</Label>
                  <Input
                    id="file_url"
                    value={formData.file_url}
                    onChange={(e) => setFormData({...formData, file_url: e.target.value})}
                    placeholder="https://..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="file_type">File Type</Label>
                  <Select value={formData.file_type} onValueChange={(value) => setFormData({...formData, file_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slide">Slide</SelectItem>
                      <SelectItem value="recording">Recording</SelectItem>
                      <SelectItem value="worksheet">Worksheet</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="content_type">Content Type</Label>
                  <Select value={formData.content_type} onValueChange={(value) => setFormData({...formData, content_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="program">Program</SelectItem>
                      <SelectItem value="webinar">Webinar</SelectItem>
                      <SelectItem value="tool">Tool</SelectItem>
                      <SelectItem value="offering">Coaching Offering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="content_id">Content ID (optional)</Label>
                  <Input
                    id="content_id"
                    value={formData.content_id}
                    onChange={(e) => setFormData({...formData, content_id: e.target.value})}
                    placeholder="Link to specific content"
                  />
                </div>

                <div className="col-span-2 flex items-center space-x-2">
                  <Switch
                    id="is_public"
                    checked={formData.is_public}
                    onCheckedChange={(checked) => setFormData({...formData, is_public: checked})}
                  />
                  <Label htmlFor="is_public">Public Access</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingAsset(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAsset ? 'Update' : 'Add'} Asset
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => (
          <Card key={asset.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-muted-foreground">
                    {getFileIcon(asset.file_type, asset.mime_type)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight">{asset.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{asset.file_type}</Badge>
                      {asset.is_public && (
                        <Badge variant="secondary">Public</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {asset.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {asset.description}
                </p>
              )}
              
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span>{formatFileSize(asset.file_size)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Downloads:</span>
                  <span>{asset.download_count}</span>
                </div>
                {asset.uploader && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Uploaded by:</span>
                    <span>{asset.uploader.name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(asset.file_url, '_blank')}
                  className="flex-1 gap-1"
                >
                  <Eye className="h-3 w-3" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(asset)}
                  className="flex-1 gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
                {(userProfile?.role === 'ADMIN' || asset.uploaded_by === userProfile?.id) && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(asset)}
                    className="gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-8">
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No content assets found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || category !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Add your first content asset to get started'
            }
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Asset
          </Button>
        </div>
      )}
    </div>
  );
};