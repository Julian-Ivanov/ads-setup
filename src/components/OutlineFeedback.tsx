import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Send, ArrowLeft, FileText } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

interface OutlineFeedbackProps {
  outline: string;
  resumeUrl: string;
  onBack: () => void;
  onFeedbackSent: () => void;
}

const OutlineFeedback = ({ outline, resumeUrl, onBack, onFeedbackSent }: OutlineFeedbackProps) => {
  const [feedback, setFeedback] = useState('');
  const [editedOutline, setEditedOutline] = useState(outline);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update editedOutline when outline prop changes (e.g., after feedback submission)
  useEffect(() => {
    console.log('OutlineFeedback: Outline prop changed, updating editedOutline:', outline);
    setEditedOutline(outline);
    // Clear feedback when new outline content arrives
    setFeedback('');
  }, [outline]);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height to scrollHeight to fit content
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [editedOutline]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmitFeedback called - starting submission');
    setIsSubmitting(true);
    
    // Start loading animation immediately
    onFeedbackSent();

    try {
      console.log('Making API call to submit feedback...');
      const response = await fetch(`${API_BASE_URL}/api/submit-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeUrl,
          feedback,
          editedOutline,
        }),
      });

      console.log('API response received:', response.status, response.ok);
      if (response.ok) {
        toast({
          title: "Feedback gesendet!",
          description: "Ihr Feedback wurde an den Workflow weitergeleitet.",
        });
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Fehler",
        description: "Feedback konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
      // Reset state on error - this will show the feedback form again
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Artikel-Outline
        </h2>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Generierte Artikel-Outline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <Label htmlFor="outline">Artikel-Outline (bearbeitbar)</Label>
            <Textarea
              ref={textareaRef}
              id="outline"
              value={editedOutline}
              onChange={(e) => setEditedOutline(e.target.value)}
              className="min-h-[200px] resize-none overflow-hidden"
              placeholder="Hier kannst du die Outline bearbeiten..."
            />
          </div>

          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">
                Dein Feedback zur Outline *
              </Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Gib hier dein Feedback zur Outline ein. Was gefällt dir? Was sollte geändert werden?"
                rows={4}
                className="resize-none"
                required
              />
            </div>

            <div className="flex gap-3">
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2"
                disabled={isSubmitting}
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Wird gesendet..." : "Feedback senden"}
              </Button>
              

            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OutlineFeedback;
