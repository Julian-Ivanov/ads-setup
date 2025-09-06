import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { LogOut, FileText, User, ArrowRight } from 'lucide-react';

interface WorkflowSelectionProps {
  onSelectWorkflow: (workflow: string) => void;
  isInitializing?: boolean;
}

const WorkflowSelection = ({ onSelectWorkflow, isInitializing }: WorkflowSelectionProps) => {
  const { logout } = useAuth();

  const workflows = [
    {
      id: 'setupWithoutKeywords',
      title: 'Setup ohne Keyword Vorlage',
      description: 'Ads-Setup mit neuen Keywords generieren',
      icon: FileText,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'setupWithKeywords',
      title: 'Setup mit Keyword Vorlage',
      description: 'Ads-Setup mit bereits vorhandenen Keywords generieren',
      icon: FileText,
      color: 'bg-green-500 hover:bg-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Ads-Setupgenerierung</h1>
            <p className="text-lg text-gray-600">Wähle einen Workflow aus, um zu beginnen</p>
          </div>
          <Button 
            onClick={logout}
            variant="outline"
            className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Was möchtest du heute erstellen?
            </h2>
            <p className="text-gray-600">
              Wähle einen der verfügbaren Workflows aus, um mit der Erstellung deines Inhalts zu beginnen.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {workflows.map((workflow) => {
            const IconComponent = workflow.icon;
            return (
              <Card 
                key={workflow.id}
                className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 shadow-lg"
                onClick={() => onSelectWorkflow(workflow.id)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto mb-4 p-4 rounded-full ${workflow.color} text-white transition-all duration-300 group-hover:scale-110`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {workflow.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {workflow.description}
                  </p>
                  <Button 
                    className={`w-full ${workflow.color} text-white transition-all duration-300 group-hover:shadow-lg`}
                    onClick={() => {
                      console.log('Button clicked for workflow:', workflow.id);
                      onSelectWorkflow(workflow.id);
                    }}
                    disabled={workflow.id === 'setupWithoutKeywords' && isInitializing}
                  >
                    {workflow.id === 'setupWithoutKeywords' && isInitializing ? 'Initialisiere...' : 'Auswählen'}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>


      </div>
    </div>
  );
};

export default WorkflowSelection;
