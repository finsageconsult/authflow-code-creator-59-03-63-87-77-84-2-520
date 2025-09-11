import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  FolderPlus, 
  FilePlus, 
  Trash2, 
  Download, 
  Upload, 
  Settings,
  Home,
  Folder,
  File,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileItem {
  name: string;
  type: 'folder' | 'file';
  size?: string;
  lastModified: string;
  permissions: string;
}

export const FileManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPath, setCurrentPath] = useState('/public_html');
  const { toast } = useToast();

  // Mock file data
  const [files] = useState<FileItem[]>([
    {
      name: 'admin',
      type: 'folder',
      lastModified: '11 minutes ago',
      permissions: 'drwxr-xr-x'
    },
    {
      name: 'assets',
      type: 'folder',
      lastModified: 'a day ago',
      permissions: 'drwxr-xr-x'
    },
    {
      name: 'coach',
      type: 'folder',
      lastModified: '11 minutes ago',
      permissions: 'drwxr-xr-x'
    },
    {
      name: 'dist',
      type: 'folder',
      lastModified: 'a day ago',
      permissions: 'drwxr-xr-x'
    },
    {
      name: 'hr',
      type: 'folder',
      lastModified: '11 minutes ago',
      permissions: 'drwxr-xr-x'
    },
    {
      name: 'lovable-uploads',
      type: 'folder',
      lastModified: 'a day ago',
      permissions: 'drwxr-xr-x'
    },
    {
      name: 'original-finsage',
      type: 'folder',
      lastModified: 'a day ago',
      permissions: 'drwxr-xr-x'
    },
    {
      name: '.htaccess',
      type: 'file',
      size: '1.39 KiB',
      lastModified: 'a day ago',
      permissions: '-rw-r--r--'
    }
  ]);

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateFolder = () => {
    toast({
      title: "Success",
      description: "New folder created successfully",
    });
  };

  const handleUploadFile = () => {
    toast({
      title: "Success",
      description: "File uploaded successfully",
    });
  };

  const handleDeleteItem = (name: string) => {
    toast({
      title: "Success",
      description: `${name} deleted successfully`,
    });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border">
        <div className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">My files</h2>
          
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm"
              onClick={handleCreateFolder}
            >
              <FolderPlus className="h-4 w-4" />
              New folder
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm"
              onClick={handleUploadFile}
            >
              <FilePlus className="h-4 w-4" />
              New file
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Trash bin
            </Button>
          </div>

          {/* Space indicator */}
          <div className="space-y-2 pt-8">
            <div className="text-sm text-muted-foreground">Space</div>
            <div className="w-full bg-primary h-2 rounded-full" />
            <div className="text-xs text-muted-foreground">3.47 GiB / 100 GiB</div>
          </div>

          {/* Inodes indicator */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Inodes</div>
            <div className="w-full bg-primary h-2 rounded-full" />
            <div className="text-xs text-muted-foreground">31059 / 400000</div>
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm mt-8"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>

        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">
          <div>File Browser v2.32.0-b3</div>
          <div>Help</div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between mb-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Home className="h-4 w-4" />
              <ChevronRight className="h-4 w-4" />
              <span>{currentPath}</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted/50"
            />
          </div>
        </div>

        {/* File listing */}
        <div className="flex-1 p-4">
          <Card>
            <CardContent className="p-0">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/50 font-medium text-sm">
                <div className="col-span-5 flex items-center gap-2">
                  Name
                  <div className="flex flex-col">
                    <div className="h-0 w-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-muted-foreground"></div>
                    <div className="h-0 w-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-muted-foreground"></div>
                  </div>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  Size
                  <div className="flex flex-col">
                    <div className="h-0 w-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-muted-foreground"></div>
                    <div className="h-0 w-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-muted-foreground"></div>
                  </div>
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  Last modified
                  <div className="flex flex-col">
                    <div className="h-0 w-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-muted-foreground"></div>
                    <div className="h-0 w-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-muted-foreground"></div>
                  </div>
                </div>
                <div className="col-span-2">Permissions</div>
              </div>

              {/* File rows */}
              {filteredFiles.map((file, index) => (
                <div 
                  key={index}
                  className="grid grid-cols-12 gap-4 p-4 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="col-span-5 flex items-center gap-3">
                    {file.type === 'folder' ? (
                      <Folder className="h-5 w-5 text-blue-400" />
                    ) : (
                      <File className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {file.size || '-'}
                  </div>
                  <div className="col-span-3 text-sm text-muted-foreground">
                    {file.lastModified}
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground font-mono">
                    {file.permissions}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};