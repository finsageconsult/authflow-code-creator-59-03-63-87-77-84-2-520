import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useEncryptedQuestionnaire, type QuestionnaireData } from '@/hooks/useEncryptedQuestionnaire';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';

export const SecureQuestionnaireForm = () => {
  const { saveEncryptedResponse, loading } = useEncryptedQuestionnaire();
  const { toast } = useToast();
  const [showEncryptionInfo, setShowEncryptionInfo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [responses, setResponses] = useState({
    // Personal Concerns (Sensitive - Encrypted)
    personalChallenges: [] as string[],
    confidentialNotes: '',
    seekingHelp: '',
    
    // Demographic (Non-identifying)
    ageRange: '',
    experienceLevel: '',
    preferredLearningStyle: ''
  });

  const personalChallengeOptions = [
    'debt_management',
    'career_transition',
    'family_financial_planning',
    'retirement_planning',
    'emergency_fund',
    'investment_anxiety',
    'financial_communication',
    'other'
  ];

  const handlePersonalChallengeChange = (challenge: string, checked: boolean) => {
    setResponses(prev => ({
      ...prev,
      personalChallenges: checked
        ? [...prev.personalChallenges, challenge]
        : prev.personalChallenges.filter(c => c !== challenge)
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      const questionnaireData: QuestionnaireData = {
        responses: responses,
        metadata: {
          completed_at: new Date().toISOString(),
          version: '1.0',
          ip_address: await getUserIP()
        }
      };

      const { error } = await saveEncryptedResponse(questionnaireData);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to save questionnaire responses",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Questionnaire Submitted",
        description: "Your responses have been securely encrypted and saved",
      });

      // Reset form
      setResponses({
        personalChallenges: [],
        confidentialNotes: '',
        seekingHelp: '',
        ageRange: '',
        experienceLevel: '',
        preferredLearningStyle: ''
      });

    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Encryption Info Banner */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Secure & Private</p>
                <p className="text-sm text-green-700">
                  Your responses are encrypted and cannot be accessed by HR or administrators
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEncryptionInfo(!showEncryptionInfo)}
            >
              {showEncryptionInfo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          
          {showEncryptionInfo && (
            <div className="mt-4 p-3 bg-white rounded border">
              <h4 className="font-medium mb-2">Privacy & Security Details</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• All sensitive responses are encrypted before storage</li>
                <li>• Only you can decrypt and view your responses</li>
                <li>• HR and administrators cannot access individual answers</li>
                <li>• Data integrity is verified with cryptographic hashes</li>
                <li>• Anonymized insights may be used for organizational reporting</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Assessment</CardTitle>
          <CardDescription>
            Help us understand your personal needs. Your individual responses are private and encrypted.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Encrypted Section */}
          <div className="border-l-4 border-green-500 pl-4 bg-green-50/50 p-4 rounded-r">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Confidential Section (Encrypted)</span>
            </div>

            {/* Personal Challenges */}
            <div className="space-y-3 mb-6">
              <Label>What financial challenges are you currently facing? (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2">
                {personalChallengeOptions.map((challenge) => (
                  <div key={challenge} className="flex items-center space-x-2">
                    <Checkbox
                      id={challenge}
                      checked={responses.personalChallenges.includes(challenge)}
                      onCheckedChange={(checked) => 
                        handlePersonalChallengeChange(challenge, checked as boolean)
                      }
                    />
                    <Label htmlFor={challenge} className="text-sm">
                      {challenge.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Confidential Notes */}
            <div className="space-y-3 mb-6">
              <Label>Additional confidential notes or concerns</Label>
              <Textarea
                value={responses.confidentialNotes}
                onChange={(e) => setResponses(prev => ({ ...prev, confidentialNotes: e.target.value }))}
                placeholder="Share any additional financial concerns or goals in confidence..."
                className="min-h-[100px]"
              />
            </div>

            {/* Seeking Help */}
            <div className="space-y-3">
              <Label>Are you currently seeking professional financial help?</Label>
              <RadioGroup 
                value={responses.seekingHelp} 
                onValueChange={(value) => setResponses(prev => ({ ...prev, seekingHelp: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes_advisor" id="yes_advisor" />
                  <Label htmlFor="yes_advisor">Yes, with a financial advisor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes_therapist" id="yes_therapist" />
                  <Label htmlFor="yes_therapist">Yes, with a financial therapist/coach</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="considering" id="considering" />
                  <Label htmlFor="considering">Considering it</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Demographics (Non-identifying) */}
          <div className="space-y-6">
            <h3 className="font-medium">Demographics (Anonymous)</h3>
            
            <div className="space-y-3">
              <Label>Age Range</Label>
              <RadioGroup 
                value={responses.ageRange} 
                onValueChange={(value) => setResponses(prev => ({ ...prev, ageRange: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="18-25" id="18-25" />
                  <Label htmlFor="18-25">18-25</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="26-35" id="26-35" />
                  <Label htmlFor="26-35">26-35</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="36-45" id="36-45" />
                  <Label htmlFor="36-45">36-45</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="46-55" id="46-55" />
                  <Label htmlFor="46-55">46-55</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="55+" id="55+" />
                  <Label htmlFor="55+">55+</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Preferred Learning Style</Label>
              <RadioGroup 
                value={responses.preferredLearningStyle} 
                onValueChange={(value) => setResponses(prev => ({ ...prev, preferredLearningStyle: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="visual" id="visual" />
                  <Label htmlFor="visual">Visual (charts, infographics)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="audio" id="audio" />
                  <Label htmlFor="audio">Audio (podcasts, webinars)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hands_on" id="hands_on" />
                  <Label htmlFor="hands_on">Hands-on (interactive tools)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="reading" id="reading" />
                  <Label htmlFor="reading">Reading (articles, guides)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={submitting || loading}
            className="w-full"
          >
            {submitting ? "Encrypting & Saving..." : "Submit Secure Assessment"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};