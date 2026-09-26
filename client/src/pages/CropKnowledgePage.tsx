import React, { useState } from 'react';
import { Sprout, Search, Layers, Thermometer, Calendar, ShieldCheck, BookOpen, CheckCircle2, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

export interface CropGuide {
  id: string;
  name: string;
  category: 'Cereals & Grains' | 'Cash Crops' | 'Vegetables' | 'Fruits' | 'Spices & Condiments' | 'Pulses & Oilseeds';
  scientificName: string;
  durationDays: number;
  soilType: string;
  idealTemp: string;
  sowingMethod: string;
  landPrep: string;
  stages: {
    stage: string;
    dayRange: string;
    activities: string;
  }[];
  fertilizers: {
    name: string;
    dosage: string;
    timing: string;
    purpose: string;
  }[];
  pesticides: {
    name: string;
    targetPest: string;
    dosage: string;
    application: string;
  }[];
  expectedYield: string;
  proTips: string;
}

const CROPS_DATABASE: CropGuide[] = [
  {
    id: 'chilli',
    name: 'Red Chilli (Teja / Guntur)',
    category: 'Spices & Condiments',
    scientificName: 'Capsicum annuum',
    durationDays: 150,
    soilType: 'Well-drained Black Cotton Soil or Red Loam (pH 6.0–7.0)',
    idealTemp: '20°C – 30°C',
    sowingMethod: 'Nursery bed seedling transplanting at 45x45 cm spacing',
    landPrep: 'Plough field 3-4 times, incorporate 10 tonnes FYM/acre, form raised beds.',
    stages: [
      { stage: 'Nursery & Seedling', dayRange: 'Days 1–35', activities: 'Raise seedlings under shade net, treat seeds with Trichoderma viride.' },
      { stage: 'Transplanting & Establishment', dayRange: 'Days 35–50', activities: 'Transplant 40-day old seedlings in evening, apply light irrigation.' },
      { stage: 'Vegetative Growth & Branching', dayRange: 'Days 50–80', activities: 'First top dressing of NPK, weeding, earthing up around roots.' },
      { stage: 'Flowering & Fruit Set', dayRange: 'Days 80–120', activities: 'Foliar spray of Planofix & Boron to prevent flower drop, monitor for thrips.' },
      { stage: 'Fruit Harvesting & Drying', dayRange: 'Days 120–150', activities: 'Harvest ripe red pods in 3-4 pickings, sun dry on clean tarpaulins.' },
    ],
    fertilizers: [
      { name: 'Basal FYM + DAP', dosage: '10 tonnes FYM + 50 kg DAP / acre', timing: 'During final land preparation', purpose: 'Root development & baseline P' },
      { name: 'NPK 19:19:19', dosage: '5 kg / acre via fertigation', timing: 'Day 20 & 40 post-transplant', purpose: 'Balanced vegetative growth' },
      { name: 'Calcium Nitrate + Boron', dosage: '3 kg / acre foliar spray', timing: 'Flowering stage (Day 75)', purpose: 'Prevents flower drop & fruit cracking' },
      { name: 'Potassium Nitrate (0:0:50)', dosage: '5 kg / acre', timing: 'Fruit maturation (Day 110)', purpose: 'Improves pod color, pungency & shine' },
    ],
    pesticides: [
      { name: 'Imidacloprid 17.8% SL', dosage: '0.5 ml / litre water', targetPest: 'Thrips & Aphids (Leaf curl)', application: 'Foliar spray at early infestation' },
      { name: 'Fipronil 5% SC', dosage: '2 ml / litre water', targetPest: 'Black Thrips', application: 'Spray during early flowering' },
      { name: 'Mancozeb 75% WP', dosage: '2.5 g / litre water', targetPest: 'Fruit Rot & Dieback', application: 'Preventive spray before monsoon' },
    ],
    expectedYield: '18 – 24 Quintals dry chilli per acre',
    proTips: 'Maintain 60% soil moisture during fruit development; avoid waterlogging at all costs.',
  },
  {
    id: 'cotton',
    name: 'Bt Cotton (Long Staple)',
    category: 'Cash Crops',
    scientificName: 'Gossypium hirsutum',
    durationDays: 160,
    soilType: 'Deep Black Cotton Soil with high moisture retention',
    idealTemp: '21°C – 35°C',
    sowingMethod: 'Dibbling seeds at 90x60 cm or 120x45 cm spacing',
    landPrep: 'Deep summer ploughing, apply FYM, broad beds and furrows.',
    stages: [
      { stage: 'Germination & Seedling', dayRange: 'Days 1–20', activities: 'Maintain optimum soil moisture, gap filling within 10 days.' },
      { stage: 'Squaring & Vegetative', dayRange: 'Days 20–60', activities: 'Apply NPK 1st split, weeding, nipping terminal buds at 45 days.' },
      { stage: 'Boll Formation', dayRange: 'Days 60–110', activities: 'Foliar spray of 2% DAP & KNo3, monitor pink bollworm with pheromone traps.' },
      { stage: 'Boll Bursting & Picking', dayRange: 'Days 110–160', activities: 'Clean picking in morning hours, store seed cotton in dry shed.' },
    ],
    fertilizers: [
      { name: 'Urea + SSP + MOP', dosage: '60 kg N, 30 kg P, 30 kg K per acre', timing: 'Split into 3 doses (0, 30, 60 days)', purpose: 'High boll load nourishment' },
      { name: 'Magnesium Sulphate', dosage: '10 kg / acre soil application', timing: 'At 45 days', purpose: 'Prevents reddening of cotton leaves' },
    ],
    pesticides: [
      { name: 'Profex Super (Profenofos + Cypermethrin)', dosage: '2 ml / litre', targetPest: 'Bollworms & Spodoptera', application: 'Foliar spray at threshold' },
      { name: 'Neem Oil 10,000 ppm', dosage: '5 ml / litre', targetPest: 'Whitefly & Aphids', application: 'Preventive bio-spray' },
    ],
    expectedYield: '12 – 16 Quintals seed cotton per acre',
    proTips: 'Install 5 pheromone traps per acre at 45 days to monitor Pink Bollworm moths.',
  },
  {
    id: 'paddy',
    name: 'Paddy / Rice (BPT 5204 Sona Mahsuri)',
    category: 'Cereals & Grains',
    scientificName: 'Oryza sativa',
    durationDays: 135,
    soilType: 'Clay loam or heavy clay soils capable of holding water',
    idealTemp: '22°C – 32°C',
    sowingMethod: 'Transplanting 21-day nursery seedlings into puddled field',
    landPrep: 'Puddling twice with cage wheel tractor, standing water 2-3 cm.',
    stages: [
      { stage: 'Nursery Bed Preparation', dayRange: 'Days 1–21', activities: 'Soak seeds in carbendazim solution, raise mat nursery.' },
      { stage: 'Puddling & Transplanting', dayRange: 'Days 21–25', activities: 'Transplant 2-3 seedlings per hill at 20x15 cm spacing.' },
      { stage: 'Active Tillering', dayRange: 'Days 25–55', activities: 'Top dress Urea & Zinc, maintain 2-5 cm standing water.' },
      { stage: 'Panicle Initiation & Heading', dayRange: 'Days 55–90', activities: 'Critical water requirement stage, spray Hexaconazole for sheath blight.' },
      { stage: 'Grain Filling & Harvest', dayRange: 'Days 90–135', activities: 'Drain water 10 days before harvest, combine harvesting when 85% grains turn golden.' },
    ],
    fertilizers: [
      { name: 'Urea (46% N)', dosage: '50 kg / acre in 3 splits', timing: 'Basal, 25 days, 50 days', purpose: 'Tiller count boost' },
      { name: 'Zinc Sulphate 21%', dosage: '10 kg / acre', timing: 'Basal during final puddling', purpose: 'Prevents Khaira disease' },
    ],
    pesticides: [
      { name: 'Chlorantraniliprole 18.5% SC (Coragen)', dosage: '60 ml / acre', targetPest: 'Stem Borer & Leaf Folder', application: 'Spray at 30 days post-transplant' },
      { name: 'Tebuconazole + Trifloxystrobin', dosage: '80 g / acre', targetPest: 'Sheath Blight & Blast', application: 'Foliar spray at booting stage' },
    ],
    expectedYield: '25 – 32 Quintals paddy per acre',
    proTips: 'Adopt Alternate Wetting and Drying (AWD) irrigation to save 30% water and increase root strength.',
  },
  {
    id: 'wheat',
    name: 'Wheat (HD 2967 / Sharbati)',
    category: 'Cereals & Grains',
    scientificName: 'Triticum aestivum',
    durationDays: 120,
    soilType: 'Fertile silt loam or clay loam soils',
    idealTemp: '12°C – 25°C (Cool Rabi crop)',
    sowingMethod: 'Seed drill sowing at 22.5 cm row spacing',
    landPrep: '2-3 harrowings followed by planking for fine seedbed.',
    stages: [
      { stage: 'Crown Root Initiation (CRI)', dayRange: 'Days 1–21', activities: 'Most critical 1st irrigation at 21 days post-sowing.' },
      { stage: 'Tillering Stage', dayRange: 'Days 21–45', activities: 'Apply 1st top dressing of Urea, weed control using Clodinafop.' },
      { stage: 'Jointing & Booting', dayRange: 'Days 45–75', activities: '2nd & 3rd irrigation, check for yellow rust symptoms.' },
      { stage: 'Milking & Grain Hardening', dayRange: 'Days 75–110', activities: 'Maintain mild moisture, protect from lodging winds.' },
      { stage: 'Harvesting', dayRange: 'Days 110–120', activities: 'Harvest when moisture level drops to 12%.' },
    ],
    fertilizers: [
      { name: 'DAP + MOP', dosage: '50 kg DAP + 25 kg MOP / acre', timing: 'Basal at sowing', purpose: 'Early root system' },
      { name: 'Urea Top Dressing', dosage: '45 kg / acre', timing: 'At 1st irrigation (CRI stage)', purpose: 'Vigorous tillering' },
    ],
    pesticides: [
      { name: 'Propiconazole 25% EC (Tilt)', dosage: '1 ml / litre water', targetPest: 'Yellow Rust & Karnal Bunt', application: 'Spray at first rust detection' },
    ],
    expectedYield: '20 – 26 Quintals wheat per acre',
    proTips: 'First irrigation at CRI stage (21 days) is non-negotiable; missing it reduces yield by up to 25%.',
  },
  {
    id: 'tomato',
    name: 'Hybrid Tomato (Abhinav / Arka Rakshak)',
    category: 'Vegetables',
    scientificName: 'Solanum lycopersicum',
    durationDays: 140,
    soilType: 'Well-drained sandy loam rich in organic matter',
    idealTemp: '18°C – 28°C',
    sowingMethod: 'Transplanting 30-day seedlings on raised beds with drip & mulching',
    landPrep: 'Deep ploughing, 12 tonnes FYM/acre, layout raised beds 90 cm wide.',
    stages: [
      { stage: 'Transplanting', dayRange: 'Days 1–15', activities: 'Lay 25-micron silver-black mulch film, transplant at 60x45 cm.' },
      { stage: 'Vegetative & Staking', dayRange: 'Days 15–45', activities: 'Erect bamboo stakes and jute twine tying for plant support.' },
      { stage: 'Flowering & Fruiting', dayRange: 'Days 45–90', activities: 'Drip fertigation with 19:19:19, spray Calcium Boron for blossom end rot.' },
      { stage: 'Multiple Harvest Pickings', dayRange: 'Days 90–140', activities: 'Pick firm red ripe tomatoes every 3 days.' },
    ],
    fertilizers: [
      { name: 'NPK 12:61:0 (Mono Ammonium Phosphate)', dosage: '3 kg / acre via drip', timing: 'Days 15–35', purpose: 'Root branching & early frame' },
      { name: 'Calcium Nitrate', dosage: '5 kg / acre', timing: 'Weekly during fruiting', purpose: 'Prevents Blossom End Rot (BER)' },
    ],
    pesticides: [
      { name: 'Spinetoram 11.7% SC (Delegate)', dosage: '0.9 ml / litre', targetPest: 'Tuta absoluta (Leaf miner)', application: 'Spray on early leaf trails' },
      { name: 'Copper Oxychloride + Streptocycline', dosage: '2.5 g + 0.1 g / litre', targetPest: 'Bacterial Wilt & Early Blight', application: 'Preventive soil drench' },
    ],
    expectedYield: '25 – 35 Tonnes per acre (under drip & mulching)',
    proTips: 'Use 25-micron silver-black reflective mulch to control weeds, conserve 50% water, and prevent thrips.',
  },
];

export const CropKnowledgePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedCropId, setExpandedCropId] = useState<string | null>('chilli');

  const categories = ['All', 'Cereals & Grains', 'Cash Crops', 'Vegetables', 'Fruits', 'Spices & Condiments', 'Pulses & Oilseeds'];

  const filteredCrops = CROPS_DATABASE.filter((crop) => {
    const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          crop.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          crop.soilType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || crop.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (id: string) => {
    setExpandedCropId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-fadein-up">
      {/* ── Header Banner ── */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-8 sm:p-10 rounded-3xl border border-emerald-800/40 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-black px-3.5 py-1.5 rounded-full bg-[#84cc16] text-[#022c22]">
            <Sprout className="w-4 h-4" /> Full Agronomic Cultivation Playbooks
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Crop Knowledge <span className="text-[#4ade80]">Grid</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
            Complete step-by-step growing playbooks explained clearly in-line: soil preparation, nursery treatment, fertilizer dosage, pest control chemicals, and expected harvest yield.
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
              placeholder="Search crop name, soil type, or scientific name..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="text-xs font-bold text-slate-600 shrink-0">
            Showing <strong className="text-emerald-700 font-extrabold">{filteredCrops.length}</strong> Crops
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

      {/* ── In-Page Comprehensive Crop Stream ── */}
      <div className="space-y-6">
        {filteredCrops.map((crop) => {
          const isExpanded = expandedCropId === crop.id;

          return (
            <div
              key={crop.id}
              className={`bg-white rounded-3xl border transition-all ${
                isExpanded ? 'border-emerald-500 shadow-lg' : 'border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              {/* Card Header Bar */}
              <div
                onClick={() => toggleExpand(crop.id)}
                className="p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 font-bold">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                        {crop.category}
                      </span>
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" /> {crop.durationDays} Days Duration
                      </span>
                    </div>

                    <h2 className="text-xl font-black text-slate-900 mt-1">{crop.name}</h2>
                    <p className="text-xs text-slate-500 italic font-semibold">{crop.scientificName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 align-self-end sm:align-self-center">
                  <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    Yield: {crop.expectedYield}
                  </span>

                  <button className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* In-Line Expanded Detailed Playbook */}
              {isExpanded && (
                <div className="p-6 sm:p-8 border-t border-slate-200 space-y-6 bg-slate-50/50 rounded-b-3xl animate-fadein-up">
                  
                  {/* Quick Soil & Climate Specs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Soil Requirement</span>
                      <span className="font-extrabold text-slate-900">{crop.soilType}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Ideal Temperature</span>
                      <span className="font-extrabold text-slate-900">{crop.idealTemp}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Land Prep &amp; Sowing</span>
                      <span className="font-extrabold text-slate-900">{crop.sowingMethod}</span>
                    </div>
                  </div>

                  {/* Step-by-Step Growing Stages */}
                  <div className="space-y-3">
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-emerald-600" /> Step-by-Step Cultivation Timeline
                    </h3>
                    <div className="space-y-3">
                      {crop.stages.map((st, i) => (
                        <div key={i} className="bg-white p-4.5 rounded-2xl border border-slate-200 text-xs space-y-1 shadow-xs">
                          <div className="flex items-center justify-between font-extrabold text-slate-900">
                            <span className="text-emerald-700 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Step {i + 1}: {st.stage}
                            </span>
                            <span className="px-3 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-bold">{st.dayRange}</span>
                          </div>
                          <p className="text-slate-700 font-semibold leading-relaxed pt-1">{st.activities}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Fertilizers */}
                  <div className="space-y-3">
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Sprout className="w-5 h-5 text-amber-600" /> Recommended Fertilizer Schedule
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {crop.fertilizers.map((f, i) => (
                        <div key={i} className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 text-xs space-y-1">
                          <div className="flex items-center justify-between font-extrabold text-amber-950">
                            <span>{f.name}</span>
                            <span className="text-emerald-800 font-black bg-emerald-100 px-2.5 py-0.5 rounded-md">{f.dosage}</span>
                          </div>
                          <p className="text-slate-800 font-bold text-xs pt-1">Timing: {f.timing}</p>
                          <p className="text-slate-600 font-medium text-[11px]">{f.purpose}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Pesticides */}
                  <div className="space-y-3">
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-red-600" /> Targeted Pest &amp; Disease Control
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {crop.pesticides.map((p, i) => (
                        <div key={i} className="bg-red-50/70 p-4 rounded-2xl border border-red-200 text-xs space-y-1">
                          <div className="flex items-center justify-between font-extrabold text-red-950">
                            <span>{p.name}</span>
                            <span className="text-red-700 font-black bg-white px-2.5 py-0.5 rounded-md">{p.dosage}</span>
                          </div>
                          <p className="text-slate-900 font-bold text-xs pt-1">Target Pest/Disease: {p.targetPest}</p>
                          <p className="text-slate-600 font-medium text-[11px]">{p.application}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pro Tips Banner */}
                  <div className="bg-emerald-900 text-white p-5 rounded-2xl text-xs font-semibold space-y-1 shadow-md">
                    <span className="text-emerald-400 font-black uppercase text-[10px]">Agronomist Pro-Tip</span>
                    <p className="leading-relaxed">{crop.proTips}</p>
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

export default CropKnowledgePage;
