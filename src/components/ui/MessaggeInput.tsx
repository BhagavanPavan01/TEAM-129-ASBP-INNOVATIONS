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
  weatherData?: any;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  location,
  weatherData 
}) => {
  const [message, setMessage] = useState('');
  const [quickSuggestions] = useState([
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

    await onSendMessage(message);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setMessage(suggestion);
    inputRef.current?.focus();
  };

  const analyzeMessageUrgency = (text: string) => {
    const urgentWords = ['emergency', 'help', 'danger', 'flood', 'fire', 'trapped'];
    return urgentWords.some(word => text.toLowerCase().includes(word));
  };

  useEffect(() => {
    if (analyzeMessageUrgency(message)) {
      toast({
        title: "Urgent keywords detected",
        description: "Our AI will prioritize your message",
        variant: "default"
      });
    }
  }, [message]);

  return (
    <Card className="border-2 border-blue-200 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Context Display */}
          {(location || weatherData) && (
            <div className="flex items-center justify-between text-sm bg-blue-50 p-3 rounded-lg">
              <div>
                {location && (
                  <span className="font-medium">📍 {location}</span>
                )}
                {weatherData && (
                  <span className="ml-4">🌡️ {weatherData.temperature}°C</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700">AI Analysis Ready</span>
              </div>
            </div>
          )}

          {/* Quick Suggestions */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Quick Queries
            </div>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSuggestion(suggestion)}
                  className="text-xs"
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
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your situation, ask about risks, or request safety advice..."
              className="pr-12 text-lg py-6"
              disabled={isLoading}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
              <Button
                size="icon"
                onClick={handleSend}
                disabled={isLoading || !message.trim()}
                className={analyzeMessageUrgency(message) ? "bg-red-600 hover:bg-red-700" : ""}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Helper Text */}
          <div className="text-sm text-gray-500 flex justify-between">
            <div>
              Press <kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd> to send
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Low Risk
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                Medium Risk
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                High Risk
              </span>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Upload className="h-4 w-4 mr-2" />
              Add Location
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
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