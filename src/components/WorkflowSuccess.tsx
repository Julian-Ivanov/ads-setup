import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Copy, ExternalLink, ArrowLeft, Home } from 'lucide-react';

interface WorkflowSuccessProps {
  googleDriveLink: string;
  onBackToMenu: () => void;
}

const WorkflowSuccess = ({ googleDriveLink, onBackToMenu }: WorkflowSuccessProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(googleDriveLink);
      setCopied(true);
      toast({
        title: "Link kopiert!",
        description: "Der Google Drive Link wurde in die Zwischenablage kopiert.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Link konnte nicht kopiert werden.",
        variant: "destructive",
      });
    }
  };

  const handleOpenLink = () => {
    window.open(googleDriveLink, '_blank');
  };

  return (
    <div className="space-y-6">

      <Card className="shadow-lg border-green-200">
        <CardHeader className="text-center bg-gradient-to-br from-green-50 to-emerald-50 pb-8">
          <div className="mx-auto mb-6 p-4 bg-green-100 rounded-full w-fit shadow-sm">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-green-800 mb-4">
            🎉 Erfolgreich abgeschlossen!
          </CardTitle>
          <div className="space-y-3 max-w-2xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed">
              Dein Artikel wurde erfolgreich erstellt und in Google Drive gespeichert.
            </p>
            <p className="text-base text-gray-600 leading-relaxed">
              Du kannst den Artikel jetzt direkt über den untenstehenden Link öffnen oder den Link kopieren.
            </p>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-6 pt-8">

          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between bg-white rounded border p-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500 mb-1">Google Drive Link:</p>
                <p className="text-sm text-blue-600 break-all">
                  {googleDriveLink}
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button 
                onClick={handleCopyLink}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Kopiert!" : "Link kopieren"}
              </Button>
              
              <Button 
                onClick={handleOpenLink}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                In Google Drive öffnen
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button 
              onClick={onBackToMenu}
              className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" />
              Neuen Artikel erstellen
            </Button>
          </div>
        </CardContent>
      </Card>


    </div>
  );
};

export default WorkflowSuccess;
