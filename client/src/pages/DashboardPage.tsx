import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { Field } from '../lib/types';
import { Link } from 'react-router-dom';
import { MandiPriceWidget } from '../components/MandiPriceWidget';
import { DarkDatePicker } from '../components/DarkDatePicker';
import {
  Sprout,
  Plus,
  MapPin,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Thermometer,
  CloudRain,
  Trash2,
  AlertCircle,
  X,
  Activity,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Wheat,
  Leaf,
  ArrowRight,
  Search
} from 'lucide-react';

interface FormErrors {
  crop_type?: string;
  sowing_date?: string;
  soil_type?: string;
  location?: string;
  acreage?: string;
  general?: string;
}

function renderCropIcon(cropType: string) {
  const lower = cropType.toLowerCase();
  if (lower.includes('wheat') || lower.includes('paddy') || lower.includes('rice')) {
    return <Wheat className="w-6 h-6 text-amber-600" />;
  }
  if (lower.includes('cotton') || lower.includes('chilli') || lower.includes('pepper')) {
    return <Leaf className="w-6 h-6 text-emerald-600" />;
  }
  return <Sprout className="w-6 h-6 text-emerald-600" />;
}

function getDaysElapsed(sowingDate: string): number {
  const diff = Date.now() - new Date(sowingDate).getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

function getGrowthPhase(days: number): { name: string; progress: number } {
  if (days < 15) return { name: 'Germination & Seedling', progress: Math.min(100, Math.round((days / 15) * 100)) };
  if (days < 45) return { name: 'Vegetative Growth', progress: Math.min(100, Math.round(((days - 15) / 30) * 100)) };
  if (days < 75) return { name: 'Flowering & Fruit Initiation', progress: Math.min(100, Math.round(((days - 45) / 30) * 100)) };
  return { name: 'Maturation & Harvest Ready', progress: 100 };
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hero Slide Index (0: Decode Image 3, 1: We Compute Image 2, 2: Ask Your Fields Image 1)
  const [currentSlide, setCurrentSlide] = useState(0);

  // New field modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cropType, setCropType] = useState('Chilli');
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [soilType, setSoilType] = useState('Black Cotton Soil');
  const [location, setLocation] = useState('Warangal, Telangana');
  const [acreage, setAcreage] = useState('4.5');
  const [creating, setCreating] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Deleting field state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const DEMO_FIELD: Field = {
    id: '5356dc2b-ab86-46e7-9727-bee2804293f4',
    user_id: 'demo_user_1',
    crop_type: 'Chilli',
    sowing_date: new Date().toISOString().split('T')[0],
    soil_type: 'Black Cotton Soil',
    location: 'Warangal, Telangana',
    latitude: '17.9784',
    longitude: '79.5941',
    acreage: '4.5',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    latestAdvisory: {
      id: 'demo_adv_1',
      field_id: '5356dc2b-ab86-46e7-9727-bee2804293f4',
      irrigation_plan: 'Apply 15-20mm scheduled drip irrigation every 3 days. Current soil humidity: 61%.',
      fertilizer_plan: [
        { name: 'NPK 19:19:19', timing: 'Apply at 07:00 AM after light watering', dosage: '68 kg' },
        { name: 'Calcium Nitrate & Boron', timing: 'Apply post-rain at 07:00 AM', dosage: '25 kg' }
      ],
      risk_level: 'low',
      risk_notes: 'Favorable microclimate for vegetative growth.',
      cost_of_inaction: 'Minimal risk under current telemetry.',
      plan_drift_detected: false,
      next_check_in: '2026-10-03',
      created_at: new Date().toISOString()
    },
    weather: {
      temperature_2m: 31.9,
      relative_humidity_2m: 57,
      precipitation: 0,
      precipitation_sum: 0
    }
  };

  const fetchFields = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ fields: Field[] }>('/fields');
      setFields(data.fields && data.fields.length > 0 ? data.fields : [DEMO_FIELD]);
    } catch (err: any) {
      console.warn('Backend unavailable, loading demo field telemetry:', err.message);
      setFields([DEMO_FIELD]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  // Auto-slide hero banner every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!cropType.trim()) {
      errors.crop_type = 'Crop type is required';
    }
    if (!sowingDate.trim()) {
      errors.sowing_date = 'Sowing date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(sowingDate)) {
      errors.sowing_date = 'Sowing date must be YYYY-MM-DD';
    }
    if (!soilType.trim()) {
      errors.soil_type = 'Soil type is required';
    }
    if (!location.trim()) {
      errors.location = 'Location or District is required';
    }
    if (!acreage || isNaN(parseFloat(acreage)) || parseFloat(acreage) <= 0) {
      errors.acreage = 'Acreage must be a positive number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setCreating(true);
    setFormErrors({});

    try {
      await apiFetch<{ field: Field }>('/fields', {
        method: 'POST',
        body: JSON.stringify({
          crop_type: cropType,
          sowing_date: sowingDate,
          soil_type: soilType,
          location: location.trim(),
          acreage: parseFloat(acreage),
        }),
      });

      await fetchFields();
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      setFormErrors({ general: err.message || 'Failed to register field' });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteField = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this field? All advisories and telemetry history will be permanently removed.')) {
      return;
    }

    try {
      setDeletingId(id);
      await apiFetch(`/fields/${id}`, { method: 'DELETE' });
      setFields((prev) => prev.filter((f) => f.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete field');
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setCropType('Chilli');
    setSowingDate(new Date().toISOString().split('T')[0]);
    setSoilType('Black Cotton Soil');
    setLocation('Warangal, Telangana');
    setAcreage('4.5');
    setFormErrors({});
  };

  // Metric stats
  const totalAcreage = fields.reduce((acc, f) => acc + (Number(f.acreage) || 0), 0);
  const highRiskCount = fields.filter((f) => f.latestAdvisory?.risk_level === 'high').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fadein-up">
      {/* ── CROPIN INTERACTIVE HERO BANNER CAROUSEL ── */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[420px] sm:min-h-[460px] flex items-center border border-slate-200">
        
        {/* SLIDE 1: Image 3 Exact Replica - Decode the past, analyze the present... */}
        {currentSlide === 0 && (
          <div className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700 flex items-center p-6 sm:p-12"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(5, 46, 22, 0.88), rgba(6, 78, 59, 0.7)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600')`
            }}>
            {/* Cybernetic Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />
            
            <div className="max-w-2xl relative z-10 text-white space-y-4">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                Decode the past, analyze the present, and predict the future of food with <span className="text-[#84cc16]">Cropin</span>
              </h1>
              <p className="text-slate-100 text-xs sm:text-base font-normal max-w-xl leading-relaxed opacity-95">
                The old sourcing and supply playbook wasn't built for a world of climate and geopolitical volatility. With our predictive and actionable insights, unlock the upcoming season's yield potential and make innovation your new routine.
              </p>
              <div className="pt-3">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="cropin-btn-cyan px-8 py-3.5 text-sm font-bold flex items-center gap-2 shadow-xl"
                >
                  Learn more <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: Image 2 Exact Replica - We compute 10% of world's croppable land */}
        {currentSlide === 1 && (
          <div className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700 flex items-center justify-between p-6 sm:p-12"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.85), rgba(2, 44, 34, 0.75)), url('https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=1600')`
            }}>
            <div className="max-w-xl relative z-10 text-white space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                We compute 10% of world’s croppable land
              </h1>
              <p className="text-slate-200 text-xs sm:text-sm font-normal max-w-lg leading-relaxed">
                Just as Bloomberg decodes balance sheets and income statements for capital markets, Cropin decodes the biological balance sheet of food-agri, helping predict production, supply risks, sustainability, and future value.
              </p>
            </div>

            {/* Signature Floating Lime Badges (Top Right) */}
            <div className="hidden lg:flex flex-col items-end gap-3 z-10">
              <div className="bg-[#84cc16] text-[#022c22] font-black text-sm px-6 py-3 rounded-2xl shadow-xl transform hover:scale-105 transition-transform flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#022c22]" /> 90% + accuracy
              </div>
              <div className="bg-[#84cc16] text-[#022c22] font-black text-sm px-6 py-3 rounded-2xl shadow-xl transform hover:scale-105 transition-transform flex items-center gap-2">
                <Sprout className="w-5 h-5 text-[#022c22]" /> 400 + crops
              </div>
              <div className="bg-[#84cc16] text-[#022c22] font-black text-sm px-6 py-3 rounded-2xl shadow-xl transform hover:scale-105 transition-transform flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#022c22]" /> 10,000 + crop varieties
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: Image 1 Exact Replica - Ask your fields. Get answers you can act on. */}
        {currentSlide === 2 && (
          <div className="absolute inset-0 z-0 bg-[#081c13] transition-all duration-700 flex items-center justify-between p-6 sm:p-12 border-4 border-emerald-900/50">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
            
            <div className="max-w-xl relative z-10 text-white space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-[#4ade80] border border-emerald-500/40">
                <Sparkles className="w-3.5 h-3.5 text-[#4ade80]" /> OrbitAI — Agentic Layer
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Ask your fields.<br />
                <span className="text-[#4ade80]">Get answers you can act on.</span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                OrbitAI, the agentic AI layer for food and agriculture. Grounded in 15 years of verified field data across 100+ countries, and 400+ crops.
              </p>
              <div className="pt-2">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="cropin-btn-cyan px-7 py-3 text-xs sm:text-sm font-extrabold inline-flex items-center gap-2"
                >
                  Read more <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* OrbitAI Mockup Card Preview on Right */}
            <div className="hidden lg:block w-80 bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-2xl relative z-10 text-xs text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> OrbitAI Assistant
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">LIVE ENGINE</span>
              </div>
              <div className="space-y-2">
                <div className="bg-slate-800/80 p-2.5 rounded-xl text-[11px] text-slate-300">
                  Daily Evapotranspiration &amp; NDVI stress analysis ready for warangal chilli plot.
                </div>
                <div className="bg-[#0284c7] text-white p-2.5 rounded-xl text-[11px] font-semibold text-right ml-6">
                  Compare NDVI vs water stress chart for current field.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Carousel Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? 2 : prev - 1))}
          className="absolute left-4 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-all min-h-[44px] min-w-[44px]"
          aria-label="Previous Hero Slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % 3)}
          className="absolute right-4 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-all min-h-[44px] min-w-[44px]"
          aria-label="Next Hero Slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators / Pagination Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all ${
                currentSlide === idx ? 'w-8 bg-[#84cc16]' : 'w-2.5 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── CROPIN ENTERPRISE STATS SUMMARY BAR (WHITE CARDS) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Crop Plots</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-slate-900">{fields.length}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Active</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Cultivated Area</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-emerald-700">{totalAcreage.toFixed(1)}</span>
            <span className="text-xs font-semibold text-slate-600">Acres</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">High Risk Advisory</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className={`text-3xl font-black ${highRiskCount > 0 ? 'text-red-600' : 'text-slate-700'}`}>
              {highRiskCount}
            </span>
            <span className="text-xs font-bold text-slate-500">Plots</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Telemetry Engine</span>
          <div className="flex items-center gap-1.5 mt-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-bold text-slate-900">Open-Meteo Sync</span>
          </div>
        </div>
      </div>

      {/* ── MANDI MARKET INTELLIGENCE TICKER ── */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm">
        <MandiPriceWidget
          cropType={fields[0]?.crop_type || 'Chilli'}
          location={fields[0]?.location || 'Warangal APMC'}
          variant="condensed"
        />
      </div>

      {/* ── MANAGED CROP PLOTS SECTION TITLE BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Sprout className="w-6 h-6 text-emerald-600" /> Managed Crop Plots ({fields.length})
          </h2>
          <p className="text-xs text-slate-600 font-medium">Prioritized by agronomist health risk assessment &amp; schedule</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="cropin-btn-cyan px-5 py-2.5 text-xs font-extrabold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Register Plot
          </button>

          <button
            onClick={fetchFields}
            className="p-2.5 text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shadow-xs"
            title="Refresh Field Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── MANAGED PLOTS GRID (WHITE CARDS) ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-white p-8 rounded-2xl text-center text-red-600 border border-red-200 shadow-sm">
          <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-red-500" />
          <h3 className="text-base font-bold text-slate-800">Telemetry Error</h3>
          <p className="text-xs text-slate-500 mt-1">{error}</p>
        </div>
      ) : fields.length === 0 ? (
        /* Empty State */
        <div className="bg-white p-10 sm:p-14 rounded-2xl text-center border border-slate-200 shadow-sm space-y-5">
          <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
            <Sprout className="w-10 h-10" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="font-bold text-slate-900 text-lg">No Crop Fields Registered</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
              Register your first agricultural plot to start monitoring Open-Meteo weather telemetry, Gemini AI advisories, and crop health schedules.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="cropin-btn-cyan px-7 py-3 text-xs sm:text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Register Your First Plot
            </button>
          </div>
        </div>
      ) : (
        /* Managed Plot White Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => {
            const riskLevel = field.latestAdvisory?.risk_level || 'low';
            const daysElapsed = getDaysElapsed(field.sowing_date);
            const { name: growthPhase, progress } = getGrowthPhase(daysElapsed);
            const icon = renderCropIcon(field.crop_type);
            const nextCheckIn = field.latestAdvisory?.next_check_in || 'Scheduled';

            return (
              <div
                key={field.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Row: Icon, Crop Name, Location, Risk Level Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 shadow-xs">
                        {icon}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-lg tracking-tight leading-snug">
                          {field.crop_type}
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {field.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                        riskLevel === 'high' 
                          ? 'bg-red-50 text-red-700 border-red-200' 
                          : riskLevel === 'medium' 
                          ? 'bg-amber-50 text-amber-700 border-amber-200' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {riskLevel} Risk
                      </span>

                      <button
                        onClick={(e) => handleDeleteField(field.id, e)}
                        disabled={deletingId === field.id}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Delete Plot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Growth Status & Timeline Progress */}
                  <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Crop Growth Stage</span>
                      <span className="font-bold text-emerald-700">
                        Day {daysElapsed} — {growthPhase}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Sown: <strong className="text-slate-800">{field.sowing_date}</strong>
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-amber-700 font-bold">
                        <Activity className="w-3.5 h-3.5 text-amber-600" /> Next Advisory: <strong>{nextCheckIn}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Telemetry Weather Row */}
                  {field.weather && (
                    <div className="mt-3 bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                        <Thermometer className="w-4 h-4 text-amber-600" />
                        <span>{field.weather.temperature_2m}°C</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-cyan-800 font-bold">
                        <CloudRain className="w-4 h-4 text-cyan-600" />
                        <span>{field.weather.relative_humidity_2m}% Humidity</span>
                      </div>
                      <div className="text-slate-600 text-[11px] font-medium">
                        Precip: <strong className="text-slate-900">{field.weather.precipitation_sum}mm</strong>
                      </div>
                    </div>
                  )}

                  {/* Soil & Acreage Specs */}
                  <div className="flex items-center justify-between mt-3 text-xs text-slate-600 px-1">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>Soil: <strong className="text-slate-800 font-semibold">{field.soil_type}</strong></span>
                    </div>
                    <div className="font-mono text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg text-xs">
                      {field.acreage} Acres
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-100">
                  <Link
                    to={`/field/${field.id}`}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors min-h-[48px] shadow-sm"
                  >
                    <span>Open Copilot &amp; Advisory View</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ADD FIELD MODAL (LIGHT THEME) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadein-up">
          <div className="bg-white w-full max-w-lg p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-800">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-200">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-600" /> Register New Plot
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formErrors.general && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-600 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formErrors.general}</span>
              </div>
            )}

            <form onSubmit={handleCreateField} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1.5 font-bold text-xs">
                  1. Crop Type
                </label>
                <input
                  type="text"
                  value={cropType}
                  onChange={(e) => {
                    setCropType(e.target.value);
                    setFormErrors((prev) => ({ ...prev, crop_type: undefined }));
                  }}
                  placeholder="e.g., Chilli, Cotton, Wheat, Paddy, Tomato"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs"
                />
                {formErrors.crop_type && (
                  <p className="text-red-500 text-[11px] mt-1">{formErrors.crop_type}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5 font-bold text-xs">
                  2. Sowing Date
                </label>
                <input
                  type="date"
                  value={sowingDate}
                  onChange={(e) => {
                    setSowingDate(e.target.value);
                    setFormErrors((prev) => ({ ...prev, sowing_date: undefined }));
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold"
                />
                {formErrors.sowing_date && (
                  <p className="text-red-500 text-[11px] mt-1">{formErrors.sowing_date}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5 font-bold text-xs">
                  3. Soil Classification
                </label>
                <input
                  type="text"
                  value={soilType}
                  onChange={(e) => {
                    setSoilType(e.target.value);
                    setFormErrors((prev) => ({ ...prev, soil_type: undefined }));
                  }}
                  placeholder="e.g., Black Cotton Soil, Red Loam, Alluvial"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs"
                />
                {formErrors.soil_type && (
                  <p className="text-red-500 text-[11px] mt-1">{formErrors.soil_type}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5 font-bold text-xs">
                  4. Location / District <span className="text-emerald-600 font-normal">(determines APMC Mandi rates &amp; weather)</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setFormErrors((prev) => ({ ...prev, location: undefined }));
                  }}
                  placeholder="e.g., Warangal, Telangana | Guntur, AP | Khammam | Nizamabad"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs"
                />
                <div className="flex gap-1.5 mt-2 flex-wrap text-[10px]">
                  {['Warangal, Telangana', 'Guntur, Andhra Pradesh', 'Khammam, Telangana', 'Nizamabad, Telangana', 'Kurnool, Andhra Pradesh', 'Nashik, Maharashtra'].map((locChip) => (
                    <button
                      key={locChip}
                      type="button"
                      onClick={() => setLocation(locChip)}
                      className={`px-2.5 py-1 rounded-full border transition-colors font-semibold ${
                        location === locChip
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      + {locChip}
                    </button>
                  ))}
                </div>
                {formErrors.location && (
                  <p className="text-red-500 text-[11px] mt-1">{formErrors.location}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5 font-bold text-xs">
                  5. Plot Area (Acres)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={acreage}
                  onChange={(e) => {
                    setAcreage(e.target.value);
                    setFormErrors((prev) => ({ ...prev, acreage: undefined }));
                  }}
                  placeholder="e.g., 4.5"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs"
                />
                {formErrors.acreage && (
                  <p className="text-red-500 text-[11px] mt-1">{formErrors.acreage}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 min-h-[48px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="cropin-btn-cyan px-7 py-3 text-xs font-extrabold disabled:opacity-50 flex items-center gap-2 min-h-[48px]"
                >
                  {creating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving Plot...
                    </>
                  ) : (
                    'Save Field Plot'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
