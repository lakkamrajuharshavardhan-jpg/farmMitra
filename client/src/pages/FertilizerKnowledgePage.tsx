import React, { useState } from 'react';
import { FlaskConical, Search, AlertTriangle, Layers, Info, ChevronDown, ChevronUp, Droplets, CheckCircle2 } from 'lucide-react';

export interface FertilizerGuide {
  id: string;
  name: string;
  category: 'NPK & Primary Nutrients' | 'Foliar & Water Soluble NPK' | 'Micronutrients & Soil Amendments' | 'Bio-Fertilizers & Organics' | 'Insecticides & Miticides' | 'Fungicides & Bactericides';
  composition: string;
  whyItIsUsed: string;
  stepByStepUsage: {
    step: string;
    detail: string;
  }[];
  dosagePerAcre: string;
  modeOfApplication: 'Soil Application' | 'Foliar Spray' | 'Fertigation / Drip' | 'Seed Treatment' | 'Soil Drenching';
  bestStageToApply: string;
  safetyAndCompatibility: string;
}

const FERTILIZERS_DATABASE: FertilizerGuide[] = [
  {
    id: 'urea',
    name: 'Urea (46% Nitrogen)',
    category: 'NPK & Primary Nutrients',
    composition: '46% Total Nitrogen (N)',
    whyItIsUsed: 'Essential for vegetative canopy growth, leaf greenness (chlorophyll), and tillering. Fixes pale yellow leaves caused by nitrogen deficiency.',
    stepByStepUsage: [
      { step: 'Step 1: Basal & Top Dressing Split', detail: 'Never apply full dose at once. Divide into 2-3 equal splits (Basal, 30 days, 60 days).' },
      { step: 'Step 2: Soil Moisture Check', detail: 'Apply only when field has sufficient moisture. Avoid broadcast in dry soil.' },
      { step: 'Step 3: Immediate Incorporation', detail: 'Incorporate into soil or follow immediately with irrigation to prevent ammonia volatilization loss.' },
    ],
    dosagePerAcre: '40 – 60 kg per acre in splits',
    modeOfApplication: 'Soil Application',
    bestStageToApply: 'Vegetative growth & tillering stage (Days 15–60)',
    safetyAndCompatibility: 'Do not mix with Single Super Phosphate (SSP) or lime. Wear gloves during manual broadcasting.',
  },
  {
    id: 'dap',
    name: 'DAP (Di-Ammonium Phosphate 18:46:0)',
    category: 'NPK & Primary Nutrients',
    composition: '18% Nitrogen, 46% Phosphorus (P2O5)',
    whyItIsUsed: 'Critical for vigorous root establishment, early plant frame development, and energetic seedling establishment.',
    stepByStepUsage: [
      { step: 'Step 1: Basal Placement', detail: 'Place 3-5 cm below and beside the seed during sowing or transplanting.' },
      { step: 'Step 2: Root Contact', detail: 'Ensure good soil coverage around seed furrow for immediate root interception.' },
    ],
    dosagePerAcre: '50 kg per acre',
    modeOfApplication: 'Soil Application',
    bestStageToApply: 'At the time of sowing / land preparation',
    safetyAndCompatibility: 'Compatible with Urea and Potash. Do not mix with water soluble micro-nutrients like Zinc Sulphate.',
  },
  {
    id: 'mop',
    name: 'MOP (Muriate of Potash 0:0:60)',
    category: 'NPK & Primary Nutrients',
    composition: '60% Potassium (K2O)',
    whyItIsUsed: 'Enhances drought resistance, disease tolerance, grain filling weight, stem strength, and crop yield quality.',
    stepByStepUsage: [
      { step: 'Step 1: Split Application', detail: 'Apply 50% basal and 50% at flowering/grain filling stage.' },
      { step: 'Step 2: Soil Incorporation', detail: 'Broadcast and mix into topsoil before sowing.' },
    ],
    dosagePerAcre: '25 – 40 kg per acre',
    modeOfApplication: 'Soil Application',
    bestStageToApply: 'Basal and Flowering / Fruit development stage',
    safetyAndCompatibility: 'Compatible with most dry fertilizers. Store in dry place away from humidity.',
  },
  {
    id: 'npk-19-19-19',
    name: '100% Water Soluble NPK 19:19:19',
    category: 'Foliar & Water Soluble NPK',
    composition: '19% N, 19% P, 19% K (Balanced Grade)',
    whyItIsUsed: 'Provides balanced instant nutrition during rapid vegetative growth, stress recovery, or after hail/pest damage.',
    stepByStepUsage: [
      { step: 'Step 1: Solution Preparation', detail: 'Dissolve 5 g per litre water (750 g per 150L tank per acre).' },
      { step: 'Step 2: Spray Timing', detail: 'Spray during early morning (6-9 AM) or late evening (4-6 PM).' },
      { step: 'Step 3: Canopy Coverage', detail: 'Ensure complete wetting of upper and lower leaf surfaces.' },
    ],
    dosagePerAcre: '1.0 – 1.5 kg per acre (Foliar) or 5 kg via Drip',
    modeOfApplication: 'Foliar Spray',
    bestStageToApply: 'Vegetative growth stage (Days 20–45)',
    safetyAndCompatibility: 'Compatible with most insecticides and fungicides. Do not mix with Copper or Calcium based products.',
  },
  {
    id: 'zinc-sulphate',
    name: 'Zinc Sulphate 21% (Heptahydrate)',
    category: 'Micronutrients & Soil Amendments',
    composition: '21% Zinc (Zn), 10% Sulphur (S)',
    whyItIsUsed: 'Cures Khaira disease in paddy, leaf bronzing, and stunted little-leaf deformity in chilli and cotton.',
    stepByStepUsage: [
      { step: 'Step 1: Soil Application', detail: 'Broadcast 10 kg per acre mixed with 50 kg dry soil or FYM.' },
      { step: 'Step 2: Foliar Correction', detail: 'If symptoms appear, spray 2.5 g Zinc Sulphate + 5 g Lime per litre water.' },
    ],
    dosagePerAcre: '10 kg per acre (Soil) or 500 g per acre (Foliar)',
    modeOfApplication: 'Soil Application',
    bestStageToApply: 'Basal or early vegetative stage',
    safetyAndCompatibility: 'NEVER mix directly with DAP or SSP in liquid form; causes insoluble zinc phosphate precipitate.',
  },
  {
    id: 'imidacloprid',
    name: 'Imidacloprid 17.8% SL (Confidor)',
    category: 'Insecticides & Miticides',
    composition: '17.8% Systemic Neonicotinoid',
    whyItIsUsed: 'Systemic control of sucking pests: thrips, aphids, jassids, and whiteflies causing leaf curl virus in chilli and vegetables.',
    stepByStepUsage: [
      { step: 'Step 1: Foliar Spray', detail: 'Mix 0.5 ml per litre water (75-100 ml per acre in 150-200L water).' },
      { step: 'Step 2: Seed Treatment', detail: '5 ml per kg seed for 40-day early sucking pest protection.' },
    ],
    dosagePerAcre: '75 – 100 ml per acre',
    modeOfApplication: 'Foliar Spray',
    bestStageToApply: 'Early vegetative at first pest sighting',
    safetyAndCompatibility: 'Toxic to honeybees. Do not spray during peak morning flower pollination.',
  },
  {
    id: 'coragen',
    name: 'Chlorantraniliprole 18.5% SC (Coragen)',
    category: 'Insecticides & Miticides',
    composition: '18.5% Anthranilic Diamide',
    whyItIsUsed: 'Ovi-larvicidal long-duration (21+ days) control of stem borer, fruit borer, leaf folder, and American bollworm.',
    stepByStepUsage: [
      { step: 'Step 1: Spray Preparation', detail: 'Mix 60 ml in 150-200L water per acre.' },
      { step: 'Step 2: Thorough Coverage', detail: 'Spray uniformly over foliage at early egg hatching or larval sighting.' },
    ],
    dosagePerAcre: '60 ml per acre',
    modeOfApplication: 'Foliar Spray',
    bestStageToApply: '30 days post-transplant or at egg-laying peak',
    safetyAndCompatibility: 'Safe to beneficial predators & parasitoids. Rainfast within 2 hours of application.',
  },
];

