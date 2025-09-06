import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ExternalLink, CheckCircle } from 'lucide-react';

interface KeywordKontrolleProps {
  onContinue: () => void;
  googleSheetsUrl: string;
  resumeUrl: string | null;
}

const KeywordKontrolle = ({ onContinue, googleSheetsUrl, resumeUrl }: KeywordKontrolleProps) => {
  const [isContinuing, setIsContinuing] = useState(false);
  const { toast } = useToast();

  const handleOpenGoogleSheets = () => {
    window.open(googleSheetsUrl, '_blank');
  };

  const handleContinue = async () => {
    if (!resumeUrl) {
      toast({
        title: "Fehler",
        description: "Resume URL ist nicht verfügbar.",
        variant: "destructive",
      });
      return;
    }

    // Start loading animation immediately
    onContinue();
    
    setIsContinuing(true);
    
    try {
      // Send continue signal to resume URL
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/submit-form?resumeUrl=${encodeURIComponent(resumeUrl)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback: true }),
      });

      if (response.ok) {
        toast({
          title: "Fortsetzung gesendet!",
          description: "Das Ads-Setup wird fortgesetzt.",
        });
      } else {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error continuing workflow:', error);
      toast({
        title: "Fehler beim Fortsetzen",
        description: "Es ist ein Fehler aufgetreten. Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsContinuing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center space-y-8">
        {/* Success Icon */}
        <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-full w-fit shadow-lg">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        
        {/* Main Title */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            Keyword Kontrolle
          </h2>
          <p className="text-gray-600 text-lg">
            Bitte überprüfe und bearbeite ggf. die Keywords im Google Sheets Dokument. 
            Anschließend klicke auf den "Fortsetzen" Button.
          </p>
        </div>

        {/* Google Sheets Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 shadow-sm border border-green-100">
          <div className="text-center">
            <p className="text-lg font-semibold text-green-900 mb-6">
              Google Sheets Dokument
            </p>
            <Button
              onClick={handleOpenGoogleSheets}
              className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-10 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
            >
              <ExternalLink className="h-5 w-5" />
              Google Sheets öffnen
            </Button>
          </div>
        </div>
        
        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleContinue}
            disabled={isContinuing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            {isContinuing ? 'Wird fortgesetzt...' : 'Fortsetzen'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KeywordKontrolle;
