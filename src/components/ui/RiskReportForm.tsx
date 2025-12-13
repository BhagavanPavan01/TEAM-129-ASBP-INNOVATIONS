import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, MapPin, Users } from 'lucide-react';
import axios from 'axios';

interface RiskReportFormProps {
  onReportSubmitted?: (reportId: string) => void;
  defaultCity?: string;
}

// Type for form data
interface FormDataType {
  location: {
    city: string;
    state: string;
    coordinates: { lat: number; lon: number };
  };
  risk_type: string;
  risk_level: string;
  description: string;
  evidence: string[];
  people_affected: number;
  property_damage: string;
  immediate_actions_taken: string[];
  help_needed: string[];
  contact_number: string;
}

export default function RiskReportForm({ onReportSubmitted, defaultCity = '' }: RiskReportFormProps) {
  const [formData, setFormData] = useState<FormDataType>({
    location: {
      city: defaultCity,
      state: '',
      coordinates: { lat: 0, lon: 0 }
    },
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
  
  // Handle input changes
  const handleInputChange = (field: keyof FormDataType, value: any) => {
    if (field === 'location' && typeof value === 'object') {
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, ...value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle nested location changes
  const handleLocationChange = (field: keyof FormDataType['location'], value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };
  
  // Handle array fields
  const handleArrayField = (field: keyof FormDataType, value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value]
      }));
    }
  };

  // Remove item from array
  const removeArrayItem = (field: keyof FormDataType, index: number) => {
    setFormData(prev => {
      const newArray = [...(prev[field] as string[])];
      newArray.splice(index, 1);
      return {
        ...prev,
        [field]: newArray
      };
    });
  };
  
  // Submit form using axios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.location.city.trim()) {
      setSubmitError('City is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setSubmitError('Description is required');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // IMPORTANT: First make sure backend is running at this URL
      const response = await axios.post('http://localhost:5000/api/report', {
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
            location: { 
              city: defaultCity, 
              state: '', 
              coordinates: { lat: 0, lon: 0 } 
            },
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
      } else {
        setSubmitError(response.data.error || 'Failed to submit report');
      }
    } catch (error: any) {
      // Handle axios errors
      if (error.response) {
        // Server responded with error
        setSubmitError(error.response.data?.error || 'Server error occurred');
      } else if (error.request) {
        // No response received - backend is not running
        setSubmitError('Cannot connect to backend server. Make sure it is running at http://localhost:5000');
      } else {
        // Request setup error
        setSubmitError('Error setting up request: ' + error.message);
      }
      console.error('Submission error:', error);
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
                  onChange={(e) => handleLocationChange('city', e.target.value)}
                  placeholder="Enter city name"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <Input
                  value={formData.location.state}
                  onChange={(e) => handleLocationChange('state', e.target.value)}
                  placeholder="Enter state"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              Coordinates: {formData.location.coordinates.lat.toFixed(4)}, {formData.location.coordinates.lon.toFixed(4)}
            </div>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
              disabled={isSubmitting}
            >
              <MapPin className="w-4 h-4 mr-2" />
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Property Damage</label>
                <Select
                  value={formData.property_damage}
                  onValueChange={(value) => handleInputChange('property_damage', value)}
                  disabled={isSubmitting}
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
                      e.preventDefault();
                      const target = e.target as HTMLInputElement;
                      if (target.value.trim()) {
                        handleArrayField('immediate_actions_taken', target.value);
                        target.value = '';
                      }
                    }
                  }}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                    if (input.value.trim()) {
                      handleArrayField('immediate_actions_taken', input.value);
                      input.value = '';
                    }
                  }}
                  disabled={isSubmitting}
                >
                  Add
                </Button>
              </div>
              {formData.immediate_actions_taken.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.immediate_actions_taken.map((action, index) => (
                    <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      <span>{action}</span>
                      <button
                        type="button"
                        onClick={() => removeArrayItem('immediate_actions_taken', index)}
                        className="text-blue-600 hover:text-blue-800"
                        disabled={isSubmitting}
                      >
                        ×
                      </button>
                    </div>
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
                      e.preventDefault();
                      const target = e.target as HTMLInputElement;
                      if (target.value.trim()) {
                        handleArrayField('help_needed', target.value);
                        target.value = '';
                      }
                    }
                  }}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                    if (input.value.trim()) {
                      handleArrayField('help_needed', input.value);
                      input.value = '';
                    }
                  }}
                  disabled={isSubmitting}
                >
                  Add
                </Button>
              </div>
              {formData.help_needed.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.help_needed.map((help, index) => (
                    <div key={index} className="flex items-center gap-1 bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      <span>{help}</span>
                      <button
                        type="button"
                        onClick={() => removeArrayItem('help_needed', index)}
                        className="text-red-600 hover:text-red-800"
                        disabled={isSubmitting}
                      >
                        ×
                      </button>
                    </div>
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
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          {/* Submit Section */}
          <div className="space-y-4">
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
                <div className="font-medium">Error</div>
                <div>{submitError}</div>
              </div>
            )}
            
            {submitSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md">
                <div className="font-medium">Success!</div>
                <div>Report submitted successfully! Report ID: {reportId}</div>
                <div className="text-sm mt-1">Form will reset in a few seconds...</div>
              </div>
            )}
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting Report...
                </>
              ) : (
                'Submit Risk Report'
              )}
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              By submitting, you agree that this information may be shared with emergency services
              and disaster response teams for faster response.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}