export const FertilizerKnowledgePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedItemId, setExpandedItemId] = useState<string | null>('urea');

  const categories = [
    'All',
    'NPK & Primary Nutrients',
    'Foliar & Water Soluble NPK',
    'Micronutrients & Soil Amendments',
    'Insecticides & Miticides',
    'Fungicides & Bactericides',
  ];

  const filteredItems = FERTILIZERS_DATABASE.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.composition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.whyItIsUsed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (id: string) => {
    setExpandedItemId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-fadein-up">
      {/* ── Header Banner ── */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 p-8 sm:p-10 rounded-3xl border border-amber-800/40 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-black px-3.5 py-1.5 rounded-full bg-amber-400 text-amber-950">
            <FlaskConical className="w-4 h-4" /> Full Agrochemical Usage Playbooks
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Fertilizer &amp; Agrochemical <span className="text-amber-400">Grid</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
            Clear in-line application guides detailing why each chemical is used, exact dosage per acre, application stage, tank-mix compatibility, and safety rules.
          </p>
        </div>
      </div>

      {/* ── Filter & Search Controls ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search fertilizer, chemical composition, or symptom..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="text-xs font-bold text-slate-600 shrink-0">
            Showing <strong className="text-amber-700 font-extrabold">{filteredItems.length}</strong> Products
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── In-Page Product Stream ── */}
      <div className="space-y-6">
        {filteredItems.map((item) => {
          const isExpanded = expandedItemId === item.id;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-3xl border transition-all ${
                isExpanded ? 'border-amber-500 shadow-lg' : 'border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              {/* Header Row */}
              <div
                onClick={() => toggleExpand(item.id)}
                className="p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 font-bold">
                    <FlaskConical className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-amber-100 text-amber-900 rounded-full">
                        {item.category}
                      </span>
                      <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                        {item.modeOfApplication}
                      </span>
                    </div>

                    <h2 className="text-xl font-black text-slate-900 mt-1">{item.name}</h2>
                    <p className="text-xs text-emerald-800 font-extrabold">{item.composition}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 align-self-end sm:align-self-center">
                  <span className="text-xs font-black text-amber-900 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200">
                    Dosage: {item.dosagePerAcre}
                  </span>

                  <button className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Detailed Usage Guide */}
              {isExpanded && (
                <div className="p-6 sm:p-8 border-t border-slate-200 space-y-6 bg-slate-50/50 rounded-b-3xl animate-fadein-up">
                  
                  {/* Why It Is Used Banner */}
                  <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 text-xs space-y-1">
                    <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-amber-600" /> Why This Agrochemical Is Used
                    </span>
                    <p className="text-slate-800 leading-relaxed font-bold">{item.whyItIsUsed}</p>
                  </div>

                  {/* Application Specs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Recommended Dosage</span>
                      <span className="font-black text-amber-900">{item.dosagePerAcre}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Mode of Application</span>
                      <span className="font-black text-slate-900">{item.modeOfApplication}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Best Stage to Apply</span>
                      <span className="font-black text-slate-900">{item.bestStageToApply}</span>
                    </div>
                  </div>

                  {/* Step-by-Step How to Apply */}
                  <div className="space-y-3">
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-amber-600" /> Step-by-Step Application Instructions
                    </h3>
                    <div className="space-y-3">
                      {item.stepByStepUsage.map((st, i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 text-xs space-y-1 shadow-xs">
                          <span className="font-extrabold text-amber-800 block text-xs flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-amber-600" /> {st.step}
                          </span>
                          <p className="text-slate-800 font-semibold leading-relaxed pt-0.5">{st.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Safety & Tank Mix Guidelines */}
                  <div className="bg-red-50 p-5 rounded-2xl border border-red-200 text-xs space-y-1">
                    <span className="text-xs font-black text-red-950 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-600" /> Tank-Mix Compatibility &amp; Safety Guidelines
                    </span>
                    <p className="text-slate-800 leading-relaxed font-bold">{item.safetyAndCompatibility}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FertilizerKnowledgePage;
