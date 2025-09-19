import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send } from 'lucide-react';

interface SetupWithoutKeywordsFormProps {
  onBack: () => void;
  resumeUrl: string | null;
  onSubmit?: () => void;
  onValidationError?: () => void;
  onError?: (error: string) => void;
}

const SetupWithoutKeywordsForm = ({ onBack, resumeUrl, onSubmit, onValidationError, onError }: SetupWithoutKeywordsFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    kundenname: '',
    kundenwebsite: '',
    keywords: '',
    land: '',
    sprache: '',
    keywordRecherchelimit: '',
    tagesbudget: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const { toast } = useToast();

  const emailOptions = [
    'ann-christin.knue@suchhelden.de',
    'christine.telgen@suchhelden.de',
    'erik.konersmann@suchheldem.de',
    'erik.konersmann@suchhelden.de',
    'jennifer.scholl@suchhelden.de',
    'johanna.krueger@suchhelden.de',
    'laura.knipper@suchhelden.de',
    'leon.mordovski@suchhelden.de',
    'leon.westerheide@suchhelden.de',
    'liesa.sasse@suchhelden.de',
    'linnart.knop@suchhelden.de',
    'malte.hundertmark@suchhelden.de',
    'melissa.jaehnke@suchhelden.de',
    'nathalie.waltring@suchhelden.de',
    'oliver.furman@suchhelden.de',
    'paula.niehoff@suchhelden.de',
    'pia.paasche@suchhelden.de',
    'sabrina.bergmann@suchhelden.de',
    'sophia.grosse-kracht@suchhelden.de',
    'sven.tieneken@suchhelden.de',
    'svenja.steimel@suchhelden.de',
    'tessa.egbert@suchhelden.de',
    'sea@suchhelden.de',
    'chantal.voessing@suchhelden.de'
  ];

  const landOptions = [
    'Germany',
    'Switzerland',
    'Austria'
  ];

  const spracheOptions = [
    'German'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNumberInputChange = (field: string, value: string) => {
    // Only allow positive numbers and empty string
    const numericValue = value.replace(/[^0-9]/g, '');
    setFormData(prev => ({
      ...prev,
      [field]: numericValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Trigger loading state immediately when button is pressed
    if (onSubmit) {
      onSubmit();
    }

    try {
      // Validate required fields
      const requiredFields = ['email', 'kundenname', 'kundenwebsite', 'keywords', 'land', 'sprache', 'keywordRecherchelimit', 'tagesbudget'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
      
      if (missingFields.length > 0) {
        toast({
          title: "Fehlende Felder",
          description: "Bitte fülle alle Pflichtfelder aus.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        if (onValidationError) {
          onValidationError();
        }
        return;
      }

      if (!resumeUrl) {
        toast({
          title: "Fehler",
          description: "Resume URL ist nicht verfügbar. Bitte versuche es erneut.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        if (onValidationError) {
          onValidationError();
        }
        return;
      }

      // Prepare data for submission
      const submissionData = {
        ...formData,
        keywordRecherchelimit: parseInt(formData.keywordRecherchelimit),
        tagesbudget: parseInt(formData.tagesbudget),
        resumeUrl: resumeUrl
      };

      console.log('Submitting form data:', submissionData);
      console.log('Resume URL:', resumeUrl);

      // Send data through backend to avoid CORS issues
      console.log('Sending POST request to backend /api/submit-form');
      console.log('Request body:', JSON.stringify(submissionData, null, 2));
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/submit-form?resumeUrl=${encodeURIComponent(resumeUrl)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        toast({
          title: "Formular erfolgreich gesendet!",
          description: "Ihre Ads-Setup-Anfrage wurde übermittelt.",
        });

        // Reset form
        setFormData({
          email: '',
          kundenname: '',
          kundenwebsite: '',
          keywords: '',
          land: '',
          sprache: '',
          keywordRecherchelimit: '',
          tagesbudget: ''
        });
      } else {
        console.error('Response error:', responseData);
        throw new Error(`HTTP error! status: ${response.status} - ${responseData?.error || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      if (onError) {
        onError(`Fehler beim Senden des Formulars: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      } else {
        toast({
          title: "Fehler beim Senden",
          description: "Es ist ein Fehler aufgetreten. Bitte versuche es erneut.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Combobox */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Deine Email (Ablageordner im Drive) <span className="text-red-500">*</span>
          </Label>
          <Popover open={emailOpen} onOpenChange={setEmailOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={emailOpen}
                className="w-full justify-between"
              >
                {formData.email || "Wähle eine Email-Adresse oder tippe eine ein"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput 
                  placeholder="Email-Adresse suchen oder eingeben..." 
                  value={formData.email}
                  onValueChange={(value) => handleInputChange('email', value)}
                />
                <CommandList>
                  <CommandEmpty>Keine Email-Adresse gefunden.</CommandEmpty>
                  <CommandGroup>
                    {emailOptions.map((email) => (
                      <CommandItem
                        key={email}
                        value={email}
                        onSelect={(currentValue) => {
                          handleInputChange('email', currentValue);
                          setEmailOpen(false);
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            formData.email === email ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        {email}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Kundenname */}
        <div className="space-y-2">
          <Label htmlFor="kundenname" className="text-sm font-medium">
            Kundenname <span className="text-red-500">*</span>
          </Label>
          <Input
            id="kundenname"
            type="text"
            value={formData.kundenname}
            onChange={(e) => handleInputChange('kundenname', e.target.value)}
            placeholder="Name des Kunden"
            required
          />
        </div>

        {/* Kundenwebsite */}
        <div className="space-y-2">
          <Label htmlFor="kundenwebsite" className="text-sm font-medium">
            Kundenwebsite <span className="text-red-500">*</span>
          </Label>
          <Input
            id="kundenwebsite"
            type="url"
            value={formData.kundenwebsite}
            onChange={(e) => handleInputChange('kundenwebsite', e.target.value)}
            placeholder="z.B. https://suchhelden.de"
            required
          />
        </div>

        {/* Keywords */}
        <div className="space-y-2">
          <Label htmlFor="keywords" className="text-sm font-medium">
            Keywords <span className="text-red-500">*</span>
          </Label>
          <Input
            id="keywords"
            type="text"
            value={formData.keywords}
            onChange={(e) => handleInputChange('keywords', e.target.value)}
            placeholder="Mit Komma getrennt voneinander!"
            required
          />
        </div>

        {/* Land */}
        <div className="space-y-2">
          <Label htmlFor="land" className="text-sm font-medium">
            Land <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.land} onValueChange={(value) => handleInputChange('land', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Wähle ein Land" />
            </SelectTrigger>
            <SelectContent>
              {landOptions.map((land) => (
                <SelectItem key={land} value={land}>
                  {land}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sprache */}
        <div className="space-y-2">
          <Label htmlFor="sprache" className="text-sm font-medium">
            Sprache <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.sprache} onValueChange={(value) => handleInputChange('sprache', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Wähle eine Sprache" />
            </SelectTrigger>
            <SelectContent>
              {spracheOptions.map((sprache) => (
                <SelectItem key={sprache} value={sprache}>
                  {sprache}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Keyword Recherchelimit */}
        <div className="space-y-2">
          <Label htmlFor="keywordRecherchelimit" className="text-sm font-medium">
            Keyword Recherchelimit <span className="text-red-500">*</span>
          </Label>
          <Input
            id="keywordRecherchelimit"
            type="number"
            value={formData.keywordRecherchelimit}
            onChange={(e) => handleNumberInputChange('keywordRecherchelimit', e.target.value)}
            placeholder="Extra Keywords pro gegebenem Keyword"
            min="0"
            required
          />
        </div>

        {/* Tagesbudget */}
        <div className="space-y-2">
          <Label htmlFor="tagesbudget" className="text-sm font-medium">
            Tagesbudget <span className="text-red-500">*</span>
          </Label>
          <Input
            id="tagesbudget"
            type="number"
            value={formData.tagesbudget}
            onChange={(e) => handleNumberInputChange('tagesbudget', e.target.value)}
            placeholder="200"
            min="0"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Wird gesendet...' : 'Setup generieren'}
            <Send className="h-4 w-4" />
          </Button>
        </div>

      </form>
    </div>
  );
};

export default SetupWithoutKeywordsForm;
