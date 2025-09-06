import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Send, ArrowLeft } from 'lucide-react';

interface AuthorProfileFormProps {
  onBack?: () => void;
}

const AuthorProfileForm = ({ onBack }: AuthorProfileFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [folderName, setFolderName] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('https://n8n.srv850193.hstgr.cloud/webhook/ea6762d9-8e74-4679-91a4-2c94805f11dd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': import.meta.env.VITE_N8N_API_KEY,
        },
        body: JSON.stringify({ folderName }),
      });

      if (response.ok) {
        toast({
          title: "Erfolg!",
          description: "Das Autorenprofil wird jetzt erstellt. Dies kann einige Minuten dauern.",
        });
        setFolderName('');
      } else {
        throw new Error('Fehler beim Senden');
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Autorenprofil konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Autorenprofil erstellen</h2>
        <p className="text-gray-600">Gebe den Namen des Google Drive Ordners ein, in dem die Dokumente des Unternehms enthalten sind.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="folderName">Google Drive Ordner *</Label>
          <Input
            id="folderName"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Name des Ordners"
            required
            className="transition-all focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          <Send className="h-4 w-4" />
          {isLoading ? "Wird gesendet..." : "Autorenprofil erstellen"}
        </Button>
      </form>
    </div>
  );
};

export default AuthorProfileForm;
