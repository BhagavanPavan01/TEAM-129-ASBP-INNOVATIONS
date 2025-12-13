import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertCircle, Upload, MapPin, Users } from 'lucide-react';
// import axios from '../axios';


// CORRECT WAY to import axios (CommonJS syntax)

// Use it like this:
// const response = await axios.get('https://api.openweathermap.org/data/2.5/weather?q=Delhi,IN&units=metric&appid=933bc4201cb857eb6f56469e34f9b133');

interface RiskReportFormProps {
  onReportSubmitted?: (reportId: string) => void;
  defaultCity?: string;
}

export default function RiskReportForm({ onReportSubmitted, defaultCity = '' }: RiskReportFormProps) {
  const [formData, setFormData] = useState({
    location: {
      city: defaultCity,
      state: '',
      coordinates: { lat: 0, lon: 0 }
    },
    risk_type: 'flood',
    risk_level: 'medium',
    description: '',
    evidence: [] as string[],
    people_affected: 0,
    property_damage: 'none',
    immediate_actions_taken: [] as string[],
    help_needed: [] as string[],
    contact_number: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [reportId, setReportId] = useState('');
  
  // Get user's location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              coordinates: {
                lat: position.coords.latitude,
                lon: position.coords.longitude
              }
            }
          }));
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  };
  
  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof formData],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };
  
  const handleArrayField = (field: string, value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field as keyof typeof formData] as string[], value]
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/risks/report', {
        userId: `user_${Date.now()}`,
        ...formData
      });
      
      if (response.data.success) {
        setSubmitSuccess(true);
        setReportId(response.data.report_id);
        if (onReportSubmitted) {
          onReportSubmitted(response.data.report_id);
        }
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData({
            location: { city: defaultCity, state: '', coordinates: { lat: 0, lon: 0 } },
            risk_type: 'flood',
            risk_level: 'medium',
            description: '',
            evidence: [],
            people_affected: 0,
            property_damage: 'none',
            immediate_actions_taken: [],
            help_needed: [],
            contact_number: ''
          });
          setSubmitSuccess(false);
        }, 3000);
      }
    } catch (error: any) {
      setSubmitError(error.response?.data?.error || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="text-red-500" />
          Report Disaster Risk
        </CardTitle>
        <p className="text-sm text-gray-500">
          Help others by reporting potential disaster risks in your area
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Section */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <Input
                  value={formData.location.city}
                  onChange={(e) => handleInputChange('location.city', e.target.value)}
                  placeholder="Enter city name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <Input
                  value={formData.location.state}
                  onChange={(e) => handleInputChange('location.state', e.target.value)}
                  placeholder="Enter state"
                />
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
            >
              Use My Current Location
            </Button>
          </div>
          
          {/* Risk Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">Risk Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Risk Type *</label>
                <Select
                  value={formData.risk_type}
                  onValueChange={(value) => handleInputChange('risk_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flood">Flood</SelectItem>
                    <SelectItem value="earthquake">Earthquake</SelectItem>
                    <SelectItem value="cyclone">Cyclone/Storm</SelectItem>
                    <SelectItem value="heatwave">Heatwave</SelectItem>
                    <SelectItem value="landslide">Landslide</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Risk Level *</label>
                <Select
                  value={formData.risk_level}
                  onValueChange={(value) => handleInputChange('risk_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what you're observing..."
                rows={4}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Be specific about what you see, hear, or feel
              </p>
            </div>
          </div>
          
          {/* Impact Assessment */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              Impact Assessment
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">People Affected</label>
                <Input
                  type="number"
                  value={formData.people_affected}
                  onChange={(e) => handleInputChange('people_affected', parseInt(e.target.value) || 0)}
                  min="0"
                  placeholder="Estimated number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Property Damage</label>
                <Select
                  value={formData.property_damage}
                  onValueChange={(value) => handleInputChange('property_damage', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select damage level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                    <SelectItem value="catastrophic">Catastrophic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Actions & Needs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Immediate Actions Taken</label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add action taken"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleArrayField('immediate_actions_taken', (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    if (input.value.trim()) {
                      handleArrayField('immediate_actions_taken', input.value);
                      input.value = '';
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              {formData.immediate_actions_taken.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.immediate_actions_taken.map((action, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {action}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Help Needed</label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add type of help needed"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleArrayField('help_needed', (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    if (input.value.trim()) {
                      handleArrayField('help_needed', input.value);
                      input.value = '';
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              {formData.help_needed.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.help_needed.map((help, index) => (
                    <span key={index} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      {help}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Contact Number (Optional)</label>
              <Input
                value={formData.contact_number}
                onChange={(e) => handleInputChange('contact_number', e.target.value)}
                placeholder="For emergency services to contact you"
              />
            </div>
          </div>
          
          {/* Submit Section */}
          <div className="space-y-4">
            {submitError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md">
                {submitError}
              </div>
            )}
            
            {submitSuccess && (
              <div className="bg-green-50 text-green-700 p-3 rounded-md">
                ✅ Report submitted successfully! Report ID: {reportId}
              </div>
            )}
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Submitting Report...' : 'Submit Risk Report'}
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              By submitting, you agree that this information may be shared with emergency services
              and disaster response teams.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}