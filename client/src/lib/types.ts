export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface WeatherData {
  temperature_2m: number;
  relative_humidity_2m: number;
  precipitation: number;
  precipitation_sum: number;
  isFallback?: boolean;
}

export interface Advisory {
  id: string;
  field_id: string;
  irrigation_plan: string;
  fertilizer_plan: Array<{ name: string; dosage: string; timing: string }>;
  risk_level: 'low' | 'medium' | 'high';
  risk_notes: string;
  cost_of_inaction: string;
  plan_drift_detected: boolean;
  drift_explanation?: string | null;
  next_check_in: string;
  created_at: string;
  treatment_logs?: TreatmentLog[];
}

export interface Field {
  id: string;
  user_id: string;
  crop_type: string;
  sowing_date: string;
  soil_type: string;
  location: string;
  latitude: string;
  longitude: string;
  acreage: string;
  created_at: string;
  updated_at: string;
  latestAdvisory?: Advisory;
  weather?: WeatherData;
}

export interface TreatmentLog {
  id: string;
  advisory_id: string;
  action_taken: string;
  status: 'done' | 'skipped';
  farmer_note?: string | null;
  done_at: string;
}

export interface ChatMessage {
  id: string;
  field_id: string;
  role: 'user' | 'assistant';
  message: string;
  image_url?: string | null;
  created_at: string;
}
