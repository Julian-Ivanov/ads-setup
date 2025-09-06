import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface AdsSetupWithTemplateLoadingProps {
  onBack: () => void;
  resumeUrl: string | null;
}

const AdsSetupWithTemplateLoading = ({ onBack, resumeUrl }: AdsSetupWithTemplateLoadingProps) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center space-y-8">
        {/* Loading Animation */}
        <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full w-fit shadow-lg">
          <LoadingSpinner />
        </div>
        
        {/* Main Title */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            Ads-Setup wird erstellt...
          </h2>
          <p className="text-gray-600 text-lg">
            Das kann einen Moment dauern.
          </p>
        </div>

        {/* Process Steps */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100">
          <p className="text-lg font-semibold text-blue-900 mb-4">
            Was passiert gerade?
          </p>
          <ul className="text-blue-800 space-y-2 text-left">
            <li className="flex items-start">
              <span className="text-blue-600 mr-3">•</span>
              Anzeigentitel und -beschreibungen werden erstellt
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-3">•</span>
              Performance Max wird erstellt
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-3">•</span>
              Erweiterungen werden erstellt
            </li>
          </ul>
        </div>
        
      </div>
    </div>
  );
};

export default AdsSetupWithTemplateLoading;
