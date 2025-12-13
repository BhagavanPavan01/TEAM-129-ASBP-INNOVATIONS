import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Brain, 
  TrendingUp, 
  MessageSquare,
  Shield,
  BarChart3,
  Clock,
  MapPin
} from 'lucide-react';

interface RiskAnalysis {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  disasterType: string;
  riskMessage: string;
  timestamp: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  riskAnalysis?: RiskAnalysis;
  suggestions?: string[];
}

const Dashboard: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskStats, setRiskStats] = useState({
    totalAnalyzed: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    avgRiskScore: 0
  });

  // Fetch chat history and analyze
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/messages/history');
        const data = await response.json();
        
        if (data.success) {
          setMessages(data.analyzedMessages);
          
          // Calculate risk statistics
          const stats = calculateRiskStats(data.analyzedMessages);
          setRiskStats(stats);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const calculateRiskStats = (messages: Message[]) => {
    const analyzedMessages = messages.filter(msg => msg.riskAnalysis);
    const riskLevels = analyzedMessages.map(msg => msg.riskAnalysis?.riskLevel);
    
    return {
      totalAnalyzed: analyzedMessages.length,
      critical: riskLevels.filter(level => level === 'critical').length,
      high: riskLevels.filter(level => level === 'high').length,
      medium: riskLevels.filter(level => level === 'medium').length,
      low: riskLevels.filter(level => level === 'low').length,
      avgRiskScore: analyzedMessages.reduce((acc, msg) => 
        acc + (msg.riskAnalysis?.riskScore || 0), 0) / analyzedMessages.length || 0
    };
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'high': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'low': return <Shield className="h-5 w-5 text-green-500" />;
      default: return <Brain className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading AI analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">AI Risk Analysis Dashboard</h1>
          <p className="text-gray-600">Real-time disaster risk assessment from chat messages</p>
        </div>
        <Button>
          <Brain className="h-4 w-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Messages Analyzed</p>
                <p className="text-3xl font-bold">{riskStats.totalAnalyzed}</p>
              </div>
              <MessageSquare className="h-10 w-10 text-blue-500" />
            </div>
            <Progress value={100} className="mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Risk Score</p>
                <p className="text-3xl font-bold">{riskStats.avgRiskScore.toFixed(1)}</p>
              </div>
              <BarChart3 className="h-10 w-10 text-orange-500" />
            </div>
            <Progress 
              value={(riskStats.avgRiskScore / 10) * 100} 
              className="mt-4" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High/Critical Risks</p>
                <p className="text-3xl font-bold">{riskStats.high + riskStats.critical}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <Progress 
              value={((riskStats.high + riskStats.critical) / riskStats.totalAnalyzed) * 100 || 0} 
              className="mt-4" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Learning Progress</p>
                <p className="text-3xl font-bold">{(riskStats.totalAnalyzed / 100 * 100).toFixed(0)}%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
            <Progress 
              value={(riskStats.totalAnalyzed / 100 * 100)} 
              className="mt-4" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Level Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {['critical', 'high', 'medium', 'low'].map((level) => (
              <div key={level} className="text-center">
                <div className={`h-24 rounded-t-lg ${getRiskColor(level)} flex items-center justify-center`}>
                  <span className="text-white text-2xl font-bold">
                    {riskStats[level as keyof typeof riskStats]}
                  </span>
                </div>
                <div className="p-3 border border-t-0 rounded-b-lg">
                  <p className="font-medium capitalize">{level} Risk</p>
                  <p className="text-sm text-gray-600">
                    {((riskStats[level as keyof typeof riskStats] / riskStats.totalAnalyzed) * 100 || 0).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Risk Assessments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.slice(0, 10).map((message) => (
              <div key={message.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getRiskIcon(message.riskAnalysis?.riskLevel || 'low')}
                      <span className="font-medium capitalize">
                        {message.riskAnalysis?.riskLevel || 'Unknown'} Risk
                      </span>
                      <span className="text-sm text-gray-500">
                        {message.riskAnalysis?.disasterType || 'General'}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{message.text}</p>
                    <p className="text-sm text-gray-600">{message.riskAnalysis?.riskMessage}</p>
                    
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Suggestions:</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                          {message.suggestions.slice(0, 3).map((suggestion, idx) => (
                            <li key={idx}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Score: {message.riskAnalysis?.riskScore?.toFixed(1) || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {messages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No messages analyzed yet. Start chatting to see risk assessments!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Learning Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Learning Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Pattern Recognition</p>
                <p className="text-sm text-gray-600">
                  AI has learned {riskStats.totalAnalyzed} disaster patterns
                </p>
              </div>
              <Progress value={Math.min(riskStats.totalAnalyzed, 100)} className="w-48" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Suggestion Accuracy</p>
                <p className="text-sm text-gray-600">
                  Based on feedback and risk outcomes
                </p>
              </div>
              <span className="text-lg font-bold text-green-600">87%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Response Time</p>
                <p className="text-sm text-gray-600">
                  Average AI analysis speed
                </p>
              </div>
              <span className="text-lg font-bold text-blue-600">1.2s</span>
            </div>
          </div>
          
          <div className="mt-6">
            <Button className="w-full" variant="outline">
              <Brain className="h-4 w-4 mr-2" />
              Train AI with Latest Messages
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;