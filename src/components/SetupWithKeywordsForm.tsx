import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Check, ChevronsUpDown, Upload, Send, ZoomIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SetupWithKeywordsFormProps {
  onBack: () => void;
  resumeUrl: string | null;
  onSubmit?: () => void;
  onValidationError?: () => void;
  onError?: (error: string) => void;
}

const SetupWithKeywordsForm = ({ onBack, resumeUrl, onSubmit, onValidationError, onError }: SetupWithKeywordsFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    kundenname: '',
    kundenwebsite: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.name.endsWith('.xlsx')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Ungültiger Dateityp",
          description: "Bitte wähle eine .xlsx Datei aus.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Start loading animation immediately
    if (onSubmit) {
      onSubmit();
    }

    try {
      // Validate required fields
      const requiredFields = ['email', 'kundenname', 'kundenwebsite'];
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

      if (!selectedFile) {
        toast({
          title: "Datei erforderlich",
          description: "Bitte wähle eine .xlsx Datei aus.",
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

      // Prepare form data for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('kundenname', formData.kundenname);
      formDataToSend.append('kundenwebsite', formData.kundenwebsite);
      formDataToSend.append('file', selectedFile);

      console.log('Submitting form data:', formData);
      console.log('Selected file:', selectedFile.name);
      console.log('Resume URL:', resumeUrl);

      // Send data through backend
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/submit-form?resumeUrl=${encodeURIComponent(resumeUrl)}`, {
        method: 'POST',
        body: formDataToSend,
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
          kundenwebsite: ''
        });
        setSelectedFile(null);
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
            Email <span className="text-red-500">*</span>
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

        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="file" className="text-sm font-medium">
            Vorlage <span className="text-red-500">*</span>
          </Label>
          <div className="flex items-center gap-4">
            <Input
              id="file"
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="h-12 file:mr-4 file:py-3 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Upload className="h-4 w-4" />
                {selectedFile.name}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500">Nur .xlsx Dateien sind erlaubt</p>
        </div>

        {/* Wichtiger Hinweis */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <h3 className="text-sm font-semibold text-amber-800">Wichtiger Hinweis</h3>
          </div>
          <p className="text-sm text-amber-700">
            Damit der Workflow korrekt funktioniert, muss die Excel-Datei im richtigen Standard-Excel-Format vorliegen. 
            Bitte verwende das unten gezeigte Format als Referenz:
          </p>
          <div className="bg-white border border-amber-200 rounded-md p-3">
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative cursor-pointer group">
                  <img 
                    src="/excel-format-reference.png" 
                    alt="Excel Format Referenz" 
                    className="w-full h-auto rounded border transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded border flex items-center justify-center">
                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                <img 
                  src="/excel-format-reference.png" 
                  alt="Excel Format Referenz - Vergrößert" 
                  className="w-full h-auto rounded"
                />
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-xs text-amber-600">
            Jede Spalte in der Excel-Datei muss eine Variable enthalten. Das Format sollte strukturiert sein 
            mit klaren Spaltenüberschriften und entsprechenden Datenwerten in jeder Zeile.
          </p>
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
            type="text"
            value={formData.kundenwebsite}
            onChange={(e) => handleInputChange('kundenwebsite', e.target.value)}
            placeholder="Domain oder Website des Kunden"
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

export default SetupWithKeywordsForm;
