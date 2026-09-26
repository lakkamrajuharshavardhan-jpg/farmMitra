import React from 'react';
import { HelpCircle, CheckCircle2, Sprout, Sparkles, Camera, TrendingUp, Calculator, MessageSquare, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HowToUsePage: React.FC = () => {
  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-16 animate-fadein-up">
      {/* ── Page Header Banner ── */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-8 sm:p-12 rounded-3xl border border-teal-800/40 text-white shadow-xl relative overflow-hidden text-center sm:text-left">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-black px-3.5 py-1.5 rounded-full bg-[#00a8e8] text-white shadow-md">
            <HelpCircle className="w-4 h-4" /> Platform Orientation &amp; Tutorial
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            How FarmMitra <span className="text-[#4ade80]">Empowers You</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-base leading-relaxed font-medium">
            Learn how our AI-driven agronomy platform protects your crops from yield loss, optimizes fertilizer expenses, detects diseases early, and maximizes your harvest market profits.
          </p>
        </div>
      </div>

      {/* ── Section 1: How FarmMitra Helps Farmers & Agronomists ── */}
      <div className="space-y-4">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-black text-slate-900 flex items-center justify-center sm:justify-start gap-2.5">
            <Zap className="w-6 h-6 text-emerald-600" /> Key Value Delivered to Farmers
          </h2>
          <p className="text-xs text-slate-600 font-semibold mt-1">Four pillars of precision agriculture built into one enterprise platform</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">15-30% Higher Yield &amp; Zero Crop Loss</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Early warning advisories prevent pest outbreaks, fungal blights, and nutritional deficiencies before they destroy crop canopy.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Calculator className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">₹15,000 / Acre Input Cost Savings</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Eliminate unnecessary chemical sprays. Get exact water-soluble fertilizer dosages (NPK, Micronutrients) tailored to your exact soil and crop stage.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Max Return Mandi Market Pricing</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Real-time APMC Mandi price tickers provide optimal 10-14 day harvest windows to ensure you sell when market demand and prices peak.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Gemini Multimodal AI &amp; Voice Copilot</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Ask questions in natural language, record voice dictation notes in the field, and upload crop leaf photos for instant pathology reports.
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 2: Step-by-Step Tutorial on How to Use the Website ── */}
      <div className="space-y-6 pt-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" /> Step-by-Step Website Guide
          </h2>
          <p className="text-xs text-slate-600 font-semibold mt-1">Mastering FarmMitra's 6 core features</p>
        </div>

        <div className="space-y-5">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start gap-5">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-black text-base flex items-center justify-center shrink-0">
              1
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-600" /> Register Your Crop Plot
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                On the <strong>Dashboard</strong>, click <strong>"+ Register New Field"</strong>. Enter your Crop Type (e.g. Chilli, Cotton, Paddy), Sowing Date, Soil Type, Location (e.g. Warangal, Telangana), and Acreage. This initializes live satellite microclimate geocoding.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start gap-5">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-black text-base flex items-center justify-center shrink-0">
              2
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-600" /> Request Gemini Context-Aware Advisories
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Open your registered plot and click <strong>"Request New Advisory"</strong>. Gemini aggregates your Open-Meteo weather forecast (temperature, humidity, precipitation) with your crop growth day to generate precise irrigation and NPK fertilizer schedules.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start gap-5">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-black text-base flex items-center justify-center shrink-0">
              3
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Camera className="w-5 h-5 text-teal-600" /> AI Leaf Doctor Disease Scanner
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Click <strong>"Leaf Doctor (Vision AI)"</strong> to upload a photo of any leaf showing spots, yellowing, or pest damage. Gemini Vision analyzes the image and returns an instant pathology report with recommended fungicide or pesticide sprays.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start gap-5">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-black text-base flex items-center justify-center shrink-0">
              4
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600" /> Check Mandi Commodity Prices &amp; ROI
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                View real-time Agmarknet mandi rates for your crop and location. Use the <strong>Crop Financial ROI Calculator</strong> to input your seed, fertilizer, labor, and irrigation costs to project net harvest profits.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start gap-5">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-black text-base flex items-center justify-center shrink-0">
              5
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" /> FarmMitra AI Floating Copilot
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Tap the floating <strong>"Ask FarmMitra AI"</strong> capsule at the bottom right corner of any page. Ask questions in natural text or dictate voice notes to receive instant agronomic assistance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Navigation CTA ── */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl text-center space-y-4 shadow-xl">
        <h3 className="text-2xl font-black">Ready to explore crop playbooks and plot management?</h3>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/crop-knowledge"
            className="cropin-btn-cyan px-7 py-3.5 text-xs font-extrabold inline-flex items-center gap-2"
          >
            Explore 50+ Crop Guides <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/fertilizer-knowledge"
            className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-extrabold px-7 py-3.5 rounded-full text-xs inline-flex items-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            40+ Fertilizer Grid <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HowToUsePage;
