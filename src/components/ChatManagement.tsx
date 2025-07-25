import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Edit3, 
  Trash2, 
  Archive, 
  Tag, 
  Save, 
  X,
  Plus
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { chatService } from '@/lib/services/chatService';
import { Chat } from '@/lib/supabase';

interface ChatManagementProps {
  chat: Chat;
  userId: string;
  onUpdate: () => void;
  availableTags: string[];
}

export function ChatRenameDialog({ 
  chat, 
  userId, 
  isOpen, 
  onClose, 
  onUpdate 
}: {
  chat: Chat;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [newTitle, setNewTitle] = useState(chat.title || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!newTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid title.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await chatService.updateChatMetadata(chat.id, userId, {
        title: newTitle.trim()
      });

      if (success) {
        toast({
          title: "Success",
          description: "Chat title updated successfully.",
        });
        onUpdate();
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update chat title.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Chat Title</label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter new chat title..."
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ChatTagsDialog({ 
  chat, 
  userId, 
  isOpen, 
  onClose, 
  onUpdate,
  availableTags 
}: {
  chat: Chat;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  availableTags: string[];
}) {
  const [selectedTags, setSelectedTags] = useState<string[]>(chat.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const success = await chatService.updateChatMetadata(chat.id, userId, {
        tags: selectedTags
      });

      if (success) {
        toast({
          title: "Success",
          description: "Chat tags updated successfully.",
        });
        onUpdate();
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update chat tags.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Add New Tag</label>
            <div className="flex gap-2 mt-1">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Enter tag name..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button onClick={handleAddTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Available Tags</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {availableTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    if (selectedTags.includes(tag)) {
                      handleRemoveTag(tag);
                    } else {
                      setSelectedTags([...selectedTags, tag]);
                    }
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Selected Tags</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {selectedTags.map(tag => (
                <Badge key={tag} variant="default" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Tags'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ChatDeleteDialog({ 
  chat, 
  userId, 
  isOpen, 
  onClose, 
  onUpdate 
}: {
  chat: Chat;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const success = await chatService.deleteChat(chat.id, userId);

      if (success) {
        toast({
          title: "Success",
          description: "Chat deleted successfully.",
        });
        onUpdate();
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete chat.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Chat</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{chat.title || 'Untitled Chat'}"? 
            This action cannot be undone and will permanently remove all messages in this conversation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Deleting...' : 'Delete Chat'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function BulkChatActions({ 
  selectedChats, 
  userId, 
  onUpdate, 
  onClearSelection 
}: {
  selectedChats: string[];
  userId: string;
  onUpdate: () => void;
  onClearSelection: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleBulkArchive = async (archived: boolean) => {
    setIsLoading(true);
    try {
      const promises = selectedChats.map(chatId => 
        chatService.archiveChat(chatId, userId, archived)
      );
      
      await Promise.all(promises);
      
      toast({
        title: "Success",
        description: `${selectedChats.length} chat(s) ${archived ? 'archived' : 'unarchived'} successfully.`,
      });
      
      onUpdate();
      onClearSelection();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${archived ? 'archive' : 'unarchive'} chats.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedChats.length} chat(s)? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    try {
      const promises = selectedChats.map(chatId => 
        chatService.deleteChat(chatId, userId)
      );
      
      await Promise.all(promises);
      
      toast({
        title: "Success",
        description: `${selectedChats.length} chat(s) deleted successfully.`,
      });
      
      onUpdate();
      onClearSelection();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete chats.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedChats.length === 0) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
      <span className="text-sm font-medium">
        {selectedChats.length} chat(s) selected
      </span>
      <div className="flex gap-2 ml-auto">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => handleBulkArchive(true)}
          disabled={isLoading}
        >
          <Archive className="h-4 w-4 mr-1" />
          Archive
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => handleBulkArchive(false)}
          disabled={isLoading}
        >
          <Archive className="h-4 w-4 mr-1" />
          Unarchive
        </Button>
        <Button 
          size="sm" 
          variant="destructive" 
          onClick={handleBulkDelete}
          disabled={isLoading}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={onClearSelection}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
