import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle, Mail } from 'lucide-react';

interface AdsSetupCompleteProps {
  googleSheetsUrl: string;
}

const AdsSetupComplete = ({ googleSheetsUrl }: AdsSetupCompleteProps) => {
  const handleOpenGoogleSheets = () => {
    window.open(googleSheetsUrl, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center space-y-8">
        {/* Success Icon */}
        <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-full w-fit shadow-lg">
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>
        
        {/* Main Title */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            Ads-Setup erfolgreich erstellt!
          </h2>
          <p className="text-gray-600 text-lg">
            Dein Ads-Setup wurde erfolgreich generiert und ist bereit zur Verwendung.
          </p>
        </div>

        {/* Email Notification */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Mail className="h-6 w-6 text-blue-600" />
            <p className="text-lg font-semibold text-blue-900">
              Email-Benachrichtigung
            </p>
          </div>
          <p className="text-blue-800">
            Eine Email mit dem Dokument wurde auch nochmal per Mail gesendet.
          </p>
        </div>

        {/* Google Sheets Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 shadow-sm border border-green-100">
          <div className="text-center">
            <p className="text-lg font-semibold text-green-900 mb-6">
              Google Sheets Dokument
            </p>
            <div className="flex justify-center">
              <Button
                onClick={handleOpenGoogleSheets}
                className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-12 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                <ExternalLink className="h-5 w-5" />
                Google Sheets öffnen
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdsSetupComplete;
