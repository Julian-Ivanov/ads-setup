
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, ArrowLeft } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import OutlineFeedback from './OutlineFeedback';
import ArticleFeedback from './ArticleFeedback';
import WorkflowSuccess from './WorkflowSuccess';
import { API_BASE_URL } from '@/config/api';

interface ArticleGenerationFormProps {
  onBack?: () => void;
  resumeUrl?: string | null;
}

const ArticleGenerationForm = ({ onBack, resumeUrl }: ArticleGenerationFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [outline, setOutline] = useState<string | null>(null);
  const [article, setArticle] = useState<string | null>(null);
  const [googleDriveLink, setGoogleDriveLink] = useState<string | null>(null);
  const [workflowState, setWorkflowState] = useState<'form' | 'loading' | 'outline' | 'article' | 'success'>('form');
  const { toast } = useToast();
  
  console.log('ArticleGenerationForm received resumeUrl:', resumeUrl);
  console.log('Current workflowState:', workflowState, 'isWaitingForResponse:', isWaitingForResponse);
  
  // Track workflow state changes
  useEffect(() => {
    console.log('Workflow state changed to:', workflowState, 'isWaitingForResponse:', isWaitingForResponse);
  }, [workflowState, isWaitingForResponse]);
  
  const [formData, setFormData] = useState({
    author: '',
    email: '',
    authorProfile: '',
    mainKeyword: '',
    keywordSet: '',
    articleType: '',
    wordCount: '',
    writingStyle: '',
    outlineHints: '',
    textHints: '',
    targetUrl: '',
    targetAudience: '',
    forbiddenElements: '',
    exampleTexts: '',
    aiOptimization: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // If we have a resumeUrl, immediately show loading state
    if (resumeUrl) {
      setWorkflowState('loading');
      setIsWaitingForResponse(true);
    }

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      // Send form data through backend to avoid CORS issues
      console.log('Resume URL received:', resumeUrl);
      const webhookUrl = resumeUrl || 'https://n8n.srv850193.hstgr.cloud/webhook/d8aab47a-a758-4b61-b544-266b523080bc';
      console.log('Using webhook URL:', webhookUrl);
      
      const response = await fetch(`${API_BASE_URL}/api/submit-form?resumeUrl=${encodeURIComponent(webhookUrl)}`, {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        const responseData = await response.json();
        
        // If we have a resumeUrl, we're in interactive mode
        if (resumeUrl) {
          // Check if the response contains an outline
          if (responseData.outline) {
            console.log('Received outline directly from n8n:', responseData.outline);
            setOutline(responseData.outline);
            setWorkflowState('outline');
            setIsWaitingForResponse(false);
            toast({
              title: "Outline erstellt!",
              description: "Die Artikel-Outline wurde generiert. Bitte gib dein Feedback ein.",
            });
          } else if (responseData.article) {
            console.log('Received article directly from n8n:', responseData.article);
            setArticle(responseData.article);
            setWorkflowState('article');
            setIsWaitingForResponse(false);
            toast({
              title: "Artikel erstellt!",
              description: "Der Artikel wurde generiert. Bitte gib dein Feedback ein.",
            });
          } else if (responseData.end) {
            console.log('Workflow completed successfully! Google Drive link:', responseData.end);
            setGoogleDriveLink(responseData.end);
            setWorkflowState('success');
            setIsWaitingForResponse(false);
            toast({
              title: "Erfolgreich abgeschlossen!",
              description: "Dein Artikel wurde in Google Drive gespeichert.",
            });
          } else {
            // No outline or article yet, keep loading state (already set above)
            console.log('No outline or article in response, continuing to poll...');
            toast({
              title: "Workflow gestartet!",
              description: "Dein Artikel wird erstellt. Bitte warte auf weitere Anweisungen...",
            });
          }
        } else {
          // Fallback to original behavior
          toast({
            title: "Erfolg!",
            description: "Artikelauftrag empfangen. Der Artikel landet in ca. 5-10 Minuten im Google Drive Ordner.",
          });
          // Reset form
          setFormData({
            author: '',
            email: '',
            authorProfile: '',
            mainKeyword: '',
            keywordSet: '',
            articleType: '',
            wordCount: '',
            writingStyle: '',
            outlineHints: '',
            textHints: '',
            targetUrl: '',
            targetAudience: '',
            forbiddenElements: '',
            exampleTexts: '',
            aiOptimization: ''
          });
        }
      } else {
        throw new Error('Fehler beim Senden');
      }
    } catch (error) {
      // Reset loading states on error
      setWorkflowState('form');
      setIsWaitingForResponse(false);
      toast({
        title: "Fehler",
        description: "Artikel konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedbackSent = () => {
    console.log('handleFeedbackSent called - setting workflowState to loading');
    setWorkflowState('loading');
    setIsWaitingForResponse(true);
    toast({
      title: "Feedback gesendet!",
      description: "Der Workflow verarbeitet dein Feedback. Bitte warte...",
    });
  };

  // Poll for outline response when in loading state
  useEffect(() => {
    if (workflowState === 'loading' && resumeUrl) {
      const pollForOutline = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/check-outline`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ resumeUrl }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Polling response:', data);
            if (data.outline) {
              console.log('Received outline from polling:', data.outline);
              setOutline(data.outline);
              setWorkflowState('outline');
              setIsWaitingForResponse(false);
              toast({
                title: "Outline erstellt!",
                description: "Die Artikel-Outline wurde generiert. Bitte gib dein Feedback ein.",
              });
            } else if (data.article) {
              console.log('Received article from polling:', data.article);
              setArticle(data.article);
              setWorkflowState('article');
              setIsWaitingForResponse(false);
              toast({
                title: "Artikel erstellt!",
                description: "Der Artikel wurde generiert. Bitte gib dein Feedback ein.",
              });
            } else if (data.end) {
              console.log('Workflow completed successfully from polling! Google Drive link:', data.end);
              setGoogleDriveLink(data.end);
              setWorkflowState('success');
              setIsWaitingForResponse(false);
              toast({
                title: "Erfolgreich abgeschlossen!",
                description: "Dein Artikel wurde in Google Drive gespeichert.",
              });
            } else {
              console.log('No content in polling response, continuing to poll...');
            }
          }
        } catch (error) {
          console.error('Error polling for outline:', error);
        }
      };

      // Poll every 3 seconds
      const interval = setInterval(pollForOutline, 3000);
      
      // Cleanup interval on unmount or state change
      return () => clearInterval(interval);
    }
  }, [workflowState, resumeUrl, toast]);

  // Show success page if workflow is completed
  if (workflowState === 'success' && googleDriveLink) {
    console.log('Showing workflow success component');
    return (
      <WorkflowSuccess
        googleDriveLink={googleDriveLink}
        onBackToMenu={onBack || (() => {})}
      />
    );
  }

  // Show article feedback if we have an article
  if (workflowState === 'article' && article && resumeUrl) {
    console.log('Showing article feedback component');
    return (
      <ArticleFeedback
        article={article}
        resumeUrl={resumeUrl}
        onBack={onBack || (() => {})}
        onFeedbackSent={handleFeedbackSent}
      />
    );
  }

  // Show outline feedback if we have an outline
  if (workflowState === 'outline' && outline && resumeUrl) {
    console.log('Showing outline feedback component');
    return (
      <OutlineFeedback
        outline={outline}
        resumeUrl={resumeUrl}
        onBack={onBack || (() => {})}
        onFeedbackSent={handleFeedbackSent}
      />
    );
  }

  // Show loading state if waiting for n8n response
  if (workflowState === 'loading' || isWaitingForResponse) {
    console.log('Showing loading state - workflowState:', workflowState, 'isWaitingForResponse:', isWaitingForResponse);
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Workflow läuft..." />
        <div className="mt-6 text-center max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Dein Artikel wird erstellt
          </h3>
          <p className="text-gray-600">
            Der n8n Workflow verarbeitet deine Anfrage. Du erhälst in Kürze weitere Anweisungen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="author">Autor:in *</Label>
          <Input
            id="author"
            value={formData.author}
            onChange={(e) => handleInputChange('author', e.target.value)}
            placeholder="Dein Name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Deine Email für den Feedback-Loop"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="authorProfile">Autorenprofil *</Label>
          <Input
            id="authorProfile"
            value={formData.authorProfile}
            onChange={(e) => handleInputChange('authorProfile', e.target.value)}
            placeholder="Dateiname des Autorenprofils (Name der Firma)"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mainKeyword">Hauptkeyword *</Label>
          <Input
            id="mainKeyword"
            value={formData.mainKeyword}
            onChange={(e) => handleInputChange('mainKeyword', e.target.value)}
            placeholder="Hauptkeyword des Artikels"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="keywordSet">Keywordset *</Label>
          <Input
            id="keywordSet"
            value={formData.keywordSet}
            onChange={(e) => handleInputChange('keywordSet', e.target.value)}
            placeholder="Keywords mit Komma getrennt"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="articleType">Artikeltyp *</Label>
          <Input
            id="articleType"
            value={formData.articleType}
            onChange={(e) => handleInputChange('articleType', e.target.value)}
            placeholder="Blogtext, Fachartikel, Kategorietext, Landingpage, etc."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="wordCount">Wortanzahl *</Label>
          <Input
            id="wordCount"
            type="number"
            value={formData.wordCount}
            onChange={(e) => handleInputChange('wordCount', e.target.value)}
            placeholder="800"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="writingStyle">Schreibstil (optional)</Label>
          <Input
            id="writingStyle"
            value={formData.writingStyle}
            onChange={(e) => handleInputChange('writingStyle', e.target.value)}
            placeholder="emotional, werbend, einfach"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetUrl">Ziel-URL (optional)</Label>
          <Input
            id="targetUrl"
            type="url"
            value={formData.targetUrl}
            onChange={(e) => handleInputChange('targetUrl', e.target.value)}
            placeholder="Die Ziel-URL des Artikels"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetAudience">Zielgruppe (optional)</Label>
          <Input
            id="targetAudience"
            value={formData.targetAudience}
            onChange={(e) => handleInputChange('targetAudience', e.target.value)}
            placeholder="B2B Industrie"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="forbiddenElements">Verbotene Elemente (optional)</Label>
          <Input
            id="forbiddenElements"
            value={formData.forbiddenElements}
            onChange={(e) => handleInputChange('forbiddenElements', e.target.value)}
            placeholder="Tabellen, Fachbegriffe, Zahlen"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="outlineHints">Hinweise für die Outline (optional)</Label>
          <Textarea
            id="outlineHints"
            value={formData.outlineHints}
            onChange={(e) => handleInputChange('outlineHints', e.target.value)}
            placeholder="Layout Wünsche, Strukturvorgabe, etc."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="textHints">Hinweise für den Text (optional)</Label>
          <Textarea
            id="textHints"
            value={formData.textHints}
            onChange={(e) => handleInputChange('textHints', e.target.value)}
            placeholder="Zusätzliche Hinweise?"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exampleTexts">Beispieltexte zur Sprachimmitation (optional)</Label>
          <Textarea
            id="exampleTexts"
            value={formData.exampleTexts}
            onChange={(e) => handleInputChange('exampleTexts', e.target.value)}
            placeholder="Beispieltext von der Website"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="aiOptimization">KI-Optimierung (optional)</Label>
          <Textarea
            id="aiOptimization"
            value={formData.aiOptimization}
            onChange={(e) => handleInputChange('aiOptimization', e.target.value)}
            placeholder="Frage an das Sprachmodell"
            rows={3}
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        disabled={isLoading}
      >
        <Send className="h-4 w-4" />
        {isLoading ? "Wird gesendet..." : "Artikel erstellen"}
      </Button>
      </form>
    </div>
  );
};

export default ArticleGenerationForm;
