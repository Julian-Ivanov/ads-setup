import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface ErrorScreenProps {
  onReturnToMenu: () => void;
  onRetry?: () => void;
  errorMessage?: string;
}

const ErrorScreen = ({ onReturnToMenu, onRetry, errorMessage }: ErrorScreenProps) => {
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Etwas ist schiefgelaufen
        </h1>

        {/* Error Description */}
        <div className="text-gray-600 mb-6 space-y-3">
          <p>
            Es ist ein unerwarteter Fehler aufgetreten. Der Entwickler wurde automatisch 
            über das Problem informiert.
          </p>
          {errorMessage && (
            <div className="bg-gray-100 rounded-md p-3 text-sm text-left">
              <strong>Fehlerdetails:</strong>
              <br />
              {errorMessage}
            </div>
          )}
          <p className="text-sm">
            Du kannst den Workflow erneut starten oder zum Hauptmenü zurückkehren.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Workflow erneut starten
            </Button>
          )}
          
          <Button
            onClick={onReturnToMenu}
            variant="outline"
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Zum Hauptmenü zurückkehren
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Falls das Problem weiterhin besteht, wende dich bitte an den Support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;
