
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LogOut, FileText, User, ArrowLeft } from 'lucide-react';
import SetupWithoutKeywordsForm from './SetupWithoutKeywordsForm';
import SetupWithKeywordsForm from './SetupWithKeywordsForm';
import AdsSetupLoading from './AdsSetupLoading';
import AdsSetupFinalLoading from './AdsSetupFinalLoading';
import AdsSetupWithTemplateLoading from './AdsSetupWithTemplateLoading';
import KeywordKontrolle from './KeywordKontrolle';
import AdsSetupComplete from './AdsSetupComplete';
import WorkflowSelection from './WorkflowSelection';
import ErrorScreen from './ErrorScreen';
import { API_BASE_URL } from '@/config/api';

const Tabs = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [workflowState, setWorkflowState] = useState<'form' | 'loading' | 'feedback' | 'finalLoading' | 'complete' | 'error'>('form');
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState<string | null>(null);
  const [finalGoogleSheetsUrl, setFinalGoogleSheetsUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const workflowStateRef = useRef(workflowState);
  const { logout } = useAuth();
  const { toast } = useToast();

  // Update ref when workflow state changes
  useEffect(() => {
    workflowStateRef.current = workflowState;
  }, [workflowState]);

  // Cleanup polling on component unmount
  useEffect(() => {
    return () => {
      cleanupPolling();
    };
  }, []);

  const handleSelectWorkflow = async (workflow: string) => {
    console.log('handleSelectWorkflow called with:', workflow);
    if (workflow === 'setupWithoutKeywords' || workflow === 'setupWithKeywords') {
      setIsInitializing(true);
      try {
        console.log('Sending POST request to backend for workflow initialization...');
        
        const response = await fetch(`${API_BASE_URL}/api/init-workflow`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ workflowType: workflow }), // Send workflow type
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Response data:', data);
          console.log('Setting resume URL to:', data.resumeURL);
          setResumeUrl(data.resumeURL);
          setSelectedWorkflow(workflow);
          toast({
            title: "Workflow initialisiert!",
            description: "Du kannst jetzt das Formular ausfüllen.",
          });
        } else {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          handleError(`Workflow-Initialisierung fehlgeschlagen (Status: ${response.status})`);
          return;
        }
      } catch (error) {
        console.error('Error initializing workflow:', error);
        handleError(`Verbindungsfehler beim Initialisieren des Workflows: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
        return;
      } finally {
        setIsInitializing(false);
      }
    } else {
      setSelectedWorkflow(workflow);
    }
  };

  const handleBackToSelection = () => {
    cleanupPolling(); // Stop all background processes
    setSelectedWorkflow(null);
    setWorkflowState('form');
    setGoogleSheetsUrl(null);
    setFinalGoogleSheetsUrl(null);
    setErrorMessage(null);
  };

  const cleanupPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  const handleError = (error: string) => {
    console.error('Error occurred:', error);
    cleanupPolling(); // Stop all background processes
    setErrorMessage(error);
    setWorkflowState('error');
  };


  const handleFormSubmit = () => {
    if (selectedWorkflow === 'setupWithKeywords') {
      // For setupWithKeywords, go directly to final loading (no feedback step)
      setWorkflowState('loading');
      startFinalPolling();
    } else {
      // For setupWithoutKeywords, go to first loading then feedback
      setWorkflowState('loading');
      startPolling();
    }
  };

  const handleFormValidationError = () => {
    setWorkflowState('form');
  };

  const startPolling = () => {
    console.log('Starting polling for getFeedback with resumeUrl:', resumeUrl);
    
    // Clean up any existing polling first
    cleanupPolling();
    
    const pollInterval = setInterval(async () => {
      // Check if we should still be polling (workflow state might have changed)
      if (workflowStateRef.current !== 'loading') {
        console.log('Workflow state changed, stopping polling');
        cleanupPolling();
        return;
      }

      try {
        console.log('Polling attempt for getFeedback...');
        const response = await fetch(`${API_BASE_URL}/api/check-outline`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ resumeUrl }),
        });

        if (response.ok) {
          let data;
          try {
            const responseText = await response.text();
            console.log('Raw polling response:', responseText);
            data = JSON.parse(responseText);
            console.log('Parsed polling response:', data);
          } catch (parseError) {
            console.error('❌ Failed to parse polling response as JSON:', parseError);
            console.error('Raw response:', responseText);
            return;
          }
          
          if (data.getFeedback) {
            console.log('✅ Received getFeedback:', data.getFeedback);
            setGoogleSheetsUrl(data.getFeedback);
            setWorkflowState('feedback');
            cleanupPolling(); // Stop polling when we get the result
          } else {
            console.log('No getFeedback yet, continuing to poll...');
            console.log('Available keys in response:', Object.keys(data));
          }
        } else {
          console.log('Polling response not ok:', response.status);
          const errorText = await response.text();
          console.log('Error response:', errorText);
        }
      } catch (error) {
        console.error('Error polling for feedback:', error);
        handleError(`Fehler beim Polling: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      }
    }, 2000); // Poll every 2 seconds

    setPollingInterval(pollInterval);

    // Stop polling after 15 minutes and show error
    const timeout = setTimeout(() => {
      cleanupPolling();
      if (workflowState === 'loading') {
        handleError("Timeout: Die Anfrage hat zu lange gedauert. Bitte versuche es erneut.");
      }
    }, 900000);
    
    setTimeoutId(timeout);
  };

  const handleContinue = () => {
    setWorkflowState('finalLoading');
    startFinalPolling();
  };

  const startFinalPolling = () => {
    console.log('Starting final polling with resumeUrl:', resumeUrl);
    
    // Clean up any existing polling first
    cleanupPolling();
    
    const pollInterval = setInterval(async () => {
      // Check if we should still be polling (workflow state might have changed)
      if (workflowStateRef.current !== 'finalLoading') {
        console.log('Workflow state changed, stopping final polling');
        cleanupPolling();
        return;
      }

      try {
        console.log('Final polling attempt with resumeUrl:', resumeUrl);
        const response = await fetch(`${API_BASE_URL}/api/check-outline`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ resumeUrl }),
        });

        if (response.ok) {
          let data;
          try {
            const responseText = await response.text();
            console.log('Raw final polling response:', responseText);
            data = JSON.parse(responseText);
            console.log('Parsed final polling response:', data);
          } catch (parseError) {
            console.error('❌ Failed to parse final polling response as JSON:', parseError);
            console.error('Raw response:', responseText);
            return;
          }
          
          if (data.end) {
            console.log('Received end response:', data.end);
            setFinalGoogleSheetsUrl(data.end);
            setWorkflowState('complete');
            cleanupPolling(); // Stop polling when we get the result
          } else {
            console.log('No end response yet, continuing to poll...');
            console.log('Available keys in final response:', Object.keys(data));
          }
        } else {
          console.log('Final polling response not ok:', response.status);
          const errorText = await response.text();
          console.log('Error response:', errorText);
        }
      } catch (error) {
        console.error('Error polling for final response:', error);
        handleError(`Fehler beim finalen Polling: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      }
    }, 2000); // Poll every 2 seconds

    setPollingInterval(pollInterval);

    // Stop polling after 15 minutes and show error
    const timeout = setTimeout(() => {
      cleanupPolling();
      if (workflowState === 'finalLoading') {
        handleError("Timeout: Die finale Anfrage hat zu lange gedauert. Bitte versuche es erneut.");
      }
    }, 900000);
    
    setTimeoutId(timeout);
  };

  // Show error screen if there's an error
  if (workflowState === 'error') {
    return (
      <ErrorScreen 
        onReturnToMenu={handleBackToSelection}
        errorMessage={errorMessage || undefined}
      />
    );
  }

  // Show workflow selection if no workflow is selected
  if (!selectedWorkflow) {
    return <WorkflowSelection onSelectWorkflow={handleSelectWorkflow} isInitializing={isInitializing} />;
  }

  // Show the selected workflow form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleBackToSelection}
              variant="outline"
              className="flex items-center gap-2 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zur Auswahl
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedWorkflow === 'setupWithoutKeywords' && 'Setup ohne Keyword Vorlage'}
              {selectedWorkflow === 'setupWithKeywords' && 'Setup mit Keyword Vorlage'}
            </h1>
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

        <Card className="shadow-lg">
          <CardContent className="p-6">
            {selectedWorkflow === 'setupWithoutKeywords' && (
              <>
                {workflowState === 'form' && (
                  <SetupWithoutKeywordsForm 
                    onBack={handleBackToSelection} 
                    resumeUrl={resumeUrl}
                    onSubmit={handleFormSubmit}
                    onValidationError={handleFormValidationError}
                    onError={handleError}
                  />
                )}
                {workflowState === 'loading' && (
                  <AdsSetupLoading 
                    onBack={handleBackToSelection} 
                    resumeUrl={resumeUrl}
                  />
                )}
                {workflowState === 'feedback' && googleSheetsUrl && (
                  <KeywordKontrolle 
                    onContinue={handleContinue}
                    googleSheetsUrl={googleSheetsUrl}
                    resumeUrl={resumeUrl}
                    onError={handleError}
                  />
                )}
                {workflowState === 'finalLoading' && (
                  <AdsSetupFinalLoading 
                    onBack={handleBackToSelection} 
                    resumeUrl={resumeUrl}
                  />
                )}
                {workflowState === 'complete' && finalGoogleSheetsUrl && (
                  <AdsSetupComplete 
                    googleSheetsUrl={finalGoogleSheetsUrl}
                  />
                )}
              </>
            )}
            {selectedWorkflow === 'setupWithKeywords' && (
              <>
                {workflowState === 'form' && (
                  <SetupWithKeywordsForm 
                    onBack={handleBackToSelection} 
                    resumeUrl={resumeUrl}
                    onSubmit={handleFormSubmit}
                    onValidationError={handleFormValidationError}
                    onError={handleError}
                  />
                )}
                {workflowState === 'loading' && (
                  <AdsSetupWithTemplateLoading 
                    onBack={handleBackToSelection} 
                    resumeUrl={resumeUrl}
                  />
                )}
                {workflowState === 'complete' && finalGoogleSheetsUrl && (
                  <AdsSetupComplete 
                    googleSheetsUrl={finalGoogleSheetsUrl}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tabs;
