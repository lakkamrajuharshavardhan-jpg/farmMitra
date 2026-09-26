import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { Field, Advisory, ChatMessage, WeatherData, TreatmentLog } from '../lib/types';
import { CopilotDrawer } from '../components/CopilotDrawer';
import { MandiPriceWidget } from '../components/MandiPriceWidget';
import { FinancialROICard } from '../components/FinancialROICard';
import {
  ArrowLeft,
  Sprout,
  ShieldAlert,
  Droplets,
  FlaskConical,
  AlertTriangle,
  Calendar,
  MapPin,
  Thermometer,
  CloudRain,
  Trash2,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingDown,
  Layers,
  Mic,
  RotateCcw,
  Leaf,
  Wheat,
} from 'lucide-react';

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

export const FieldDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [field, setField] = useState<Field | null>(null);
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [requestingAdvisory, setRequestingAdvisory] = useState(false);
  const [loggingActionId, setLoggingActionId] = useState<string | null>(null);

  // Note dictation state
  const [activeNoteAction, setActiveNoteAction] = useState<{ advisoryId: string; actionTaken: string } | null>(null);
  const [farmerNoteText, setFarmerNoteText] = useState('');

  useEffect(() => {
    async function loadDetails() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await apiFetch<{
          field: Field;
          advisories: Advisory[];
          chat_messages: ChatMessage[];
          weather?: WeatherData;
        }>(`/fields/${id}`);
        setField(data.field);
        setAdvisories(data.advisories);
        setChats(data.chat_messages);
        setWeather(data.weather || null);
      } catch (err: any) {
        console.error('Failed to load field details:', err);
        setError(err.message || 'Access denied or field not found');
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this field and all associated advisories?')) {
      return;
    }

    try {
      setDeleting(true);
      await apiFetch(`/fields/${id}`, { method: 'DELETE' });
      navigate('/');
    } catch (err: any) {
      alert(err.message || 'Failed to delete field');
      setDeleting(false);
    }
  };

  const handleRequestNewAdvisory = async () => {
    if (!id) return;
    try {
      setRequestingAdvisory(true);
      const data = await apiFetch<{ advisory: Advisory }>(`/fields/${id}/advisory`, {
        method: 'POST',
      });
      setAdvisories((prev) => [data.advisory, ...prev]);
    } catch (err: any) {
      alert(err.message || 'Failed to request new advisory');
    } finally {
      setRequestingAdvisory(false);
    }
  };

  const handleRecordTreatment = async (
    advisoryId: string,
    actionTaken: string,
    status: 'done' | 'skipped',
    farmerNote?: string
  ) => {
    if (!id) return;
    const actionKey = `${advisoryId}-${actionTaken}-${status}`;
    try {
      setLoggingActionId(actionKey);
      const res = await apiFetch<{ log: TreatmentLog }>(`/fields/${id}/treatment-logs`, {
        method: 'POST',
        body: JSON.stringify({
          advisory_id: advisoryId,
          action_taken: actionTaken,
          status,
          farmer_note: farmerNote || undefined,
        }),
      });

      setAdvisories((prev) =>
        prev.map((adv) => {
          if (adv.id === advisoryId) {
            const updatedLogs = [res.log, ...(adv.treatment_logs || [])];
            return { ...adv, treatment_logs: updatedLogs };
          }
          return adv;
        })
      );
      setActiveNoteAction(null);
      setFarmerNoteText('');
    } catch (err: any) {
      alert(err.message || 'Failed to record action');
    } finally {
      setLoggingActionId(null);
    }
  };

  const handleNewCopilotMessages = (userMsg: ChatMessage, assistantMsg: ChatMessage) => {
    setChats((prev) => [...prev, userMsg, assistantMsg]);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-emerald-700 space-y-3">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-xs text-slate-600 font-semibold">Ingesting Open-Meteo &amp; Agronomic Telemetry...</p>
      </div>
    );
  }

  if (error || !field) {
    return (
      <div className="bg-white p-8 rounded-3xl text-center max-w-md mx-auto my-12 border border-red-200 shadow-sm">
        <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Access Denied or Field Not Found</h2>
        <p className="text-xs text-slate-600 mt-1">{error}</p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold px-5 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors min-h-[48px]"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Fields
        </Link>
      </div>
    );
  }

  const daysElapsed = getDaysElapsed(field.sowing_date);
  const cropIcon = renderCropIcon(field.crop_type);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-32 sm:pb-36 animate-fadein-up">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Managed Plots
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl border border-red-200 transition-colors min-h-[44px]"
        >
          <Trash2 className="w-4 h-4" /> Delete Plot
        </button>
      </div>

      {/* 1. Top Plot Header Card (Crisp High-Contrast Dark Forest Panel) */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 sm:p-8 rounded-3xl border border-emerald-800/40 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-inner">
              {cropIcon}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{field.crop_type} Plot</h1>
                <span className="text-xs font-black px-3.5 py-1 bg-[#84cc16] text-[#022c22] rounded-full shadow-md">
                  Day {daysElapsed} Post-Sowing
                </span>
              </div>
              <p className="text-xs text-slate-200 font-semibold flex items-center gap-3 mt-2 flex-wrap">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-[#4ade80]" /> <strong className="text-white">{field.location}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-emerald-400" /> Sown: <strong className="text-white">{field.sowing_date}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1"><Layers className="w-4 h-4 text-teal-400" /> Soil: <strong className="text-white">{field.soil_type}</strong></span>
              </p>
            </div>
          </div>

          {/* Live Open-Meteo Weather Badge */}
          {weather && (
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-emerald-500/30 flex items-center gap-5 text-xs shrink-0 justify-around shadow-inner">
              <div className="flex items-center gap-2.5">
                <Thermometer className="w-6 h-6 text-amber-400" />
                <div>
                  <span className="text-[10px] text-slate-300 uppercase block font-bold">Temperature</span>
                  <span className="font-black text-amber-300 text-base">{weather.temperature_2m}°C</span>
                </div>
              </div>

              <div className="w-px h-9 bg-slate-800" />

              <div className="flex items-center gap-2.5">
                <CloudRain className="w-6 h-6 text-cyan-400" />
                <div>
                  <span className="text-[10px] text-slate-300 uppercase block font-bold">Humidity &amp; Rain</span>
                  <span className="font-black text-cyan-300 text-base">
                    {weather.relative_humidity_2m}% ({weather.precipitation_sum}mm)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Primary Action Bar & Title */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-emerald-600" /> Agronomic Advisory &amp; Timeline
          </h2>
          <p className="text-xs text-slate-600 font-semibold">Context-aware Gemini AI engine &amp; Open-Meteo weather telemetry</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleRequestNewAdvisory}
            disabled={requestingAdvisory}
            className="cropin-btn-cyan py-3 px-6 text-xs font-extrabold flex items-center gap-2 disabled:opacity-50 min-h-[48px]"
          >
            {requestingAdvisory ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Requesting Advisory...
              </>
            ) : (
              <>
                <Sparkles className="w-4.5 h-4.5" /> Request New Advisory
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mandi Commodity Intelligence & ROI Calculation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MandiPriceWidget cropType={field.crop_type} location={field.location} variant="full" />
        <FinancialROICard field={field} />
      </div>

      {/* Advisory Stream Stack */}
      {advisories.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl text-center text-slate-600 text-xs border border-slate-200 shadow-sm space-y-3">
          <Sparkles className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">No advisories generated yet</h3>
          <p className="text-slate-600 max-w-md mx-auto font-medium">
            Click "Request New Advisory" above to trigger Gemini context aggregation with live weather and plan drift analysis.
          </p>
        </div>
      ) : (
        advisories.map((advisory, idx) => {
          const isLatest = idx === 0;
          const isHighRisk = advisory.risk_level === 'high';
          const isMedRisk = advisory.risk_level === 'medium';

          return (
            <div
              key={advisory.id}
              className={`bg-white p-6 sm:p-8 rounded-3xl border ${
                isHighRisk 
                  ? 'border-red-300 shadow-red-100/50' 
                  : isMedRisk 
                  ? 'border-amber-300 shadow-amber-100/50' 
                  : 'border-slate-200'
              } shadow-md space-y-6 text-slate-900`}
            >
              {/* Header Badge Row */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  {isLatest && (
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Current Advisory
                    </span>
                  )}
                  <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    isHighRisk 
                      ? 'bg-red-100 text-red-800 border border-red-300' 
                      : isMedRisk 
                      ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {advisory.risk_level} Risk
                  </span>
                </div>

                <span className="text-xs text-slate-700 font-bold flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-600" /> Next Check-in: <strong className="text-slate-900">{advisory.next_check_in}</strong>
                </span>
              </div>

              {/* Plan Drift Warning Banner */}
              {advisory.plan_drift_detected && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900 flex items-start gap-3">
                  <RotateCcw className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-purple-950 text-sm flex items-center gap-1.5 mb-1">
                      Plan Drift Detected &amp; Compensatory Adjustment Active
                    </h4>
                    <p className="text-slate-800 leading-relaxed text-xs font-medium">
                      {advisory.drift_explanation || 'Farmer skipped prior treatments. AI has modified irrigation and fertilizer dosage to compensate for nutritional deficit.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Irrigation Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-cyan-600" /> Irrigation Plan
                  </h4>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRecordTreatment(advisory.id, 'Irrigation Action', 'done')}
                      disabled={loggingActionId === `${advisory.id}-Irrigation Action-done`}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full text-xs flex items-center gap-1.5 transition-colors min-h-[36px] shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Done
                    </button>
                    <button
                      onClick={() => handleRecordTreatment(advisory.id, 'Irrigation Action', 'skipped')}
                      disabled={loggingActionId === `${advisory.id}-Irrigation Action-skipped`}
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-full text-xs flex items-center gap-1.5 transition-colors min-h-[36px] shadow-xs"
                    >
                      <XCircle className="w-4 h-4" /> Skipped
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 text-xs sm:text-sm leading-relaxed font-semibold shadow-inner">
                  {advisory.irrigation_plan}
                </div>
              </div>

              {/* Fertilizer Schedule */}
              <div className="space-y-3">
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-amber-600" /> Fertilizer Schedule
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.isArray(advisory.fertilizer_plan) &&
                    advisory.fertilizer_plan.map((item, fIdx) => {
                      const isActionActive = activeNoteAction?.advisoryId === advisory.id && activeNoteAction?.actionTaken === item.name;

                      return (
                        <div
                          key={fIdx}
                          className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 text-xs flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-extrabold text-slate-900 text-sm">{item.name}</span>
                              <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg text-xs">
                                {item.dosage}
                              </span>
                            </div>
                            <p className="text-slate-600 text-xs mt-1 font-semibold">{item.timing}</p>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-slate-200">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleRecordTreatment(advisory.id, `Fertilizer: ${item.name}`, 'done', farmerNoteText)}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full text-xs flex items-center gap-1.5 transition-colors min-h-[36px]"
                                >
                                  <CheckCircle2 className="w-4 h-4" /> Done
                                </button>
                                <button
                                  onClick={() => handleRecordTreatment(advisory.id, `Fertilizer: ${item.name}`, 'skipped', farmerNoteText)}
                                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-full text-xs flex items-center gap-1.5 transition-colors min-h-[36px]"
                                >
                                  <XCircle className="w-4 h-4" /> Skipped
                                </button>
                              </div>

                              <button
                                onClick={() => {
                                  if (isActionActive) {
                                    setActiveNoteAction(null);
                                  } else {
                                    setActiveNoteAction({ advisoryId: advisory.id, actionTaken: item.name });
                                  }
                                }}
                                className="p-2 rounded-xl bg-white border border-slate-300 text-amber-700 hover:bg-amber-50 min-h-[36px] min-w-[36px] flex items-center justify-center shadow-xs"
                                title="Add Voice / Text Note"
                              >
                                <Mic className="w-4 h-4" />
                              </button>
                            </div>

                            {isActionActive && (
                              <div className="mt-2 p-2 bg-white rounded-xl border border-slate-300 flex gap-2">
                                <input
                                  type="text"
                                  value={farmerNoteText}
                                  onChange={(e) => setFarmerNoteText(e.target.value)}
                                  placeholder="Type or dictate voice note..."
                                  className="flex-1 bg-slate-50 text-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 font-semibold"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Risk Assessment & Impact Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-1.5">
                  <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> Risk Assessment ({advisory.risk_level})
                  </span>
                  <p className="text-slate-800 text-xs leading-relaxed font-medium">{advisory.risk_notes}</p>
                </div>

                <div className="bg-red-50 p-4 rounded-2xl border border-red-200 space-y-1.5">
                  <span className="text-xs font-black text-red-900 flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-red-600" /> If You Skip This
                  </span>
                  <p className="text-slate-800 text-xs leading-relaxed font-medium">{advisory.cost_of_inaction}</p>
                </div>
              </div>

              {/* Treatment History Logs */}
              {advisory.treatment_logs && advisory.treatment_logs.length > 0 && (
                <div className="pt-3 border-t border-slate-200">
                  <h5 className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" /> Logged Action History
                  </h5>
                  <div className="space-y-2">
                    {advisory.treatment_logs.map((log) => (
                      <div key={log.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900">{log.action_taken}</span>
                          {log.farmer_note && <p className="text-slate-600 text-[11px] mt-0.5 font-medium">Note: "{log.farmer_note}"</p>}
                        </div>
                        <span
                          className={`text-[10px] font-black px-3 py-1 rounded-full ${
                            log.status === 'done' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'
                          }`}
                        >
                          {log.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Field Copilot Drawer */}
      <CopilotDrawer
        field={field}
        daysSinceSowing={daysElapsed}
        chats={chats}
        onNewMessages={handleNewCopilotMessages}
      />
    </div>
  );
};

export default FieldDetailPage;
