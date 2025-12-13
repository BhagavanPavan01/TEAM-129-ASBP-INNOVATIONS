-- Create alerts table to store disaster alerts
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location TEXT NOT NULL,
  disaster_type TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  latitude DECIMAL(10, 6),
  longitude DECIMAL(10, 6),
  weather_data JSONB,
  ai_prediction JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weather_data table for historical tracking
CREATE TABLE public.weather_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  temperature DECIMAL(5, 2),
  humidity INTEGER,
  wind_speed DECIMAL(6, 2),
  visibility DECIMAL(6, 2),
  condition TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create risk_predictions table for AI predictions history
CREATE TABLE public.risk_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location TEXT NOT NULL,
  disaster_type TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  confidence DECIMAL(5, 2),
  prediction_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public read for alerts)
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_predictions ENABLE ROW LEVEL SECURITY;

-- RLS policies - public read access for all tables
CREATE POLICY "Anyone can view alerts" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Anyone can view weather_data" ON public.weather_data FOR SELECT USING (true);
CREATE POLICY "Anyone can view risk_predictions" ON public.risk_predictions FOR SELECT USING (true);

-- Service role can insert/update (for edge functions)
CREATE POLICY "Service can insert alerts" ON public.alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can update alerts" ON public.alerts FOR UPDATE USING (true);
CREATE POLICY "Service can insert weather_data" ON public.weather_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can insert risk_predictions" ON public.risk_predictions FOR INSERT WITH CHECK (true);

-- Enable realtime for alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();