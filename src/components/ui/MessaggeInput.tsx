import React, { useState, useRef, useEffect } from 'react';
import { Send, AlertTriangle, Brain, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  location?: string;
  weatherData?: {
    temperature?: number;
    condition?: string;
  };
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  location,
  weatherData 
}) => {
  const [message, setMessage] = useState('');
  const [quickSuggestions] = useState<string[]>([
    "Is there a flood warning in my area?",
    "What should I do during a cyclone?",
    "Check earthquake safety measures",
    "Heatwave precautions needed?",
    "Current weather risk assessment"
  ]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message",
        variant: "destructive"
      });
      return;
    }

    try {
      await onSendMessage(message);
      setMessage('');
      // Focus back on input after sending
      inputRef.current?.focus();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setMessage(suggestion);
    inputRef.current?.focus();
  };

  const analyzeMessageUrgency = (text: string): boolean => {
    if (!text.trim()) return false;
    
    const urgentWords = [
      'emergency', 'help', 'danger', 'urgent', 
      'flood', 'fire', 'trapped', 'injured',
      'dangerous', 'immediate', 'critical'
    ];
    return urgentWords.some(word => text.toLowerCase().includes(word));
  };

  useEffect(() => {
    if (message.trim() && analyzeMessageUrgency(message)) {
      toast({
        title: "⚠️ Urgent keywords detected",
        description: "Our AI will prioritize your message",
        duration: 3000,
      });
    }
  }, [message, toast]);

  const isUrgent = analyzeMessageUrgency(message);

  return (
    <Card className="border-2 border-blue-200 shadow-lg bg-white">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Context Display */}
          {(location || weatherData) && (
            <div className="flex items-center justify-between text-sm bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="flex items-center gap-4">
                {location && (
                  <div className="flex items-center gap-1">
                    <span className="text-blue-600">📍</span>
                    <span className="font-medium text-blue-800">{location}</span>
                  </div>
                )}
                {weatherData?.temperature && (
                  <div className="flex items-center gap-1">
                    <span className="text-orange-500">🌡️</span>
                    <span className="text-orange-700">{weatherData.temperature}°C</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700 font-medium">AI Analysis Ready</span>
              </div>
            </div>
          )}

          {/* Quick Suggestions */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Quick Queries
            </div>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSuggestion(suggestion)}
                  className="text-xs hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Main Input */}
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe your situation, ask about risks, or request safety advice..."
              className={`pr-12 text-base py-6 ${isUrgent ? 'border-red-300 focus-visible:ring-red-500' : ''}`}
              disabled={isLoading}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Button
                size="icon"
                onClick={handleSend}
                disabled={isLoading || !message.trim()}
                className={isUrgent ? 
                  "bg-red-600 hover:bg-red-700 text-white shadow-md" : 
                  "bg-blue-600 hover:bg-blue-700 text-white"
                }
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Status Indicators */}
          {isUrgent && (
            <div className="flex items-center gap-2 text-red-600 text-sm font-medium animate-pulse">
              <AlertTriangle className="h-4 w-4" />
              <span>Urgent message detected - High priority response</span>
            </div>
          )}

          {/* Helper Text */}
          <div className="text-sm text-gray-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div className="flex items-center gap-2">
              Press 
              <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 text-xs font-mono">
                Enter
              </kbd> 
              to send • 
              <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 text-xs font-mono">
                Shift + Enter
              </kbd>
              for new line
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Low Risk</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span>Medium Risk</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>High Risk</span>
              </span>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
            >
              <Upload className="h-4 w-4 mr-2" />
              Add Location
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Attach Photo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageInput;