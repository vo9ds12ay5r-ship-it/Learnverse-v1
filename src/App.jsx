/**
 * StudyAI Elite — Complete Single-File App
 *
 * SETUP:
 *   Vite:    npm create vite@latest studyai -- --template react
 *            cd studyai && npm install lucide-react
 *            Replace src/App.jsx with this file, remove "use client" line
 *            npm run dev → http://localhost:5173
 *
 *   Next.js: npx create-next-app@latest studyai --app
 *            cd studyai && npm install lucide-react
 *            Replace app/page.jsx with this file
 *            npm run dev → http://localhost:3000
 */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  BookOpen,Brain,ChevronDown,ChevronRight,ChevronLeft,Flame,GraduationCap,
  LogOut,Phone,Mail,Apple,Star,X,Check,User,Bell,Bookmark,BookmarkCheck,
  FileText,Settings,Trophy,Target,Zap,ArrowRight,ArrowLeft,Shield,HelpCircle,
  Search,Plus,Clock,BarChart2,Award,Home,BookMarked,Send,Mic,Volume2,Share2,
  Loader2,ImageOff,AlertTriangle,RotateCcw,Layers,Timer,Calendar,Hash,Download,
  Eye,Play,RefreshCw,SlidersHorizontal,TrendingUp,CheckCircle2,XCircle,Gift,
  Wifi,Copy,Crown,Lock,AlertCircle,EyeOff,
} from "lucide-react";

// ── SUPABASE CLIENT (real backend — replace with your project keys) ──
// Free project: supabase.com → New Project → Settings → API → copy URL + anon key
const SUPABASE_URL  = import.meta.env?.VITE_SUPABASE_URL      || "https://YOUR-PROJECT.supabase.co";
const SUPABASE_ANON = import.meta.env?.VITE_SUPABASE_ANON_KEY || "YOUR_ANON_PUBLIC_KEY";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

// ── GLOBAL STYLES ─────────────────────────────────────────
function GlobalStyles(){return(<style>{`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',system-ui,sans-serif;background:#0D0428;display:flex;
    justify-content:center;min-height:100vh;-webkit-tap-highlight-color:transparent;
    -webkit-font-smoothing:antialiased}
  #root,#__next{width:100%;max-width:480px;min-height:100vh;background:#F9FAFB;
    display:flex;flex-direction:column;overflow-x:hidden;margin:0 auto;position:relative}
  button,input,textarea,select{font-family:inherit}
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-thumb{background:#C4B5FD;border-radius:99px}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes dotBounce{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-6px);opacity:1}}
  @keyframes floatChip0{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
  @keyframes floatChip1{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
  @keyframes floatChip2{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes dropIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideUp{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes fadeInToast{from{opacity:0;transform:translate(-50%,-6px)}to{opacity:1;transform:translate(-50%,0)}}
  @keyframes apexIn{from{opacity:0;transform:scale(.85) translateY(30px)}to{opacity:1;transform:scale(1) translateY(0)}}
  @keyframes dotPulse{0%,100%{opacity:.4;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}
`}</style>);}

// ── TOKENS ────────────────────────────────────────────────
const T={
  p950:"#0D0428",p900:"#1E0B4B",p800:"#2D1274",p700:"#4C1D95",
  p600:"#5B21B6",p500:"#7C3AED",p400:"#8B5CF6",p300:"#A78BFA",
  p200:"#C4B5FD",p100:"#EDE9FE",p50:"#F5F3FF",
  green:"#10B981",greenBg:"#D1FAE5",greenDk:"#065F46",
  orange:"#F97316",orangeBg:"#FFEDD5",orangeDk:"#9A3412",
  pink:"#EC4899",pinkBg:"#FCE7F3",
  teal:"#14B8A6",tealBg:"#CCFBF1",
  blue:"#3B82F6",blueBg:"#DBEAFE",
  gold:"#F59E0B",goldBg:"#FEF3C7",goldDk:"#92400E",
  red:"#EF4444",redBg:"#FEF2F2",redDk:"#991B1B",
  white:"#FFFFFF",
  g50:"#F9FAFB",g100:"#F3F4F6",g200:"#E5E7EB",g300:"#D1D5DB",
  g400:"#9CA3AF",g500:"#6B7280",g600:"#4B5563",g700:"#374151",
  g800:"#1F2937",g900:"#111827",
};

// ── STORAGE ───────────────────────────────────────────────
const ls={
  get:k=>{try{const r=localStorage.getItem(k);return r?JSON.parse(r):null}catch{return null}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}},
  del:k=>{try{localStorage.removeItem(k)}catch{}},
};
const getProfile=()=>ls.get("edu_profile")||{name:"Student",track:"iitjee",class:"Class 11",board:"CBSE",subjects:[]};

/** Writes profile to Supabase 'profiles' table (real backend) + local cache for sync reads. */
async function persistProfile(full){
  ls.set("edu_profile",full);
  try{
    const{error}=await supabase.from("profiles").upsert({
      id:full.id, email:full.email, name:full.name, class:full.class,
      board:full.board, track:full.track, subjects:full.subjects,
      streak:full.streak??1, updated_at:new Date().toISOString(),
    });
    if(error)console.error("Supabase profile save error:",error.message);
  }catch(e){console.error("Supabase unreachable:",e.message)}
}

/** Fetches the authenticated user's profile row from Supabase. */
async function fetchProfile(userId){
  const{data,error}=await supabase.from("profiles").select("*").eq("id",userId).maybeSingle();
  if(error){console.error("Fetch profile error:",error.message);return null}
  return data;
}

// ── QUESTION BANK ─────────────────────────────────────────
// [question,[A,B,C,D],correctIdx,diff(0=easy|1=med|2=hard),hint]
const QDB={
 "Quadratic Equations":[
  ["Which is a quadratic equation?",["x²+3x−4=0","x³+x=0","3x−7=0","1/x+2=0"],0,0,"Highest power of x must be exactly 2."],
  ["Standard form of quadratic equation?",["ax²+bx+c=0 (a≠0)","ax+b=0","ax³+bx=0","ax²+b=1"],0,0,"a≠0 is mandatory."],
  ["Roots of x²−5x+6=0?",["2 and 3","−2 and −3","1 and 6","−1 and −6"],0,0,"Factor: (x−2)(x−3)=0."],
  ["Sum of roots of ax²+bx+c=0?",["−b/a","b/a","c/a","−c/a"],0,0,"Vieta's: α+β=−b/a."],
  ["Product of roots of ax²+bx+c=0?",["c/a","−c/a","b/a","−b/a"],0,0,"Vieta's: αβ=c/a."],
  ["Discriminant D of ax²+bx+c=0?",["b²−4ac","b²+4ac","4ac−b²","√(b²−4ac)"],0,0,"D=b²−4ac determines root nature."],
  ["When D>0, roots are?",["Real and distinct","Complex","Equal and real","Zero"],0,0,"Positive D means two different real roots."],
  ["Roots of x²−9=0?",["3 and −3","9 and −9","3 and 3","−9 only"],0,0,"Difference of squares: (x−3)(x+3)=0."],
  ["Roots of x(x−5)=0?",["0 and 5","0 and −5","5 and −5","1 and 5"],0,0,"x=0 or x=5."],
  ["Max roots a quadratic can have?",["2","3","1","4"],0,0,"Fundamental Theorem of Algebra."],
  ["Discriminant of 2x²−3x+1=0?",["1","−1","17","8"],0,1,"D=9−4(2)(1)=1."],
  ["Roots of 2x²−7x+3=0?",["3 and ½","−3 and −½","3 and −½","−3 and ½"],0,1,"D=25; x=(7±5)/4."],
  ["α,β roots of x²−5x+6=0. α²+β²=?",["13","25","36","11"],0,1,"(α+β)²−2αβ=25−12=13."],
  ["Equal roots in 3x²+2kx+3=0. k=?",["±3","±1","±9","±6"],0,1,"D=0: 4k²−36=0 → k=±3."],
  ["Roots of x²+2x−8=0?",["2 and −4","−2 and 4","4 and −2","−4 and −2"],0,1,"D=36; x=(−2±6)/2."],
  ["Quadratic with roots 2 and −5?",["x²+3x−10=0","x²−3x−10=0","x²+3x+10=0","x²−3x+10=0"],0,1,"Sum=−3, product=−10."],
  ["x=2 root of kx²−5x+2=0. k=?",["2","−2","4","1"],0,1,"4k−10+2=0 → k=2."],
  ["Roots of 4x²−4x+1=0?",["½ and ½","1 and −1","2 and 2","¼ and ¼"],0,1,"(2x−1)²=0; repeated root ½."],
  ["Nature of roots of x²+x+1=0?",["No real roots","Two equal","Two distinct","One zero"],0,1,"D=1−4=−3<0."],
  ["Roots of 6x²−x−2=0?",["⅔ and −½","−⅔ and ½","⅔ and ½","−⅔ and −½"],0,1,"D=49; x=(1±7)/12."],
  ["α,β roots of 2x²−5x+3=0. α/β+β/α=?",["13/6","11/6","7/6","5/2"],0,2,"(α²+β²)/αβ=13/4÷3/2=13/6."],
  ["p,q roots of x²+px+q=0 (p≠0,q≠0)?",["p=1,q=−2","p=−1,q=2","p=2,q=−1","p=−2,q=1"],0,2,"pq=q→p=1; 1+q=−1→q=−2."],
  ["One root twice other in x²−px+q=0?",["2p²=9q","p²=2q","p²=9q","2p=9q"],0,2,"Roots α,2α: sum=3α=p, product=2α²=q."],
  ["√(6+√(6+√(6+…))) satisfies?",["x²−x−6=0","x²+x−6=0","x²−x+6=0","x²+x+6=0"],0,2,"Let x=√(6+x) → x²=6+x."],
  ["1/α+1/β for roots of x²−6x+8=0?",["3/4","4/3","6","8"],0,2,"(α+β)/αβ=6/8=3/4."],
  ["Train 360km at x km/h; 5km/h faster saves 1hr. x=?",["40","45","35","30"],0,2,"x²+5x−1800=0 → x=40."],
  ["Two numbers differ by 3, product 54. Larger?",["9","6","18","3"],0,2,"x(x+3)=54 → x=6; larger=9."],
  ["Equal roots in 4x²−px+9=0. p=?",["±12","±6","±9","±3"],0,2,"D=0: p²−144=0 → p=±12."],
  ["Hypotenuse exceeds legs by 2cm,4cm. Hyp=?",["10 cm","8 cm","12 cm","6 cm"],0,2,"h²=(h−2)²+(h−4)² → h=10."],
  ["Roots of x²−(√3+1)x+√3=0?",["1 and √3","−1 and √3","1 and −√3","√3 and −√3"],0,2,"(x−1)(x−√3)=0."],
 ],
 "Life Processes":[
  ["Photosynthesis mainly in?",["Mitochondria","Chloroplast","Nucleus","Ribosome"],1,0,"Chloroplasts contain chlorophyll."],
  ["Products of photosynthesis?",["Glucose and oxygen","CO₂ and water","ATP only","Starch only"],0,0,"6CO₂+6H₂O→C₆H₁₂O₆+6O₂."],
  ["Digestion begins in?",["Stomach","Mouth","Small intestine","Liver"],1,0,"Salivary amylase acts on starch."],
  ["Enzyme in saliva?",["Pepsin","Amylase","Lipase","Trypsin"],1,0,"Salivary amylase."],
  ["O₂ transported in blood by?",["Plasma","Haemoglobin","WBCs","Platelets"],1,0,"Haemoglobin in RBCs."],
  ["Functional unit of kidney?",["Villus","Alveolus","Nephron","Neuron"],2,0,"Nephron is the basic filter."],
  ["Stomata help with?",["Water absorption","Gaseous exchange","Reproduction","Only photosynthesis"],1,0,"CO₂ in, O₂/water vapour out."],
  ["Light reactions produce?",["Glucose","ATP and NADPH","CO₂","O₂ only"],1,1,"Light→ATP+NADPH in thylakoid."],
  ["Main nutrient absorption site?",["Large intestine","Stomach","Small intestine","Mouth"],2,1,"Villi in small intestine."],
  ["Green leaf colour due to?",["Xanthophyll","Carotenoids","Chlorophyll","Anthocyanin"],2,1,"Chlorophyll reflects green light."],
  ["Oxygenated blood pumped by?",["Right atrium","Right ventricle","Left ventricle","Both"],2,1,"Left ventricle→aorta."],
  ["Transpiration mainly through?",["Roots","Xylem","Stomata","Phloem"],2,1,"Stomata release water vapour."],
  ["Pulmonary vein carries?",["Deoxygenated to lungs","Oxygenated from lungs","CO₂ only","Mixed"],1,1,"Lungs→left atrium (oxygenated)."],
  ["ATP stands for?",["Adenine Triphosphate","Adenosine Triphosphate","Amino Triphosphate","Adenosine Trisphosphate"],1,1,"Energy currency of cells."],
  ["ADH acts on?",["PCT","Bowman's capsule","Loop of Henle","Collecting duct"],3,2,"ADH→increased water reabsorption."],
 ],
 "Laws of Motion":[
  ["Newton's 1st law is the law of?",["Gravitation","Inertia","Acceleration","Reaction"],1,0,"Objects resist changes in motion."],
  ["F=ma is Newton's?",["First Law","Second Law","Third Law","Conservation"],1,0,"Net force = mass × acceleration."],
  ["SI unit of force?",["Joule","Newton","Pascal","Watt"],1,0,"1 N = 1 kg·m/s²."],
  ["Action and reaction act on?",["Same object","Different objects","Vacuum only","Elastic only"],1,0,"3rd Law: different bodies."],
  ["Momentum=?",["Mass/Velocity","Mass×Velocity","Force×Time","Force/Time"],1,0,"p=mv."],
  ["Net force: 5kg at 3m/s²?",["5 N","8 N","15 N","3 N"],2,1,"F=5×3=15 N."],
  ["Rocket works on?",["1st Law","2nd Law","Conservation of Momentum","Archimedes"],2,1,"Momentum conserved."],
  ["Impulse=?",["Force×Distance","Force×Time","Mass×Accel","Work"],1,1,"J=FΔt=Δp."],
  ["1000kg car 20→0m/s in 4s. Braking force?",["5000 N","10000 N","2500 N","20000 N"],0,1,"a=5m/s²; F=5000 N."],
  ["Elastic collision conserves?",["Momentum only","KE only","Both momentum and KE","Neither"],2,2,"Both conserved in elastic."],
 ],
 "Chemical Reactions":[
  ["Combination reaction?",["2H₂+O₂→2H₂O","CaCO₃→CaO+CO₂","Fe+CuSO₄→FeSO₄+Cu","HCl+NaOH→NaCl+H₂O"],0,0,"Two substances→one product."],
  ["Burning Mg is?",["Decomposition","Combination","Displacement","Neutralisation"],1,0,"2Mg+O₂→2MgO."],
  ["Rust on iron is?",["FeO","Fe₂O₃·xH₂O","FeCO₃","FeSO₄"],1,0,"Hydrated iron(III) oxide."],
  ["Heat-releasing reaction?",["Endothermic","Exothermic","Photochemical","Electrolytic"],1,0,"Exothermic: heat released."],
  ["Zn+CuSO₄→?",["ZnO+Cu","ZnSO₄+Cu","Zn₂SO₄+Cu","ZnCu+SO₄"],1,0,"Zn displaces Cu."],
  ["Electrolysis of water is?",["Combination","Decomposition","Displacement","Double displacement"],1,1,"H₂O splits into H₂+O₂."],
  ["Rancidity caused by?",["Oxidation of fats","Reduction of proteins","Hydrolysis of sugars","Precipitation"],0,1,"Fats oxidise in air."],
  ["Rate doubles per?",["5°C","10°C","20°C","50°C"],1,2,"Van't Hoff rule."],
  ["Activation energy lowered by?",["Temperature","Catalyst","Concentration","Pressure"],1,2,"Alternate lower-energy pathway."],
  ["Oxidation in electrolytic cell at?",["Cathode","Anode","Both","Electrolyte"],1,2,"OIL RIG: Oxidation at Anode."],
 ],
 "Acids Bases & Salts":[
  ["pH of pure water?",["6","7","8","14"],1,0,"[H⁺]=[OH⁻]=10⁻⁷M→pH=7."],
  ["Acids turn blue litmus?",["Green","Red","Yellow","Purple"],1,0,"Acids turn blue litmus red."],
  ["NaOH is a?",["Strong acid","Weak acid","Strong base","Weak base"],2,0,"Fully dissociates."],
  ["Common salt is?",["NaHCO₃","Na₂CO₃","NaCl","NaNO₃"],2,0,"Sodium chloride."],
  ["Lemon juice is?",["Basic","Neutral","Acidic","Amphoteric"],2,0,"Citric acid, pH≈2-3."],
  ["Baking soda is?",["Na₂CO₃","NaHCO₃","NaOH","NaCl"],1,1,"NaHCO₃ = sodium hydrogen carbonate."],
  ["HCl+Na₂CO₃ gas evolved?",["H₂","Cl₂","CO₂","SO₂"],2,1,"CO₂ gas evolved."],
  ["pH<7 indicates?",["Basic","Neutral","Acidic","Salt"],2,1,"<7 acidic, 7 neutral, >7 basic."],
  ["Acid in ant sting?",["Acetic","Formic","Lactic","HCl"],1,2,"Formic acid (HCOOH)."],
  ["Buffer resists changes in?",["Temperature","pH","Concentration","Volume"],1,2,"Weak acid+conjugate base."],
 ],
 "Cell Structure":[
  ["Who first observed a cell?",["Leeuwenhoek","Robert Hooke","Schwann","Virchow"],1,0,"Hooke saw cork cells (1665)."],
  ["Powerhouse of cell?",["Nucleus","Ribosome","Mitochondria","Chloroplast"],2,0,"Mitochondria produce ATP."],
  ["Cell membrane made of?",["Proteins only","Cellulose","Phospholipid bilayer","Starch"],2,0,"Fluid mosaic model."],
  ["Plant cells have, animal cells lack?",["Mitochondria","Cell wall and chloroplast","Nucleus","Ribosomes"],1,0,"Cell wall + chloroplasts."],
  ["DNA found mainly in?",["Ribosome","Mitochondria only","Nucleus","Cytoplasm"],2,0,"Nuclear DNA."],
  ["Ribosomes synthesise?",["Lipids","Carbohydrates","Proteins","Nucleic acids"],2,1,"Translate mRNA→proteins."],
  ["Osmosis: water moves from?",["Low to high solute","High to low solute","High to low water","Low to high water"],0,1,"Low solute to high solute."],
  ["Golgi apparatus does?",["Energy production","Protein synthesis","Packaging and secretion","DNA replication"],2,1,"Modifies and dispatches proteins."],
  ["Meiosis produces cells with?",["2n","n","4n","Same as parent"],1,2,"Haploid (n) gametes."],
  ["Absent in prokaryotes?",["Ribosome","Cell membrane","Mitochondria","Cell wall"],2,2,"No membrane-bound organelles."],
 ],
 "Grammar & Usage":[
  ["Group noun is called?",["Proper noun","Collective noun","Abstract noun","Material noun"],1,0,"e.g. flock, team, committee."],
  ["Past tense of 'go'?",["Goed","Gone","Went","Going"],2,0,"Irregular: go→went→gone."],
  ["Passive voice sentence?",["She writes a letter","The letter was written by her","She wrote","She will write"],1,0,"Object+was/were+past participle."],
  ["Adjective modifies a?",["Verb","Adverb","Noun or pronoun","Conjunction"],2,0,"Adjectives qualify nouns."],
  ["Correct punctuation: 'It_s raining'?",["Its raining","Its' raining","It's raining","Its, raining"],2,0,"It's = it is needs apostrophe."],
  ["Gerund in 'Swimming is exercise'?",["is","good","Swimming","exercise"],2,1,"verb+ing used as noun."],
  ["Compound sentence?",["He ran.","Although he ran, he missed.","He ran, and she walked.","Running fast, he missed."],2,1,"Two independent clauses + conjunction."],
  ["'Wind whispered' is?",["Simile","Metaphor","Personification","Hyperbole"],2,2,"Human attribute given to wind."],
  ["'He said I am tired' — Indirect?",["He said he is tired","He said he was tired","He said I am tired","He said he's tired"],1,2,"Backshift: am→was."],
  ["Subjunctive used for?",["Facts","Commands","Wishes/hypotheticals","Questions"],2,2,"e.g. 'If I were king'."],
 ],
 "Real Numbers":[
  ["Every rational number is a?",["Natural number","Integer","Real number","Prime number"],2,0,"ℝ contains all rationals and irrationals."],
  ["HCF of 12 and 18?",["2","3","6","36"],2,0,"12=2²×3, 18=2×3². HCF=6."],
  ["LCM of 4 and 6?",["2","8","12","24"],2,0,"LCM×HCF=product → LCM=12."],
  ["π is classified as?",["Rational","Integer","Irrational","Natural"],2,0,"π cannot be expressed as p/q."],
  ["Euclid's lemma: a=bq+r, r satisfies?",["0<r<b","0≤r<b","0<r≤b","r=0 always"],1,0,"Remainder: 0≤r<b."],
  ["HCF(44,33)?",["11","22","33","4"],0,1,"44=33×1+11; 33=11×3+0 → HCF=11."],
  ["Which is irrational?",["√4","√9","√2","√16"],2,1,"√2≈1.414… cannot be p/q."],
  ["HCF(a,b)=4, LCM=60. a×b=?",["240","15","64","120"],0,1,"HCF×LCM=a×b → 240."],
  ["Decimal expansion of 17/8?",["2.125","2.875","1.875","2.25"],0,1,"17÷8=2.125 (terminating)."],
  ["6ⁿ never ends in 0 because?",["6 not prime","6ⁿ=2ⁿ×3ⁿ, no factor 5","6ⁿ always even","6 composite"],1,2,"No factor of 5 → no trailing zero."],
 ],
};
const FALLBACK=[
  ["SI unit of pressure?",["Newton","Pascal","Joule","Watt"],1,0,"1 Pa=1 N/m²."],
  ["Light fastest in?",["Water","Glass","Vacuum","Air"],2,0,"c=3×10⁸ m/s."],
  ["Most abundant gas in atmosphere?",["Oxygen","CO₂","Argon","Nitrogen"],3,0,"N₂≈78%."],
  ["Power=?",["F×d","W/t","ma","V×R"],1,1,"P=W/t."],
  ["Ohm's law: V=?",["IR","I/R","I²R","P/I"],0,1,"V=IR."],
  ["Mitochondria powerhouse because?",["Controls cell","Produces ATP","Stores DNA","Has ribosomes"],1,1,"Aerobic respiration→ATP."],
  ["De Broglie λ=?",["h/mv","mv/h","h·mv","m/hv"],0,2,"λ=h/p, wave-particle duality."],
];

// ── STATIC DATA ───────────────────────────────────────────
const NOTES_DATA=[
  {id:1,title:"Real Numbers",subject:"Mathematics",cls:"Class 10",size:"12 MB",color:"#5B21B6",emoji:"📐",bookmarked:false},
  {id:2,title:"Life Processes",subject:"Science",cls:"Class 10",size:"8.4 MB",color:"#10B981",emoji:"🧬",bookmarked:true},
  {id:3,title:"History of India",subject:"Social Science",cls:"Class 10",size:"15 MB",color:"#F59E0B",emoji:"🏛️",bookmarked:false},
  {id:4,title:"First Flight — Poems",subject:"English",cls:"Class 10",size:"6.3 MB",color:"#3B82F6",emoji:"📖",bookmarked:false},
  {id:5,title:"Carbon & Compounds",subject:"Science",cls:"Class 10",size:"9.7 MB",color:"#10B981",emoji:"⚗️",bookmarked:true},
  {id:6,title:"Quadratic Equations",subject:"Mathematics",cls:"Class 10",size:"7.2 MB",color:"#5B21B6",emoji:"📊",bookmarked:true},
  {id:7,title:"Democratic Politics",subject:"Social Science",cls:"Class 10",size:"11 MB",color:"#F59E0B",emoji:"🗳️",bookmarked:false},
  {id:8,title:"Optics & Light",subject:"Physics",cls:"Class 12",size:"14 MB",color:"#EC4899",emoji:"🔭",bookmarked:false},
  {id:9,title:"Thermodynamics",subject:"Chemistry",cls:"Class 11",size:"10 MB",color:"#F97316",emoji:"🌡️",bookmarked:false},
  {id:10,title:"Genetics & Evolution",subject:"Biology",cls:"Class 12",size:"18 MB",color:"#14B8A6",emoji:"🔬",bookmarked:true},
  {id:11,title:"Probability",subject:"Mathematics",cls:"Class 10",size:"5.4 MB",color:"#5B21B6",emoji:"🎲",bookmarked:false},
  {id:12,title:"Electromagnetic Waves",subject:"Physics",cls:"Class 12",size:"13 MB",color:"#EC4899",emoji:"⚡",bookmarked:false},
  {id:13,title:"Acids, Bases & Salts",subject:"Chemistry",cls:"Class 10",size:"8.8 MB",color:"#F97316",emoji:"🧪",bookmarked:true},
  {id:14,title:"Coordinate Geometry",subject:"Mathematics",cls:"Class 10",size:"6.1 MB",color:"#5B21B6",emoji:"📈",bookmarked:false},
  {id:15,title:"Ecosystems",subject:"Biology",cls:"Class 11",size:"16 MB",color:"#14B8A6",emoji:"🌿",bookmarked:false},
];
const SUBJECTS_CFG={
  "Mathematics":{color:T.p600,bg:T.p50,topics:["Quadratic Equations","Real Numbers","Trigonometry","Statistics","Polynomials","Coordinate Geometry","Probability"]},
  "Science":{color:T.green,bg:T.greenBg,topics:["Life Processes","Chemical Reactions","Light & Optics","Electricity","Acids Bases & Salts"]},
  "English":{color:T.blue,bg:T.blueBg,topics:["Grammar & Usage","Reading Comprehension","Writing Skills","Literature"]},
  "Physics":{color:T.pink,bg:T.pinkBg,topics:["Laws of Motion","Work & Energy","Waves & Sound","Optics"]},
  "Chemistry":{color:T.orange,bg:T.orangeBg,topics:["Acids Bases & Salts","Carbon Compounds","Metals & Non-metals","Periodic Table"]},
  "Biology":{color:T.teal,bg:T.tealBg,topics:["Cell Structure","Life Processes","Human Physiology","Genetics"]},
  "Social Science":{color:T.gold,bg:T.goldBg,topics:["History of India","Geography","Political Science","Economics"]},
};
const DIFF_CFG={
  Easy:{idx:0,emoji:"🌱",sub:"Build Basics",color:T.green,bg:T.greenBg,border:"#6EE7B7",timePer:45},
  Medium:{idx:1,emoji:"🔥",sub:"Test Understanding",color:T.orange,bg:T.orangeBg,border:"#FDBA74",timePer:60},
  Hard:{idx:2,emoji:"💀",sub:"Challenge Yourself",color:T.red,bg:T.redBg,border:"#FCA5A5",timePer:90},
};
const Q_COUNTS=[5,10,15,20,30];
const OPT_LBL=["A","B","C","D"];
const DIAGRAM_MAP=[
  {keys:["pythagor","hypotenuse","right triangle"],prompt:"pythagorean theorem right triangle labeled educational diagram clean white"},
  {keys:["cell","mitosis","chloroplast"],prompt:"animal cell diagram labeled educational biology clean white"},
  {keys:["atom","electron","proton","neutron"],prompt:"atom structure diagram labeled electrons protons neutrons educational"},
  {keys:["photosynthesis","chlorophyll"],prompt:"photosynthesis process diagram educational labeled clean"},
  {keys:["newton","free body","friction"],prompt:"Newton laws motion free body diagram educational physics"},
  {keys:["circuit","resistor","ohm"],prompt:"electric circuit diagram labeled resistor educational physics"},
  {keys:["wave","amplitude","wavelength"],prompt:"wave diagram labeled amplitude frequency wavelength educational"},
  {keys:["quadratic","parabola"],prompt:"quadratic parabola graph labeled educational math"},
  {keys:["dna","helix","nucleotide"],prompt:"DNA double helix structure labeled educational biology"},
];
const ROADMAP={
  Mathematics:[
    {ch:"Real Numbers",status:"done",wt:2,pct:100},{ch:"Polynomials",status:"done",wt:2,pct:100},
    {ch:"Quadratic Equations",status:"active",wt:8,pct:72},{ch:"Arithmetic Progressions",status:"pending",wt:5,pct:0},
    {ch:"Trigonometry",status:"pending",wt:8,pct:0},{ch:"Statistics",status:"pending",wt:4,pct:0},
  ],
  Science:[
    {ch:"Chemical Reactions",status:"done",wt:6,pct:100},{ch:"Life Processes",status:"done",wt:7,pct:100},
    {ch:"Electricity",status:"active",wt:7,pct:55},{ch:"Light — Optics",status:"pending",wt:6,pct:0},
    {ch:"Magnetic Effects",status:"pending",wt:5,pct:0},
  ],
  Physics:[
    {ch:"Laws of Motion",status:"done",wt:8,pct:100},{ch:"Work & Energy",status:"active",wt:6,pct:40},
    {ch:"Gravitation",status:"pending",wt:5,pct:0},{ch:"Waves & Sound",status:"pending",wt:5,pct:0},
  ],
};
const IMP_TOPICS=[
  {id:1,topic:"Quadratic Equations",subject:"Mathematics",wt:8,prob:98,tier:"vimp",revised:false},
  {id:2,topic:"Laws of Motion",subject:"Physics",wt:8,prob:96,tier:"vimp",revised:false},
  {id:3,topic:"Life Processes",subject:"Biology",wt:7,prob:95,tier:"vimp",revised:true},
  {id:4,topic:"Chemical Reactions",subject:"Chemistry",wt:6,prob:93,tier:"vimp",revised:true},
  {id:5,topic:"Electricity",subject:"Physics",wt:7,prob:91,tier:"vimp",revised:false},
  {id:6,topic:"Trigonometry",subject:"Mathematics",wt:8,prob:90,tier:"imp",revised:false},
  {id:7,topic:"Heredity & Evolution",subject:"Biology",wt:5,prob:87,tier:"imp",revised:false},
  {id:8,topic:"Light & Optics",subject:"Physics",wt:6,prob:85,tier:"imp",revised:false},
];
const MOCK_TESTS=[
  {id:"m1",title:"IIT-JEE Full Mock #1",subjects:["Physics","Chemistry","Maths"],q:90,mins:180,diff:"Hard",attempted:true,score:76},
  {id:"m2",title:"NEET Full Mock #1",subjects:["Physics","Chemistry","Biology"],q:180,mins:200,diff:"Hard",attempted:false,score:null},
  {id:"m3",title:"CBSE Class 10 — Maths",subjects:["Mathematics"],q:40,mins:180,diff:"Medium",attempted:true,score:88},
  {id:"m4",title:"CBSE Class 10 — Science",subjects:["Science"],q:40,mins:180,diff:"Medium",attempted:false,score:null},
  {id:"m5",title:"IIT-JEE Physics Sprint",subjects:["Physics"],q:30,mins:60,diff:"Hard",attempted:true,score:83},
];
const PREV_PAPERS=[
  {id:"p1",title:"JEE Main — Jan 2024",year:2024,board:"JEE",q:90,mins:180},
  {id:"p2",title:"NEET 2024",year:2024,board:"NEET",q:180,mins:200},
  {id:"p3",title:"CBSE Board Maths 2024",year:2024,board:"CBSE",q:40,mins:180},
  {id:"p4",title:"JEE Main — Jan 2023",year:2023,board:"JEE",q:90,mins:180},
  {id:"p5",title:"NEET 2023",year:2023,board:"NEET",q:180,mins:200},
  {id:"p6",title:"CBSE Board Science 2023",year:2023,board:"CBSE",q:40,mins:180},
  {id:"p7",title:"JEE Advanced 2023",year:2023,board:"JEE",q:54,mins:180},
  {id:"p8",title:"JEE Main 2022",year:2022,board:"JEE",q:90,mins:180},
  {id:"p9",title:"NEET 2022",year:2022,board:"NEET",q:180,mins:200},
];
const QUIZ_HISTORY=[
  {id:1,topic:"Quadratic Equations",subject:"Mathematics",accuracy:93,score:28,total:30,date:Date.now()-9*864e5,diff:"Hard"},
  {id:2,topic:"Life Processes",subject:"Biology",accuracy:87,score:13,total:15,date:Date.now()-8*864e5,diff:"Medium"},
  {id:3,topic:"Laws of Motion",subject:"Physics",accuracy:100,score:10,total:10,date:Date.now()-7*864e5,diff:"Hard"},
  {id:4,topic:"Real Numbers",subject:"Mathematics",accuracy:80,score:12,total:15,date:Date.now()-6*864e5,diff:"Medium"},
  {id:5,topic:"Chemical Reactions",subject:"Chemistry",accuracy:93,score:14,total:15,date:Date.now()-5*864e5,diff:"Hard"},
  {id:6,topic:"Cell Structure",subject:"Biology",accuracy:100,score:15,total:15,date:Date.now()-4*864e5,diff:"Medium"},
  {id:7,topic:"Grammar & Usage",subject:"English",accuracy:87,score:13,total:15,date:Date.now()-3*864e5,diff:"Easy"},
  {id:8,topic:"Acids Bases & Salts",subject:"Chemistry",accuracy:90,score:9,total:10,date:Date.now()-2*864e5,diff:"Hard"},
  {id:9,topic:"Quadratic Equations",subject:"Mathematics",accuracy:100,score:20,total:20,date:Date.now()-864e5,diff:"Hard"},
  {id:10,topic:"Laws of Motion",subject:"Physics",accuracy:87,score:13,total:15,date:Date.now(),diff:"Medium"},
];
const DEMO_TASK={
  type:"REACT_CODING_TASK",title:"Build QuizResultCard Component",
  description:"Create a React component with animated SVG score gauge, colour-coded question review, and retry handler.",
  requirements:["Animated SVG arc gauge","Correct/Wrong/Skipped labels","Hint accordion","Retry + Home buttons"],
  language:"jsx",framework:"React 18 + Tailwind CSS",
  starterCode:`// QuizResultCard.jsx\nexport default function QuizResultCard({score,total,questions,answers,onRetry,onHome}){\n  // TODO: SVG gauge, question breakdown\n  return <div className="p-6">{/* implement */}</div>;\n}`,
  sentAt:new Date().toISOString(),
};
const STATUS_CFG={done:{color:T.green,bg:T.greenBg,icon:"✅"},active:{color:T.p600,bg:T.p50,icon:"🔄"},pending:{color:T.g400,bg:T.g100,icon:"⏳"}};
const TRACK_LABELS={iitjee:"IIT-JEE",neet:"NEET",school:"School Boards"};
const TRACK_ICONS={iitjee:"⚛️",neet:"🧬",school:"📚"};
const ALL_SUBJECTS=["Mathematics","Physics","Chemistry","Biology","English","History","Geography","Computer Science","Economics","Political Science"];
const BOARDS=["CBSE","ICSE","Maharashtra State Board","Tamil Nadu State Board","Other State Board"];
const TRACKS=[
  {id:"iitjee",label:"IIT-JEE",icon:"⚛️",desc:"Engineering Entrance"},
  {id:"neet",label:"NEET",icon:"🧬",desc:"Medical Entrance"},
  {id:"school",label:"School Boards",icon:"📚",desc:"CBSE / ICSE / State"},
];
const GEMINI_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const SYS_PROMPT="You are an expert STEM tutor for Indian students (IIT-JEE, NEET, CBSE). Explain any concept so simply a 7-year-old could understand using real-world analogies. Structure: Analogy→Concept→Formula→Example→Key Takeaway. Under 280 words. Use **bold** for key terms. Always explain WHY, not just HOW.";
const DAILY_LIMIT=25;
const APEX_THR={minAvg:85,minQuizzes:10,minStreak:5,minPerfect:3};

// ── UTILITIES ─────────────────────────────────────────────
const shuffle=arr=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const fmtTime=s=>`${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
const fmtDate=ts=>new Date(ts).toLocaleDateString([],{month:"short",day:"numeric"});

function buildQuiz(subject,topic,difficulty,count){
  const diffIdx=DIFF_CFG[difficulty]?.idx??1;
  let bank=QDB[topic]?[...QDB[topic]]:[];
  if(bank.length<6)(SUBJECTS_CFG[subject]?.topics||[]).forEach(t=>{if(QDB[t])bank=[...bank,...QDB[t]]});
  if(bank.length<6)bank=[...bank,...FALLBACK];
  const pref=shuffle(bank.filter(q=>q[3]===diffIdx));
  const supp=shuffle(bank.filter(q=>q[3]!==diffIdx));
  const pool=pref.length>=count?pref:[...pref,...supp];
  const seen=new Set();const unique=[];
  for(const q of pool){if(!seen.has(q[0])){seen.add(q[0]);unique.push(q)}if(unique.length>=count)break}
  return unique.slice(0,count).map((q,i)=>({id:i,question:q[0],options:q[1],correct:q[2],difficulty:["Easy","Medium","Hard"][q[3]]??"Medium",hint:q[4]??""}));
}
function detectDiagram(text){
  if(!text)return null;
  const low=text.toLowerCase();
  for(const{keys,prompt}of DIAGRAM_MAP)if(keys.some(k=>low.includes(k)))return`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=700&height=450&nologo=true`;
  return null;
}
function getOptState(qIdx,optIdx,answers,questions){
  if(!(qIdx in answers))return"idle";
  const picked=answers[qIdx]===optIdx,isCorrect=questions[qIdx].correct===optIdx;
  if(picked&&isCorrect)return"correct-hit";
  if(picked&&!isCorrect)return"wrong-hit";
  if(!picked&&isCorrect)return"correct-show";
  return"dimmed";
}
const OPT_STYLE={
  "idle":{bg:T.white,border:T.g200,txt:T.g800,lblBg:T.g100,lblTxt:T.g600},
  "correct-hit":{bg:"#ECFDF5",border:T.green,txt:T.greenDk,lblBg:T.green,lblTxt:T.white},
  "correct-show":{bg:"#F0FDF4",border:T.green,txt:T.green,lblBg:"#BBF7D0",lblTxt:T.greenDk},
  "wrong-hit":{bg:T.redBg,border:T.red,txt:T.redDk,lblBg:T.red,lblTxt:T.white},
  "dimmed":{bg:T.g50,border:T.g100,txt:T.g400,lblBg:T.g100,lblTxt:T.g400},
};
function evaluateApex(history,streak){
  if(!history?.length)return{eligible:false,stats:{n:0,avg:0,perfect:0,streak},subjAvg:[]};
  const avg=history.reduce((s,q)=>s+q.accuracy,0)/history.length;
  const perfect=history.filter(q=>q.accuracy===100).length;
  const n=history.length;
  const ok=n>=APEX_THR.minQuizzes&&avg>=APEX_THR.minAvg&&streak>=APEX_THR.minStreak&&perfect>=APEX_THR.minPerfect;
  const tier=avg>=95?"PLATINUM":avg>=90?"GOLD":"SILVER";
  const subjMap={};
  history.forEach(q=>{if(!subjMap[q.subject])subjMap[q.subject]=[];subjMap[q.subject].push(q.accuracy)});
  const subjAvg=Object.entries(subjMap).map(([s,arr])=>({subject:s,avg:Math.round(arr.reduce((a,b)=>a+b,0)/arr.length)}));
  return{eligible:ok,tier,stats:{n,avg:Math.round(avg),perfect,streak},subjAvg,
    payload:ok?{status:"Apex Stark Executive Contract Eligibility Verified",tier,
      id:`ASX-${new Date().getFullYear()}-${tier}-${Math.random().toString(36).slice(2,10).toUpperCase()}`,
      verifiedAt:new Date().toISOString(),metadata:{n,avg:Math.round(avg),perfect,streak}}:null};
}

// ── HOOKS ─────────────────────────────────────────────────
function useMemoryRouter(){
  const[memories,setMemories]=useState(()=>ls.get("core_memory")||[]);
  const persist=next=>{setMemories(next);ls.set("core_memory",next)};
  const processInput=useCallback(raw=>{
    const lines=raw.split("\n");const fresh=[];const clean=[];
    lines.forEach(line=>{const t=line.trimStart();
      if(t.startsWith("@vimp "))fresh.push({id:`${Date.now()}-${Math.random()}`,content:t.slice(6).trim(),priority:"vimp",label:"VERY IMPORTANT",ts:Date.now()});
      else if(t.startsWith("@imp "))fresh.push({id:`${Date.now()}-${Math.random()}`,content:t.slice(5).trim(),priority:"imp",label:"IMPORTANT",ts:Date.now()});
      else clean.push(line)});
    if(fresh.length)persist([...memories,...fresh]);
    return{cleanText:clean.join("\n"),captured:fresh.length};
  },[memories]);
  const remove=useCallback(id=>persist(memories.filter(m=>m.id!==id)),[memories]);
  const clearAll=useCallback(()=>persist([]),[]);
  return{memories,processInput,remove,clearAll};
}
function useContextBridge(){
  const[received,setReceived]=useState(null);
  const[syncing,setSyncing]=useState(false);
  const[log,setLog]=useState([]);
  useEffect(()=>{
    const h=ev=>{if(ev.data?.type!=="STUDY_CONTEXT_SYNC")return;
      setReceived(ev.data.payload);setSyncing(false);
      setLog(p=>[{ts:Date.now(),dir:"IN",summary:`✓ "${ev.data.payload.title}"`},...p])};
    window.addEventListener("message",h);return()=>window.removeEventListener("message",h);
  },[]);
  const broadcast=useCallback(payload=>{
    setSyncing(true);setLog(p=>[{ts:Date.now(),dir:"OUT",summary:`→ "${payload.title}"`},...p]);
    setTimeout(()=>window.postMessage({type:"STUDY_CONTEXT_SYNC",payload},"*"),850);
  },[]);
  return{received,syncing,log,broadcast};
}

// ── SHARED COMPONENTS ─────────────────────────────────────
const Card=({children,style={},onClick})=>(
  <div onClick={onClick} style={{background:T.white,borderRadius:18,boxShadow:"0 1px 3px rgba(0,0,0,.06),0 4px 16px rgba(109,40,217,.08)",...style}}>{children}</div>
);
const Badge=({children,color=T.p600,bg=T.p50})=>(
  <span style={{fontSize:10.5,fontWeight:700,padding:"3px 9px",borderRadius:99,background:bg,color,letterSpacing:.3}}>{children}</span>
);
const BackHeader=({title,sub,onBack,right})=>(
  <div style={{background:T.white,padding:"50px 18px 14px",borderBottom:`1px solid ${T.g100}`,boxShadow:"0 2px 12px rgba(109,40,217,.07)",flexShrink:0}}>
    <div style={{display:"flex",alignItems:"center",gap:12}}>
      <button onClick={onBack} style={{width:36,height:36,borderRadius:10,background:T.g100,border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><ArrowLeft size={17} color={T.g800}/></button>
      <div style={{flex:1}}>
        <h2 style={{fontSize:20,fontWeight:900,color:T.g900,margin:0,letterSpacing:-.2}}>{title}</h2>
        {sub&&<p style={{fontSize:11.5,color:T.g400,margin:"3px 0 0",fontWeight:500}}>{sub}</p>}
      </div>
      {right}
    </div>
  </div>
);
function SelectDropdown({label,options,value,onChange,placeholder,disabled=false}){
  const[open,setOpen]=useState(false);const ref=useRef();
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h)},[]);
  return(
    <div ref={ref} style={{position:"relative"}}>
      {label&&<label style={{display:"block",fontSize:12,fontWeight:700,color:T.g500,letterSpacing:.5,marginBottom:7,textTransform:"uppercase"}}>{label}</label>}
      <button onClick={()=>!disabled&&setOpen(o=>!o)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 16px",borderRadius:13,cursor:disabled?"not-allowed":"pointer",border:`2px solid ${open?T.p400:T.g200}`,background:disabled?T.g50:T.white,color:value?T.g800:T.g400,fontSize:14.5,fontWeight:value?600:400,boxShadow:open?`0 0 0 3px ${T.p100}`:"none",transition:"all .15s"}}>
        <span>{value||placeholder}</span>
        <ChevronDown size={15} color={T.p500} style={{transform:open?"rotate(180deg)":"none",transition:".2s",flexShrink:0}}/>
      </button>
      {open&&<div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,zIndex:999,background:T.white,borderRadius:14,border:`1.5px solid ${T.p100}`,boxShadow:"0 8px 32px rgba(109,40,217,.18)",overflow:"hidden",animation:"dropIn .15s ease"}}>
        {options.map(opt=>(
          <button key={opt} onClick={()=>{onChange(opt);setOpen(false)}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 16px",background:value===opt?T.p50:"transparent",color:value===opt?T.p700:T.g800,fontSize:14,fontWeight:value===opt?700:400,border:"none",cursor:"pointer",borderBottom:`1px solid ${T.g100}`}}>
            {opt}{value===opt&&<Check size={13} color={T.p600}/>}
          </button>
        ))}
      </div>}
    </div>
  );
}
function RichText({text}){
  if(!text)return null;
  return text.split("\n").map((line,li)=>(
    <span key={li}>
      {line.split(/(\*\*[^*]+\*\*)/g).map((p,pi)=>p.startsWith("**")&&p.endsWith("**")?<strong key={pi}>{p.slice(2,-2)}</strong>:<span key={pi}>{p}</span>)}
      {li<text.split("\n").length-1&&<br/>}
    </span>
  ));
}
function DiagramImg({src}){
  const[state,setState]=useState("loading");
  return(
    <div style={{marginTop:12,borderRadius:14,overflow:"hidden",border:`1.5px solid ${T.p100}`,background:state==="loading"?T.g50:T.white,minHeight:state==="loading"?160:0,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
      {state==="loading"&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}><Loader2 size={20} color={T.p400} style={{animation:"spin 1s linear infinite"}}/><span style={{fontSize:11,color:T.g400}}>Generating diagram…</span></div>}
      {state==="error"&&<div style={{padding:16,display:"flex",alignItems:"center",gap:8,color:T.g400,fontSize:12}}><ImageOff size={16}/> Unavailable</div>}
      <img src={src} alt="Diagram" onLoad={()=>setState("ready")} onError={()=>setState("error")} style={{width:"100%",display:state==="ready"?"block":"none",borderRadius:13}}/>
    </div>
  );
}

// ── AUTH SCREENS ──────────────────────────────────────────
function BotIllustration(){
  const[pulse,setPulse]=useState(false);
  useEffect(()=>{const t=setInterval(()=>setPulse(p=>!p),1800);return()=>clearInterval(t)},[]);
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:0}}>
      <div style={{width:148,height:148,borderRadius:"50%",background:`radial-gradient(circle,${T.p400}33 0%,transparent 70%)`,display:"flex",alignItems:"center",justifyContent:"center",transition:"transform .9s",transform:pulse?"scale(1.06)":"scale(1)"}}>
        <div style={{width:112,height:112,borderRadius:"50%",background:`linear-gradient(145deg,${T.p400},${T.p700})`,boxShadow:`0 8px 32px ${T.p600}77`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative"}}>
          <div style={{position:"absolute",top:-18,left:"50%",transform:"translateX(-50%)",width:3,height:18,background:T.p400,borderRadius:3}}/>
          <div style={{position:"absolute",top:-26,left:"50%",transform:"translateX(-50%)",width:10,height:10,borderRadius:"50%",background:pulse?T.gold:T.p300,boxShadow:pulse?`0 0 12px ${T.gold}`:"none",transition:"all .4s"}}/>
          <div style={{display:"flex",gap:14,marginBottom:8}}>
            {[0,1].map(i=>(
              <div key={i} style={{width:18,height:18,borderRadius:"50%",background:T.white,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 8px ${T.p300}`}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:pulse?T.p900:T.p700,transition:"background .4s"}}/>
              </div>
            ))}
          </div>
          <div style={{width:40,height:10,borderRadius:"0 0 20px 20px",background:"rgba(255,255,255,.25)",border:"2px solid rgba(255,255,255,.4)",borderTop:"none"}}/>
          <div style={{position:"absolute",top:-10,right:-6,width:32,height:32,background:`linear-gradient(135deg,${T.p900},${T.p700})`,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,.2)",transform:"rotate(12deg)"}}>
            <GraduationCap size={18} color={T.gold}/>
          </div>
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:16}}>
        {["Maths 🔢","Physics ⚡","Bio 🧬"].map((chip,i)=>(
          <div key={i} style={{padding:"5px 12px",background:"rgba(255,255,255,.12)",backdropFilter:"blur(8px)",borderRadius:99,border:"1px solid rgba(255,255,255,.2)",color:T.white,fontSize:11,fontWeight:600,animation:`floatChip${i} 2.5s ease-in-out infinite`,animationDelay:`${i*.3}s`}}>{chip}</div>
        ))}
      </div>
    </div>
  );
}

function AuthScreen(){
  const[show,setShow]=useState(false);
  const[mode,setMode]=useState("login"); // login | signup
  const[email,setEmail]=useState("");
  const[password,setPassword]=useState("");
  const[showPwd,setShowPwd]=useState(false);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState("");
  const[notice,setNotice]=useState("");

  useEffect(()=>{const t=setTimeout(()=>setShow(true),900);return()=>clearTimeout(t)},[]);

  const validateForm=()=>{
    if(!email.trim()||!/^\S+@\S+\.\S+$/.test(email))return"Enter a valid email address";
    if(password.length<6)return"Password must be at least 6 characters";
    return"";
  };

  const handleEmailAuth=async()=>{
    const v=validateForm();
    if(v){setError(v);return}
    setError("");setNotice("");setLoading(true);
    try{
      if(mode==="signup"){
        const{data,error:err}=await supabase.auth.signUp({email,password});
        if(err)throw err;
        if(data?.user&&!data.session){
          setNotice("✅ Account created! Check your email to confirm, then log in.");
          setMode("login");
        }
        // If email confirmation is OFF in Supabase settings, session exists immediately
        // and onAuthStateChange in App() will move the user straight into onboarding.
      }else{
        const{error:err}=await supabase.auth.signInWithPassword({email,password});
        if(err)throw err;
        // onAuthStateChange listener in App() handles the redirect into the app.
      }
    }catch(err){
      setError(err.message||"Something went wrong. Please try again.");
    }finally{setLoading(false)}
  };

  const handleGoogle=async()=>{
    setError("");setLoading(true);
    try{
      const{error:err}=await supabase.auth.signInWithOAuth({
        provider:"google",
        options:{redirectTo:window.location.origin},
      });
      if(err)throw err;
    }catch(err){setError(err.message||"Google sign-in failed");setLoading(false)}
  };

  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${T.p950} 0%,${T.p700} 55%,${T.p600} 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",padding:"40px 24px 32px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-80,right:-60,width:240,height:240,borderRadius:"50%",background:`radial-gradient(circle,${T.p400}30,transparent)`,pointerEvents:"none"}}/>
      <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.1)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,.2)",borderRadius:99,padding:"6px 16px",alignSelf:"flex-start"}}>
        <Zap size={13} color={T.gold} fill={T.gold}/><span style={{color:T.white,fontSize:12,fontWeight:700,letterSpacing:1}}>STUDYAI ELITE</span>
      </div>

      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,flex:1,justifyContent:"center"}}>
        <BotIllustration/>
        <div style={{textAlign:"center",maxWidth:320}}>
          <h1 style={{color:T.white,fontSize:28,fontWeight:800,lineHeight:1.15,margin:"0 0 10px",letterSpacing:-.5}}>Your AI-Powered<br/><span style={{background:`linear-gradient(90deg,${T.gold},#FDE68A)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Study Partner</span></h1>
          <p style={{color:"rgba(255,255,255,.65)",fontSize:14,lineHeight:1.6,margin:0}}>Crack IIT-JEE · NEET · Board Exams<br/>with personalised AI guidance.</p>
        </div>
      </div>

      <div style={{width:"100%",maxWidth:440,opacity:show?1:0,transform:show?"translateY(0)":"translateY(30px)",transition:"all .5s cubic-bezier(.34,1.56,.64,1)"}}>
        <div style={{background:"rgba(255,255,255,.08)",backdropFilter:"blur(20px)",borderRadius:24,border:"1.5px solid rgba(255,255,255,.15)",padding:"24px 22px"}}>

          {/* Tab toggle */}
          <div style={{display:"flex",background:"rgba(255,255,255,.08)",borderRadius:12,padding:4,marginBottom:18}}>
            {["login","signup"].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setError("");setNotice("")}}
                style={{flex:1,padding:"9px",borderRadius:9,border:"none",cursor:"pointer",
                  background:mode===m?T.white:"transparent",
                  color:mode===m?T.p700:"rgba(255,255,255,.6)",
                  fontSize:13,fontWeight:700,transition:"all .2s"}}>
                {m==="login"?"Log In":"Sign Up"}
              </button>
            ))}
          </div>

          {/* Real email/password form */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{position:"relative"}}>
              <Mail size={16} color="rgba(255,255,255,.4)" style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)"}}/>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email"
                style={{width:"100%",padding:"13px 14px 13px 40px",borderRadius:13,
                  border:"1.5px solid rgba(255,255,255,.18)",background:"rgba(255,255,255,.07)",
                  color:T.white,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
            </div>
            <div style={{position:"relative"}}>
              <Lock size={16} color="rgba(255,255,255,.4)" style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)"}}/>
              <input type={showPwd?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="Password (min 6 characters)" autoComplete={mode==="signup"?"new-password":"current-password"}
                onKeyDown={e=>{if(e.key==="Enter")handleEmailAuth()}}
                style={{width:"100%",padding:"13px 40px 13px 40px",borderRadius:13,
                  border:"1.5px solid rgba(255,255,255,.18)",background:"rgba(255,255,255,.07)",
                  color:T.white,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
              <button onClick={()=>setShowPwd(s=>!s)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:2}}>
                {showPwd?<EyeOff size={16} color="rgba(255,255,255,.4)"/>:<Eye size={16} color="rgba(255,255,255,.4)"/>}
              </button>
            </div>

            {error&&<div style={{padding:"9px 12px",borderRadius:10,background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.3)",color:"#FCA5A5",fontSize:12,fontWeight:600}}>⚠️ {error}</div>}
            {notice&&<div style={{padding:"9px 12px",borderRadius:10,background:"rgba(16,185,129,.15)",border:"1px solid rgba(16,185,129,.3)",color:"#6EE7B7",fontSize:12,fontWeight:600}}>{notice}</div>}

            <button onClick={handleEmailAuth} disabled={loading}
              style={{width:"100%",padding:"14px",borderRadius:13,border:"none",cursor:loading?"wait":"pointer",
                background:loading?"rgba(255,255,255,.15)":`linear-gradient(135deg,${T.gold},#FDE68A)`,
                color:loading?"rgba(255,255,255,.5)":T.p900,fontSize:15,fontWeight:800,
                display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:4}}>
              {loading?<Loader2 size={16} style={{animation:"spin 1s linear infinite"}}/>:null}
              {loading?"Please wait…":mode==="login"?"Log In":"Create Account"}
            </button>
          </div>

          {/* Divider */}
          <div style={{display:"flex",alignItems:"center",gap:10,margin:"16px 0"}}>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,.15)"}}/>
            <span style={{color:"rgba(255,255,255,.4)",fontSize:11,fontWeight:600}}>OR</span>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,.15)"}}/>
          </div>

          {/* Real Google OAuth */}
          <button onClick={handleGoogle} disabled={loading}
            style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"13px 20px",
              borderRadius:14,border:"1.5px solid rgba(255,255,255,.18)",background:T.white,
              color:T.g800,fontSize:14,fontWeight:600,cursor:loading?"wait":"pointer"}}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <span style={{flex:1,textAlign:"center"}}>Continue with Google</span>
          </button>

          <p style={{textAlign:"center",color:"rgba(255,255,255,.35)",fontSize:10.5,marginTop:16,lineHeight:1.6}}>
            Real account · Secured by Supabase Auth<br/>
            By continuing, you agree to our <span style={{color:"rgba(255,255,255,.65)",textDecoration:"underline",cursor:"pointer"}}>Terms</span> & <span style={{color:"rgba(255,255,255,.65)",textDecoration:"underline",cursor:"pointer"}}>Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfileSetupScreen({onComplete}){
  const[step,setStep]=useState(0);
  const[form,setForm]=useState({name:"",class:"",board:"",track:"",subjects:[]});
  const[err,setErr]=useState("");
  const STEPS=["Your Details","Study Track","Subjects"];
  const validate=()=>{
    if(step===0){if(!form.name.trim())return"Please enter your name";if(!form.class)return"Please select your class";if(!form.board)return"Please select your board";}
    if(step===1&&!form.track)return"Please choose a study track";
    if(step===2&&form.subjects.length<2)return"Pick at least 2 subjects";
    return"";
  };
  const next=()=>{const e=validate();if(e){setErr(e);return}setErr("");if(step<STEPS.length-1)setStep(s=>s+1);else onComplete(form)};
  const toggleSub=s=>setForm(f=>({...f,subjects:f.subjects.includes(s)?f.subjects.filter(x=>x!==s):[...f.subjects,s]}));
  return(
    <div style={{minHeight:"100vh",background:T.g50,display:"flex",flexDirection:"column"}}>
      <div style={{background:`linear-gradient(135deg,${T.p700},${T.p600})`,padding:"20px 24px 28px",borderRadius:"0 0 28px 28px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div><p style={{color:"rgba(255,255,255,.65)",fontSize:12,fontWeight:600,margin:0}}>STEP {step+1} OF {STEPS.length}</p><h2 style={{color:T.white,fontSize:22,fontWeight:800,margin:"4px 0 0"}}>{STEPS[step]}</h2></div>
          <div style={{width:48,height:48,borderRadius:"50%",background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center"}}><GraduationCap color={T.gold} size={22}/></div>
        </div>
        <div style={{height:6,borderRadius:99,background:"rgba(255,255,255,.15)",overflow:"hidden"}}>
          <div style={{height:"100%",width:`${(step/(STEPS.length-1))*100}%`,background:`linear-gradient(90deg,${T.gold},#FDE68A)`,borderRadius:99,transition:"width .5s cubic-bezier(.34,1.56,.64,1)",minWidth:step===0?"8%":undefined}}/>
        </div>
      </div>
      <div style={{flex:1,padding:"24px 20px",overflowY:"auto"}}>
        {step===0&&<div style={{display:"flex",flexDirection:"column",gap:20}}>
          <Card style={{padding:20}}>
            <label style={{display:"block",fontSize:13,fontWeight:600,color:T.g600,marginBottom:6}}>Your Name</label>
            <input type="text" placeholder="e.g. Priya Sharma" value={form.name} onChange={e=>{setForm(f=>({...f,name:e.target.value}));setErr("")}} style={{width:"100%",padding:"13px 16px",borderRadius:12,border:`2px solid ${form.name?T.p500:T.g200}`,fontSize:15,fontWeight:600,color:T.g800,outline:"none",boxSizing:"border-box",background:T.white,fontFamily:"inherit"}}/>
          </Card>
          <Card style={{padding:20}}><div style={{display:"flex",flexDirection:"column",gap:16}}>
            <SelectDropdown label="Class / Grade" options={Array.from({length:7},(_,i)=>`Class ${i+6}`)} value={form.class} onChange={v=>{setForm(f=>({...f,class:v}));setErr("")}} placeholder="Select your class"/>
            <SelectDropdown label="Board" options={BOARDS} value={form.board} onChange={v=>{setForm(f=>({...f,board:v}));setErr("")}} placeholder="Select your board"/>
          </div></Card>
        </div>}
        {step===1&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
          {TRACKS.map(t=>(
            <button key={t.id} onClick={()=>{setForm(f=>({...f,track:t.id}));setErr("")}} style={{display:"flex",alignItems:"center",gap:16,padding:"18px 20px",borderRadius:18,border:`2.5px solid ${form.track===t.id?T.p600:T.g200}`,background:form.track===t.id?T.p50:T.white,boxShadow:form.track===t.id?`0 4px 20px ${T.p400}30`:"0 2px 8px rgba(0,0,0,.05)",cursor:"pointer",transition:"all .2s",width:"100%",textAlign:"left"}}>
              <div style={{width:52,height:52,borderRadius:14,background:form.track===t.id?`linear-gradient(135deg,${T.p600},${T.p700})`:T.g100,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{t.icon}</div>
              <div style={{flex:1}}><div style={{fontSize:17,fontWeight:800,color:form.track===t.id?T.p800:T.g800}}>{t.label}</div><div style={{fontSize:13,color:T.g400,marginTop:2}}>{t.desc}</div></div>
              <div style={{width:22,height:22,borderRadius:"50%",border:`2.5px solid ${form.track===t.id?T.p600:T.g300}`,background:form.track===t.id?T.p600:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>{form.track===t.id&&<Check size={12} color={T.white}/>}</div>
            </button>
          ))}
        </div>}
        {step===2&&<div style={{display:"flex",flexDirection:"column",gap:20}}>
          <div style={{padding:"10px 14px",background:T.p50,borderRadius:10,border:`1px solid ${T.p100}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:13,color:T.p700,fontWeight:600}}>{form.subjects.length} selected</span>
            <span style={{fontSize:12,color:T.g400}}>Pick 2 or more</span>
          </div>
          <Card style={{padding:20}}><div style={{display:"flex",flexWrap:"wrap",gap:10}}>
            {ALL_SUBJECTS.map(s=>(
              <button key={s} onClick={()=>toggleSub(s)} style={{padding:"8px 16px",borderRadius:999,border:`2px solid ${form.subjects.includes(s)?T.p600:T.g200}`,background:form.subjects.includes(s)?T.p600:T.white,color:form.subjects.includes(s)?T.white:T.g600,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all .18s",display:"inline-flex",alignItems:"center",gap:6,boxShadow:form.subjects.includes(s)?`0 2px 10px ${T.p400}55`:"none"}}>
                {form.subjects.includes(s)&&<Check size={12}/>}{s}
              </button>
            ))}
          </div></Card>
        </div>}
      </div>
      {err&&<div style={{margin:"0 20px",padding:"10px 16px",background:T.redBg,borderRadius:10,border:`1px solid ${T.red}30`,fontSize:13,color:T.red,fontWeight:600}}>⚠️ {err}</div>}
      <div style={{padding:"16px 20px 32px",display:"flex",gap:12,flexShrink:0}}>
        {step>0&&<button onClick={()=>{setStep(s=>s-1);setErr("")}} style={{padding:"15px 20px",borderRadius:14,border:`2px solid ${T.g200}`,background:T.white,color:T.p600,fontSize:15,fontWeight:700,cursor:"pointer"}}>Back</button>}
        <button onClick={next} style={{flex:1,padding:"15px 24px",borderRadius:14,border:"none",background:`linear-gradient(135deg,${T.p600},${T.p700})`,color:T.white,fontSize:16,fontWeight:800,cursor:"pointer",boxShadow:`0 4px 20px ${T.p600}50`,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {step===STEPS.length-1?"Start Learning ":"Continue "}<ArrowRight size={18}/>
        </button>
      </div>
    </div>
  );
}

// ── HOME DASHBOARD (Screen 4) ─────────────────────────────
function HomeDashboard({profile,onNav}){
  const name=(profile?.name||"Student").split(" ")[0];
  const streak=profile?.streak||7;
  const NODES=[
    {id:"chat",label:"AI Teacher",sub:"Ask anything, get explained",Icon:Brain,bg:T.p100,ic:T.p600},
    {id:"notes",label:"Notes",sub:"Your smart study notes",Icon:FileText,bg:T.greenBg,ic:T.green},
    {id:"quiz-setup",label:"Quiz",sub:"Test your knowledge",Icon:Zap,bg:T.orangeBg,ic:T.orange},
    {id:"exam",label:"Exam Mode",sub:"Practice, Revise & Ace",Icon:Trophy,bg:T.pinkBg,ic:T.pink},
  ];
  const CONT=[
    {id:1,title:"Real Numbers",subject:"Mathematics",cls:"Class 10",pct:48,color:T.p600},
    {id:2,title:"Life Processes",subject:"Science",cls:"Class 10",pct:30,color:T.green},
  ];
  return(
    <div style={{display:"flex",flexDirection:"column",flex:1}}>
      <div style={{background:`linear-gradient(148deg,${T.p950} 0%,${T.p800} 45%,${T.p600} 100%)`,padding:"54px 20px 26px",borderRadius:"0 0 30px 30px",flexShrink:0,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-70,right:-50,width:220,height:220,borderRadius:"50%",background:`radial-gradient(circle,${T.p400}28,transparent)`,pointerEvents:"none"}}/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
          <div><h1 style={{color:T.white,fontSize:26,fontWeight:900,margin:0,letterSpacing:-.3}}>Hi, {name}! 👋</h1><p style={{color:"rgba(255,255,255,.58)",fontSize:13,margin:"5px 0 0",fontWeight:500}}>Ready to learn something new today?</p></div>
          <button style={{width:42,height:42,borderRadius:13,background:"rgba(255,255,255,.10)",border:"1px solid rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Bell size={18} color={T.white}/></button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,.10)",backdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,.15)",borderRadius:14,padding:"12px 16px"}}>
          <Search size={15} color="rgba(255,255,255,.45)"/><span style={{color:"rgba(255,255,255,.38)",fontSize:13.5}}>Search topics, notes, questions…</span>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 8px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:22}}>
          <Card style={{padding:"15px 14px",display:"flex",alignItems:"center",gap:11}}>
            <div style={{width:44,height:44,borderRadius:13,background:T.orangeBg,display:"flex",alignItems:"center",justifyContent:"center"}}><Flame size={22} color={T.orange}/></div>
            <div><div style={{fontSize:26,fontWeight:900,color:T.g900,lineHeight:1,letterSpacing:-1}}>{streak}</div><div style={{fontSize:10.5,fontWeight:600,color:T.g400,marginTop:3}}>Day Streak 🔥</div></div>
          </Card>
          <Card style={{padding:"15px 14px",display:"flex",alignItems:"center",gap:11}}>
            <div style={{width:44,height:44,borderRadius:13,background:T.p50,display:"flex",alignItems:"center",justifyContent:"center"}}><Target size={22} color={T.p600}/></div>
            <div><div style={{fontSize:26,fontWeight:900,color:T.g900,lineHeight:1,letterSpacing:-1}}>4/6</div><div style={{fontSize:10.5,fontWeight:600,color:T.g400,marginTop:3}}>Study Goal</div></div>
          </Card>
        </div>
        <p style={{fontSize:15,fontWeight:800,color:T.g900,margin:"0 0 13px",letterSpacing:-.2}}>What do you want to do today?</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:22}}>
          {NODES.map(({id,label,sub,Icon,bg,ic})=>(
            <Card key={id} onClick={()=>onNav(id)} style={{padding:"17px 14px",cursor:"pointer",border:id==="chat"?`1.5px solid ${T.p200}`:"1.5px solid transparent",transition:"transform .12s"}}
              onPointerDown={e=>e.currentTarget.style.transform="scale(.96)"} onPointerUp={e=>e.currentTarget.style.transform="scale(1)"}>
              <div style={{width:46,height:46,borderRadius:14,background:bg,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:13}}><Icon size={22} color={ic} strokeWidth={2}/></div>
              <div style={{fontSize:14.5,fontWeight:800,color:T.g900,marginBottom:4}}>{label}</div>
              <div style={{fontSize:11,color:T.g500,lineHeight:1.45,fontWeight:500}}>{sub}</div>
            </Card>
          ))}
        </div>
        <p style={{fontSize:15,fontWeight:800,color:T.g900,margin:"0 0 13px",letterSpacing:-.2}}>Continue Learning</p>
        <div style={{display:"flex",flexDirection:"column",gap:11}}>
          {CONT.map(({id,title,subject,cls,pct,color})=>(
            <Card key={id} style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:13,cursor:"pointer"}}>
              <div style={{width:44,height:44,borderRadius:13,background:`${color}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><BookOpen size={20} color={color}/></div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13.5,fontWeight:700,color:T.g800,marginBottom:2}}>{title}</div>
                <div style={{fontSize:11,color:T.g400,marginBottom:9,fontWeight:500}}>{subject} · {cls}</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{flex:1,height:5,borderRadius:99,background:T.g100,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:99,transition:"width .7s"}}/></div>
                  <span style={{fontSize:10.5,fontWeight:700,color,minWidth:28}}>{pct}%</span>
                </div>
              </div>
              <ChevronRight size={16} color={T.g300}/>
            </Card>
          ))}
        </div>
        <div style={{height:10}}/>
      </div>
    </div>
  );
}

// ── AI CHAT (Screen 5) ────────────────────────────────────
function AIChatScreen({onBack,questionCount,setQuestionCount}){
  const profile=getProfile();
  const[messages,setMessages]=useState([{id:"init",role:"assistant",content:"Hello! I'm your **AI Teacher** 🚀\n\nI explain any STEM topic as simply as a 7-year-old could understand — with real-world analogies.\n\nWhat would you like to explore today?",diagramUrl:null,showActions:false,loading:false}]);
  const[input,setInput]=useState("");
  const[loading,setLoading]=useState(false);
  const[apiKey,setApiKey]=useState(()=>ls.get("gemini_key")||"");
  const[showKey,setShowKey]=useState(false);
  const bottomRef=useRef();const inputRef=useRef();
  const isLimited=questionCount>=DAILY_LIMIT;
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"})},[messages]);
  const sendMsg=useCallback(async(textOverride)=>{
    const text=(textOverride??input).trim();
    if(!text||loading||isLimited)return;
    const key=apiKey||ls.get("gemini_key");
    if(!key){setShowKey(true);return}
    const uid=`u-${Date.now()}`;const aid=`a-${Date.now()}`;
    setMessages(p=>[...p,{id:uid,role:"user",content:text,diagramUrl:null,showActions:false,loading:false},{id:aid,role:"assistant",content:"",diagramUrl:null,showActions:false,loading:true}]);
    if(!textOverride)setInput("");
    setLoading(true);
    const nc=questionCount+1;setQuestionCount(nc);ls.set("q_count_today",{count:nc,date:new Date().toDateString()});
    try{
      const hist=messages.slice(-6).filter(m=>!m.loading).map(m=>({role:m.role==="assistant"?"model":"user",parts:[{text:m.content}]}));
      const res=await fetch(`${GEMINI_URL}?key=${key}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({system_instruction:{parts:[{text:SYS_PROMPT}]},contents:[...hist,{role:"user",parts:[{text}]}],generationConfig:{maxOutputTokens:1024,temperature:0.7}})});
      const data=await res.json();
      if(data.error)throw new Error(data.error.message);
      const answer=data.candidates?.[0]?.content?.parts?.[0]?.text||"Sorry, no response generated.";
      const diagramUrl=detectDiagram(answer);
      setMessages(p=>p.map(m=>m.id===aid?{...m,content:answer,loading:false,diagramUrl,showActions:true}:m));
    }catch(err){
      setMessages(p=>p.map(m=>m.id===aid?{...m,content:`⚠️ **Error:** ${err.message}\n\nGet a free Gemini key at **aistudio.google.com** and tap the share icon above.`,loading:false}:m));
    }finally{setLoading(false);inputRef.current?.focus()}
  },[input,loading,isLimited,messages,questionCount,setQuestionCount,apiKey]);
  const usagePct=Math.min((questionCount/DAILY_LIMIT)*100,100);
  const timerClr=usagePct<60?T.green:usagePct<85?T.orange:T.red;
  return(
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:T.g50,overflow:"hidden"}}>
      {showKey&&<div style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,maxWidth:480,margin:"0 auto"}}>
        <div style={{background:T.white,borderRadius:20,padding:24,width:"100%",maxWidth:360}}>
          <h3 style={{fontSize:18,fontWeight:900,color:T.g900,marginBottom:8}}>Gemini API Key</h3>
          <p style={{fontSize:13,color:T.g500,marginBottom:14,lineHeight:1.5}}>Get a <strong>free</strong> key at <strong>aistudio.google.com</strong> → Get API Key</p>
          <input value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="AIzaSy..." style={{width:"100%",padding:"12px 14px",borderRadius:12,border:`2px solid ${T.p400}`,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit",marginBottom:12}}/>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setShowKey(false)} style={{flex:1,padding:"12px",borderRadius:12,border:`2px solid ${T.g200}`,background:T.white,color:T.g600,fontSize:14,fontWeight:700,cursor:"pointer"}}>Cancel</button>
            <button onClick={()=>{ls.set("gemini_key",apiKey);setShowKey(false)}} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${T.p500},${T.p700})`,color:T.white,fontSize:14,fontWeight:800,cursor:"pointer"}}>Save & Continue</button>
          </div>
        </div>
      </div>}
      <div style={{background:T.white,padding:"52px 16px 13px",borderBottom:`1px solid ${T.g100}`,display:"flex",alignItems:"center",gap:11,boxShadow:"0 2px 14px rgba(109,40,217,.07)",flexShrink:0}}>
        <button onClick={onBack} style={{background:T.g100,border:"none",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><ArrowLeft size={18} color={T.g800}/></button>
        <div style={{width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${T.p400},${T.p700})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 3px 14px ${T.p400}55`}}><Brain size={20} color={T.white}/></div>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:800,color:T.g900}}>AI Teacher</div>
          <div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}><div style={{width:7,height:7,borderRadius:"50%",background:T.green,animation:"pulse 2.2s ease infinite"}}/><span style={{fontSize:11,color:T.green,fontWeight:600}}>Online · Gemini 1.5 Flash</span></div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
          <div style={{width:36,height:36,position:"relative"}}>
            <svg width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none" stroke={T.g100} strokeWidth="3"/><circle cx="18" cy="18" r="15" fill="none" stroke={timerClr} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${2*Math.PI*15}`} strokeDashoffset={`${2*Math.PI*15*(1-usagePct/100)}`} transform="rotate(-90 18 18)" style={{transition:"stroke-dashoffset .4s"}}/></svg>
            <span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:timerClr}}>{questionCount}</span>
          </div>
          <span style={{fontSize:8.5,color:T.g400,fontWeight:600}}>/{DAILY_LIMIT}</span>
        </div>
        <button onClick={()=>setShowKey(true)} style={{background:"none",border:"none",cursor:"pointer",padding:4,opacity:.5}}><Share2 size={16} color={T.g500}/></button>
      </div>
      {isLimited&&<div style={{margin:"10px 14px 0",padding:"13px 16px",borderRadius:16,background:"linear-gradient(135deg,#FEF2F2,#FFF7ED)",border:"1.5px solid #FECACA",display:"flex",alignItems:"center",gap:12,flexShrink:0}}><Lock size={18} color={T.red}/><div><div style={{fontSize:13,fontWeight:800,color:T.redDk}}>Daily Limit Reached</div><div style={{fontSize:11,color:"#B91C1C",marginTop:2}}>All {DAILY_LIMIT} questions used today. Come back tomorrow! 🌙</div></div></div>}
      <div style={{flex:1,overflowY:"auto",padding:"16px 14px 6px"}}>
        {messages.map(msg=>{
          const isUser=msg.role==="user";
          return(
            <div key={msg.id} style={{display:"flex",justifyContent:isUser?"flex-end":"flex-start",alignItems:"flex-end",gap:9,marginBottom:18}}>
              {!isUser&&<div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${T.p400},${T.p700})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 3px 12px ${T.p400}55`}}><Brain size={15} color={T.white}/></div>}
              <div style={{maxWidth:"78%",display:"flex",flexDirection:"column",gap:6}}>
                <div style={{padding:msg.loading?"13px 18px":"13px 16px",borderRadius:isUser?"18px 18px 4px 18px":"4px 18px 18px 18px",background:isUser?`linear-gradient(135deg,${T.p500},${T.p700})`:T.white,color:isUser?T.white:T.g800,fontSize:14,lineHeight:1.65,boxShadow:isUser?`0 4px 18px ${T.p600}45`:"0 2px 12px rgba(0,0,0,.07)",border:isUser?"none":`1px solid ${T.g100}`}}>
                  {msg.loading?<div style={{display:"flex",gap:5,alignItems:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:T.p300,animation:"dotBounce 1.1s ease infinite",animationDelay:`${i*.18}s`}}/>)}</div>:<RichText text={msg.content}/>}
                </div>
                {msg.diagramUrl&&!msg.loading&&<DiagramImg src={msg.diagramUrl}/>}
                {!isUser&&!msg.loading&&msg.showActions&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:2}}>{["Explain more","Show Proof","Give Examples","Simpler please"].map(a=><button key={a} onClick={()=>sendMsg(a)} style={{padding:"6px 12px",borderRadius:99,border:`1.5px solid ${T.p200}`,background:T.p50,color:T.p600,fontSize:11.5,fontWeight:700,cursor:"pointer"}}>{a}</button>)}</div>}
              </div>
              {isUser&&<div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${T.g200},${T.g300})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14,fontWeight:800,color:T.g600}}>{profile.name?.[0]?.toUpperCase()||"S"}</div>}
            </div>
          );
        })}
        <div ref={bottomRef} style={{height:4}}/>
      </div>
      <div style={{background:T.white,borderTop:`1px solid ${T.g100}`,padding:"11px 14px 26px",flexShrink:0,boxShadow:"0 -3px 18px rgba(109,40,217,.07)"}}>
        {isLimited?<div style={{padding:"14px 18px",borderRadius:18,background:T.g100,border:`1.5px solid ${T.g200}`,display:"flex",alignItems:"center",gap:10,color:T.g400}}><Lock size={16} color={T.g400}/><span style={{fontSize:13.5,fontWeight:600}}>Daily limit reached · Returns at midnight 🌙</span></div>
        :<div>
          <div style={{display:"flex",alignItems:"flex-end",gap:8,background:T.g50,border:`1.5px solid ${T.g200}`,borderRadius:20,padding:"9px 9px 9px 14px",boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
            <button style={{background:"none",border:"none",cursor:"pointer",padding:"5px",flexShrink:0,marginBottom:1}}><Volume2 size={19} color={T.g400}/></button>
            <textarea ref={inputRef} value={input} onChange={e=>{setInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,110)+"px"}} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg()}}} placeholder="Ask anything…" disabled={loading} rows={1} style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:14.5,color:T.g800,resize:"none",fontFamily:"inherit",lineHeight:1.55,maxHeight:110,overflowY:"auto",padding:"4px 0"}}/>
            <button style={{background:"none",border:"none",cursor:"pointer",padding:"5px",flexShrink:0,marginBottom:1}}><Mic size={19} color={T.g400}/></button>
            <button onClick={()=>sendMsg()} disabled={!input.trim()||loading} style={{width:40,height:40,borderRadius:13,border:"none",background:input.trim()&&!loading?`linear-gradient(135deg,${T.p500},${T.p700})`:T.g200,display:"flex",alignItems:"center",justifyContent:"center",cursor:input.trim()&&!loading?"pointer":"not-allowed",flexShrink:0,boxShadow:input.trim()&&!loading?`0 4px 14px ${T.p500}55`:"none",transition:"all .2s"}}>
              {loading?<Loader2 size={16} color={T.white} style={{animation:"spin 1s linear infinite"}}/>:<Send size={15} color={input.trim()?T.white:T.g400} style={{marginLeft:1}}/>}
            </button>
          </div>
          {!input&&!loading&&<div style={{display:"flex",gap:7,marginTop:10,overflowX:"auto",paddingBottom:2}}>
            {["Explain Pythagoras theorem","What is photosynthesis?","Solve quadratic equations","How does the heart work?"].map(s=>(
              <button key={s} onClick={()=>sendMsg(s)} style={{flexShrink:0,padding:"7px 13px",borderRadius:99,border:`1.5px solid ${T.p100}`,background:T.p50,color:T.p600,fontSize:11.5,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>{s}</button>
            ))}
          </div>}
        </div>}
      </div>
    </div>
  );
}

// ── NOTES BROWSER (Screen 6) ──────────────────────────────
const FCHIPS=["All","Maths","Science","English","Physics","Chemistry","SST"];
const FMAP={Maths:"Mathematics",Science:"Science",English:"English",Physics:"Physics",Chemistry:"Chemistry",SST:"Social Science"};

function NotesScreen(){
  const[notes,setNotes]=useState(NOTES_DATA);
  const[search,setSearch]=useState("");
  const[chip,setChip]=useState("All");
  const[modal,setModal]=useState(false);
  const[toast,setToast]=useState("");
  const filtered=useMemo(()=>{let r=notes;if(chip!=="All"){const s=FMAP[chip]||chip;r=r.filter(n=>n.subject===s)}if(search.trim()){const q=search.toLowerCase();r=r.filter(n=>n.title.toLowerCase().includes(q)||n.subject.toLowerCase().includes(q))}return r},[notes,chip,search]);
  const toggleBm=id=>{setNotes(p=>p.map(n=>n.id===id?{...n,bookmarked:!n.bookmarked}:n));setToast("Bookmark updated");setTimeout(()=>setToast(""),1800)};
  return(
    <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}>
      <div style={{background:`linear-gradient(148deg,${T.p950} 0%,${T.p700} 60%,${T.p500} 100%)`,padding:"52px 20px 22px",borderRadius:"0 0 28px 28px",flexShrink:0,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-60,right:-40,width:200,height:200,borderRadius:"50%",background:`radial-gradient(circle,${T.p300}25,transparent)`,pointerEvents:"none"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div><h1 style={{color:T.white,fontSize:26,fontWeight:900,margin:0,letterSpacing:-.3}}>My Notes</h1><p style={{color:"rgba(255,255,255,.55)",fontSize:12,margin:"4px 0 0",fontWeight:500}}>{notes.length} files · {notes.filter(n=>n.bookmarked).length} bookmarked</p></div>
          <button style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.18)",borderRadius:11,padding:"9px 11px",cursor:"pointer",display:"flex"}}><SlidersHorizontal size={17} color={T.white}/></button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,.10)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,.15)",borderRadius:13,padding:"11px 14px"}}>
          <Search size={15} color="rgba(255,255,255,.45)"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search notes…" style={{flex:1,background:"transparent",border:"none",outline:"none",color:T.white,fontSize:13.5,fontFamily:"inherit"}}/>
          {search&&<button onClick={()=>setSearch("")} style={{background:"none",border:"none",cursor:"pointer",padding:0}}><X size={14} color="rgba(255,255,255,.6)"/></button>}
        </div>
      </div>
      <div style={{display:"flex",gap:8,padding:"14px 16px 4px",overflowX:"auto",flexShrink:0}}>
        {FCHIPS.map(c=><button key={c} onClick={()=>setChip(c)} style={{flexShrink:0,padding:"7px 15px",borderRadius:99,cursor:"pointer",border:`1.5px solid ${chip===c?T.p500:T.g200}`,background:chip===c?`linear-gradient(135deg,${T.p500},${T.p700})`:T.white,color:chip===c?T.white:T.g600,fontSize:12.5,fontWeight:700,boxShadow:chip===c?`0 3px 10px ${T.p500}40`:"none",transition:"all .15s"}}>{c}</button>)}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"10px 16px 0"}}>
        {filtered.length===0?<div style={{textAlign:"center",padding:"48px 20px",color:T.g400}}><FileText size={40} color={T.g300} style={{margin:"0 auto 12px"}}/><p style={{fontSize:14,fontWeight:600,margin:0}}>No notes found</p></div>:
          filtered.map(note=>(
            <Card key={note.id} style={{marginBottom:11,padding:0,overflow:"hidden",borderLeft:`4px solid ${note.color}`,display:"flex",alignItems:"center"}}>
              <div style={{flex:1,padding:"14px 14px 14px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:5}}><span style={{fontSize:20}}>{note.emoji}</span><span style={{fontSize:14.5,fontWeight:800,color:T.g800}}>{note.title}</span></div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <span style={{fontSize:11,fontWeight:600,color:note.color,background:`${note.color}18`,padding:"2px 8px",borderRadius:99}}>{note.subject}</span>
                  <span style={{fontSize:11,color:T.g400}}>• {note.cls} • PDF · {note.size}</span>
                </div>
              </div>
              <button onClick={()=>toggleBm(note.id)} style={{padding:"16px",background:"none",border:"none",cursor:"pointer",flexShrink:0}}>
                {note.bookmarked?<BookmarkCheck size={20} color={T.p500} fill={T.p500}/>:<Bookmark size={20} color={T.g300}/>}
              </button>
            </Card>
          ))
        }
        <div style={{height:8}}/>
      </div>
      {toast&&<div style={{position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",background:T.g900,color:T.white,padding:"9px 18px",borderRadius:99,fontSize:12.5,fontWeight:700,zIndex:500,display:"flex",alignItems:"center",gap:6,boxShadow:"0 4px 20px rgba(0,0,0,.3)",animation:"fadeInToast .2s ease",whiteSpace:"nowrap"}}><BookmarkCheck size={14}/> {toast}</div>}
      <div style={{padding:"12px 16px 26px",flexShrink:0}}>
        <button onClick={()=>setModal(true)} style={{width:"100%",padding:"14px",borderRadius:16,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${T.p500},${T.p700})`,color:T.white,fontSize:15,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:`0 4px 18px ${T.p500}45`}}><Plus size={18}/> Create New Note</button>
      </div>
      {modal&&<div style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"flex-end",justifyContent:"center",maxWidth:480,margin:"0 auto"}} onClick={()=>setModal(false)}>
        <div onClick={e=>e.stopPropagation()} style={{width:"100%",background:T.white,borderRadius:"24px 24px 0 0",padding:"24px 20px 36px",boxShadow:"0 -8px 40px rgba(109,40,217,.2)",animation:"slideUp .25s cubic-bezier(.34,1.56,.64,1)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}><h3 style={{fontSize:18,fontWeight:900,color:T.g900,margin:0}}>New Note</h3><button onClick={()=>setModal(false)} style={{background:T.g100,border:"none",borderRadius:10,padding:8,cursor:"pointer"}}><X size={16} color={T.g600}/></button></div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <input placeholder="Note title…" style={{padding:"12px 14px",borderRadius:12,border:`2px solid ${T.p400}`,fontSize:14,outline:"none",fontFamily:"inherit"}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <SelectDropdown label="Subject" options={Object.keys(SUBJECTS_CFG)} value="" onChange={()=>{}} placeholder="Subject"/>
              <SelectDropdown label="Class" options={Array.from({length:7},(_,i)=>`Class ${i+6}`)} value="" onChange={()=>{}} placeholder="Class"/>
            </div>
            <textarea placeholder="Key points, formulas, concepts…" rows={4} style={{padding:"12px 14px",borderRadius:12,border:`2px solid ${T.g200}`,fontSize:13.5,outline:"none",resize:"none",lineHeight:1.6,boxSizing:"border-box",fontFamily:"inherit"}}/>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setModal(false)} style={{flex:1,padding:"13px",borderRadius:13,border:`2px solid ${T.g200}`,background:T.white,color:T.g600,fontSize:14,fontWeight:700,cursor:"pointer"}}>Cancel</button>
              <button onClick={()=>{setNotes(p=>[{id:Date.now(),title:"New Note",subject:"Mathematics",cls:"Class 10",size:"1 MB",color:T.p600,emoji:"📄",bookmarked:false},...p]);setModal(false)}} style={{flex:2,padding:"13px",borderRadius:13,border:"none",background:`linear-gradient(135deg,${T.p500},${T.p700})`,color:T.white,fontSize:14,fontWeight:800,cursor:"pointer"}}>Save Note</button>
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}

// ── QUIZ SETUP (Screen 7) ─────────────────────────────────
function QuizSetupScreen({onBack,onStart}){
  const[subject,setSubject]=useState("Mathematics");
  const[topic,setTopic]=useState("Quadratic Equations");
  const[diff,setDiff]=useState("Medium");
  const[cnt,setCnt]=useState(10);
  useEffect(()=>{const t=SUBJECTS_CFG[subject]?.topics||[];setTopic(t[0]||"")},[subject]);
  return(
    <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}>
      <BackHeader title="Create a Quiz" sub="Customise your practice session" onBack={onBack}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 8px"}}>
        <Card style={{padding:"18px 16px",marginBottom:14}}><div style={{display:"flex",flexDirection:"column",gap:16}}>
          <SelectDropdown label="Select Subject" options={Object.keys(SUBJECTS_CFG)} value={subject} onChange={setSubject} placeholder="Choose subject"/>
          <SelectDropdown label="Select Topic" options={SUBJECTS_CFG[subject]?.topics||[]} value={topic} onChange={setTopic} placeholder="Choose topic" disabled={!subject}/>
        </div></Card>
        <Card style={{padding:"18px 16px",marginBottom:14}}>
          <label style={{fontSize:12,fontWeight:700,color:T.g500,letterSpacing:.5,textTransform:"uppercase",display:"block",marginBottom:14}}>Select Difficulty</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            {Object.entries(DIFF_CFG).map(([name,cfg])=>{const on=diff===name;return(
              <button key={name} onClick={()=>setDiff(name)} style={{padding:"14px 8px",borderRadius:14,cursor:"pointer",border:`2px solid ${on?cfg.border:T.g200}`,background:on?cfg.bg:T.white,display:"flex",flexDirection:"column",alignItems:"center",gap:6,boxShadow:on?`0 4px 14px ${cfg.color}30`:"none",transition:"all .18s",position:"relative"}}>
                {on&&<div style={{position:"absolute",top:6,right:6,width:16,height:16,borderRadius:"50%",background:cfg.color,display:"flex",alignItems:"center",justifyContent:"center"}}><Check size={9} color={T.white} strokeWidth={3}/></div>}
                <span style={{fontSize:24}}>{cfg.emoji}</span>
                <span style={{fontSize:13,fontWeight:800,color:on?cfg.color:T.g800}}>{name}</span>
                <span style={{fontSize:10.5,color:on?cfg.color:T.g400,fontWeight:500,textAlign:"center"}}>{cfg.sub}</span>
              </button>
            )})}
          </div>
        </Card>
        <Card style={{padding:"18px 16px",marginBottom:20}}>
          <label style={{fontSize:12,fontWeight:700,color:T.g500,letterSpacing:.5,textTransform:"uppercase",display:"block",marginBottom:14}}>Number of Questions</label>
          <div style={{display:"flex",gap:8,justifyContent:"space-between"}}>
            {Q_COUNTS.map(n=>{const on=cnt===n;return(<button key={n} onClick={()=>setCnt(n)} style={{flex:1,padding:"12px 4px",borderRadius:12,cursor:"pointer",border:`2px solid ${on?T.p500:T.g200}`,background:on?`linear-gradient(135deg,${T.p500},${T.p700})`:T.white,color:on?T.white:T.g700,fontSize:15,fontWeight:800,boxShadow:on?`0 3px 12px ${T.p500}45`:"none",transition:"all .15s"}}>{n}</button>)})}
          </div>
          <p style={{fontSize:11.5,color:T.g400,margin:"10px 0 0",fontWeight:500}}>{DIFF_CFG[diff].timePer}s/question · Total ≈ {fmtTime(cnt*DIFF_CFG[diff].timePer)}</p>
        </Card>
      </div>
      <div style={{padding:"12px 16px 28px",flexShrink:0}}>
        <button onClick={()=>{if(topic)onStart({subject,topic,difficulty:diff,count:cnt},buildQuiz(subject,topic,diff,cnt))}} disabled={!topic} style={{width:"100%",padding:"16px",borderRadius:16,border:"none",cursor:topic?"pointer":"not-allowed",background:topic?`linear-gradient(135deg,${T.p500},${T.p700})`:T.g200,color:topic?T.white:T.g400,fontSize:16,fontWeight:900,boxShadow:topic?`0 6px 22px ${T.p600}50`:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .2s"}}>
          <Zap size={18} fill={topic?T.white:T.g400}/> Start Quiz
        </button>
      </div>
    </div>
  );
}

// ── QUIZ PLAY (Screen 8) ──────────────────────────────────
function QuizPlayScreen({config,questions,onBack,onFinish}){
  const totalTime=config.count*(DIFF_CFG[config.difficulty]?.timePer??60);
  const[idx,setIdx]=useState(0);
  const[answers,setAnswers]=useState({});
  const[timeLeft,setTimeLeft]=useState(totalTime);
  const[finished,setFinished]=useState(false);
  const[showHint,setShowHint]=useState(false);
  const answered=Object.keys(answers).length;
  const cq=questions[idx];
  const isAns=idx in answers;
  const timerPct=(timeLeft/totalTime)*100;
  const timerClr=timerPct>50?T.green:timerPct>25?T.orange:T.red;
  useEffect(()=>{if(finished)return;const id=setInterval(()=>setTimeLeft(t=>{if(t<=1){setFinished(true);return 0}return t-1}),1000);return()=>clearInterval(id)},[finished]);
  useEffect(()=>{if(finished)onFinish(answers,totalTime-timeLeft)},[finished]);
  return(
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:T.g50,overflow:"hidden"}}>
      <div style={{background:T.white,padding:"50px 16px 13px",flexShrink:0,borderBottom:`1px solid ${T.g100}`,boxShadow:"0 2px 12px rgba(109,40,217,.07)",zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <button onClick={onBack} style={{width:36,height:36,borderRadius:10,background:T.g100,border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><ArrowLeft size={17} color={T.g700}/></button>
          <div style={{display:"flex",alignItems:"center",gap:7,padding:"7px 14px",borderRadius:99,background:timerPct<25?T.redBg:T.g50,border:`1.5px solid ${timerPct<25?"#FECACA":T.g200}`}}><Timer size={14} color={timerClr}/><span style={{fontSize:16,fontWeight:900,color:timerClr,fontVariantNumeric:"tabular-nums",letterSpacing:.5}}>{fmtTime(timeLeft)}</span></div>
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",borderRadius:99,background:T.p50,border:`1.5px solid ${T.p100}`}}><Layers size={13} color={T.p600}/><span style={{fontSize:12,fontWeight:700,color:T.p700}}>{idx+1}/{questions.length}</span></div>
        </div>
        <div style={{marginTop:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:12,fontWeight:700,color:T.g500}}>Question {idx+1} of {questions.length}</span><span style={{fontSize:11.5,fontWeight:600,color:T.p500}}>{answered} answered</span></div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
            {questions.map((_,i)=>{const dot=i in answers?(answers[i]===questions[i].correct?"correct":"wrong"):i===idx?"active":"idle";const dc={correct:T.green,wrong:T.red,active:T.p500,idle:T.g200};return<button key={i} onClick={()=>{setIdx(i);setShowHint(false)}} style={{width:i===idx?18:8,height:8,borderRadius:99,background:dc[dot],border:"none",cursor:"pointer",transition:"all .25s",padding:0}}/>})}
          </div>
          <div style={{height:4,borderRadius:99,background:T.g100,overflow:"hidden"}}><div style={{height:"100%",width:`${(answered/questions.length)*100}%`,background:`linear-gradient(90deg,${T.p400},${T.p600})`,borderRadius:99,transition:"width .4s"}}/></div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"18px 14px 8px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <span style={{fontSize:12,fontWeight:700,padding:"4px 10px",borderRadius:99,background:DIFF_CFG[cq.difficulty]?.bg??T.g100,color:DIFF_CFG[cq.difficulty]?.color??T.g600}}>{DIFF_CFG[cq.difficulty]?.emoji} {cq.difficulty}</span>
          <span style={{fontSize:11.5,color:T.g400,fontWeight:500}}>{config.subject} · {config.topic}</span>
        </div>
        <Card style={{padding:"20px 18px",marginBottom:16,border:`1.5px solid ${T.p100}`,background:"linear-gradient(135deg,#FAFAFE,#FFF)"}}><p style={{margin:0,fontSize:15.5,fontWeight:700,color:T.g900,lineHeight:1.65,letterSpacing:-.1}}>{cq.question}</p></Card>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {cq.options.map((opt,oi)=>{
            const state=getOptState(idx,oi,answers,questions);const s=OPT_STYLE[state];
            const Icon=state==="correct-hit"||state==="correct-show"?CheckCircle2:state==="wrong-hit"?XCircle:null;
            return(<button key={oi} onClick={()=>{if(!isAns){setAnswers(p=>({...p,[idx]:oi}));setShowHint(false)}}} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderRadius:14,cursor:isAns?"default":"pointer",border:`2px solid ${s.border}`,background:s.bg,transition:"all .18s",boxShadow:(state==="correct-hit"||state==="correct-show")?`0 3px 14px ${T.green}30`:state==="wrong-hit"?`0 3px 14px ${T.red}25`:"none",width:"100%",textAlign:"left"}}>
              <div style={{width:32,height:32,borderRadius:9,flexShrink:0,background:s.lblBg,display:"flex",alignItems:"center",justifyContent:"center"}}>{Icon?<Icon size={17} color={s.lblTxt}/>:<span style={{fontSize:13,fontWeight:800,color:s.lblTxt}}>{OPT_LBL[oi]}</span>}</div>
              <span style={{fontSize:14,fontWeight:isAns?600:500,color:s.txt,lineHeight:1.45,flex:1}}>{opt}</span>
            </button>);
          })}
        </div>
        {isAns&&<div style={{marginTop:14}}>
          <button onClick={()=>setShowHint(h=>!h)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:T.p500,fontSize:13,fontWeight:700}}><AlertCircle size={14}/>{showHint?"Hide":"Show"} explanation</button>
          {showHint&&<div style={{marginTop:10,padding:"13px 15px",borderRadius:13,background:T.p50,border:`1.5px solid ${T.p100}`,fontSize:13,color:T.p800,lineHeight:1.6,fontWeight:500}}>💡 {cq.hint}</div>}
        </div>}
        <div style={{height:10}}/>
      </div>
      <div style={{padding:"12px 14px 28px",background:T.white,borderTop:`1px solid ${T.g100}`,flexShrink:0,boxShadow:"0 -3px 16px rgba(109,40,217,.07)"}}>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>{setIdx(i=>i-1);setShowHint(false)}} disabled={idx===0} style={{flex:1,padding:"14px",borderRadius:14,cursor:idx===0?"not-allowed":"pointer",border:`2px solid ${idx===0?T.g200:T.p200}`,background:idx===0?T.g50:T.white,color:idx===0?T.g400:T.p600,fontSize:15,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><ChevronLeft size={17}/> Previous</button>
          <button onClick={()=>{setShowHint(false);if(idx<questions.length-1)setIdx(i=>i+1);else setFinished(true)}} style={{flex:2,padding:"14px",borderRadius:14,border:"none",cursor:"pointer",background:idx===questions.length-1?`linear-gradient(135deg,${T.green},#059669)`:`linear-gradient(135deg,${T.p500},${T.p700})`,color:T.white,fontSize:15,fontWeight:800,boxShadow:`0 4px 18px ${idx===questions.length-1?T.green:T.p600}45`,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            {idx===questions.length-1?<><Trophy size={17}/> Finish Quiz</>:<>Next <ChevronRight size={17}/></>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── QUIZ RESULT ───────────────────────────────────────────
function QuizResultScreen({config,questions,answers,timeTaken,onBack,onRetry}){
  const correct=questions.filter((q,i)=>answers[i]===q.correct).length;
  const wrong=questions.filter((q,i)=>i in answers&&answers[i]!==q.correct).length;
  const skipped=questions.length-Object.keys(answers).length;
  const accuracy=Math.round((correct/questions.length)*100);
  const[review,setReview]=useState(false);
  const grade=accuracy>=90?{l:"Outstanding! 🏆",c:T.gold}:accuracy>=75?{l:"Great Job! 🎉",c:T.green}:accuracy>=50?{l:"Good Effort 💪",c:T.orange}:{l:"Keep Practising 📚",c:T.red};
  const r=52,circ=2*Math.PI*r;
  return(
    <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}>
      <div style={{background:`linear-gradient(148deg,${T.p950},${T.p700})`,padding:"52px 20px 28px",borderRadius:"0 0 30px 30px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <button onClick={onBack} style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><ArrowLeft size={17} color={T.white}/></button>
          <div><h2 style={{color:T.white,fontSize:20,fontWeight:900,margin:0}}>Quiz Complete!</h2><p style={{color:"rgba(255,255,255,.55)",fontSize:12,margin:"3px 0 0"}}>{config.topic} · {config.difficulty}</p></div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
          <div style={{position:"relative"}}>
            <svg width="130" height="130" viewBox="0 0 130 130"><circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="10"/><circle cx="65" cy="65" r={r} fill="none" stroke={grade.c} strokeWidth="10" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ-(accuracy/100)*circ} transform="rotate(-90 65 65)" style={{transition:"stroke-dashoffset 1s ease"}}/></svg>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:30,fontWeight:900,color:T.white,lineHeight:1}}>{accuracy}%</span><span style={{fontSize:11,color:"rgba(255,255,255,.6)",fontWeight:600,marginTop:2}}>{correct}/{questions.length}</span></div>
          </div>
          <div style={{padding:"7px 18px",borderRadius:99,background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)"}}><span style={{color:grade.c,fontSize:14,fontWeight:800}}>{grade.l}</span></div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 8px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
          {[["Correct",correct,T.green,"✅"],["Wrong",wrong,T.red,"❌"],["Skipped",skipped,T.orange,"⏭️"]].map(([l,v,c,ico])=>(
            <Card key={l} style={{padding:"13px 10px",textAlign:"center"}}><span style={{fontSize:20}}>{ico}</span><div style={{fontSize:22,fontWeight:900,color:c,margin:"4px 0 2px",letterSpacing:-1}}>{v}</div><div style={{fontSize:10.5,fontWeight:600,color:T.g400}}>{l}</div></Card>
          ))}
        </div>
        <Card style={{padding:"14px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,borderRadius:11,background:T.p50,display:"flex",alignItems:"center",justifyContent:"center"}}><Timer size={18} color={T.p600}/></div>
          <div><div style={{fontSize:13,fontWeight:700,color:T.g800}}>Time Taken</div><div style={{fontSize:18,fontWeight:900,color:T.p600,letterSpacing:-.5}}>{fmtTime(timeTaken)}</div></div>
          <div style={{marginLeft:"auto"}}><div style={{fontSize:13,fontWeight:700,color:T.g800}}>Avg / Question</div><div style={{fontSize:15,fontWeight:800,color:T.g600}}>{fmtTime(Math.round(timeTaken/questions.length))}</div></div>
        </Card>
        <button onClick={()=>setReview(r=>!r)} style={{width:"100%",padding:"13px 16px",borderRadius:14,cursor:"pointer",border:`1.5px solid ${T.p100}`,background:T.p50,marginBottom:review?12:16,display:"flex",alignItems:"center",justifyContent:"space-between",color:T.p700,fontSize:13.5,fontWeight:700}}>
          <span>📋 Review All Questions</span><ChevronDown size={15} style={{transform:review?"rotate(180deg)":"none",transition:".2s"}}/>
        </button>
        {review&&questions.map((q,i)=>{
          const ok=i in answers&&answers[i]===q.correct;const wr=i in answers&&answers[i]!==q.correct;const sk=!(i in answers);
          const sc=ok?T.green:wr?T.red:T.orange;
          return(<Card key={i} style={{padding:"14px 15px",marginBottom:10,borderLeft:`4px solid ${sc}`}}>
            <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"flex-start"}}><span style={{fontSize:16,flexShrink:0}}>{ok?"✅":wr?"❌":"⏭️"}</span><p style={{margin:0,fontSize:13,fontWeight:600,color:T.g800,lineHeight:1.5}}>Q{i+1}: {q.question}</p></div>
            <div style={{fontSize:12,color:T.g500,paddingLeft:24}}>
              {sk?<span style={{color:T.orange,fontWeight:600}}>Skipped</span>:<><span style={{color:wr?T.red:T.green,fontWeight:600}}>Your answer: {q.options[answers[i]]}</span>{wr&&<span style={{color:T.green,fontWeight:600,display:"block",marginTop:3}}>✓ Correct: {q.options[q.correct]}</span>}</>}
              <p style={{margin:"6px 0 0",color:T.p600,fontWeight:500,lineHeight:1.4}}>💡 {q.hint}</p>
            </div>
          </Card>);
        })}
      </div>
      <div style={{padding:"12px 16px 28px",flexShrink:0,background:T.white,borderTop:`1px solid ${T.g100}`}}>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onBack} style={{flex:1,padding:"14px",borderRadius:14,border:`2px solid ${T.g200}`,background:T.white,color:T.g700,fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Home size={16}/> Home</button>
          <button onClick={onRetry} style={{flex:2,padding:"14px",borderRadius:14,border:"none",background:`linear-gradient(135deg,${T.p500},${T.p700})`,color:T.white,fontSize:14,fontWeight:800,cursor:"pointer",boxShadow:`0 4px 18px ${T.p600}45`,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><RotateCcw size={16}/> Try Again</button>
        </div>
      </div>
    </div>
  );
}

// ── EXAM DASHBOARD (Screen 9) ─────────────────────────────
function ExamDashboard({profile,onNav,apexData,onOpenVault}){
  const track=profile?.track||"iitjee";
  const features=[
    {id:"revision",Icon:Calendar,iconBg:T.p100,ic:T.p600,title:"Revision Plan",sub:"Personalised chapter roadmap"},
    {id:"important",Icon:Star,iconBg:T.goldBg,ic:T.gold,title:"Important Topics",sub:"High weightage analytical blocks"},
    {id:"mock",Icon:Trophy,iconBg:T.greenBg,ic:T.green,title:"Mock Tests",sub:"Real exam environment simulations"},
    {id:"papers",Icon:FileText,iconBg:T.pinkBg,ic:T.pink,title:"Previous Papers",sub:"Historical year-wise questionnaires"},
  ];
  return(
    <div style={{display:"flex",flexDirection:"column",flex:1}}>
      <div style={{background:`linear-gradient(148deg,${T.p950} 0%,${T.p800} 50%,${T.p600} 100%)`,padding:"52px 20px 22px",borderRadius:"0 0 28px 28px",flexShrink:0,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-50,right:-40,width:190,height:190,borderRadius:"50%",background:`radial-gradient(circle,${T.p300}22,transparent)`,pointerEvents:"none"}}/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:40,height:40,borderRadius:12,background:"rgba(255,255,255,.12)",display:"flex",alignItems:"center",justifyContent:"center"}}><Crown size={20} color={T.gold} fill={T.gold}/></div>
            <div><p style={{color:"rgba(255,255,255,.55)",fontSize:11,margin:0,fontWeight:600}}>EXAM MODE</p><h2 style={{color:T.white,fontSize:20,fontWeight:900,margin:0,letterSpacing:-.2}}>{TRACK_LABELS[track]} Prep</h2></div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={onOpenVault} style={{width:38,height:38,borderRadius:11,background:"rgba(255,255,255,.10)",border:"1px solid rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative"}}><Brain size={17} color={T.white}/><span style={{position:"absolute",top:5,right:5,width:8,height:8,borderRadius:"50%",background:T.gold}}/></button>
            <button style={{width:38,height:38,borderRadius:11,background:"rgba(255,255,255,.10)",border:"1px solid rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Bell size={17} color={T.white}/></button>
          </div>
        </div>
        <div style={{background:"rgba(255,255,255,.10)",backdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,.18)",borderRadius:18,padding:"18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{flex:1}}>
            <h3 style={{color:T.white,fontSize:18,fontWeight:900,margin:"0 0 5px"}}>Ace Your Exams 🎯</h3>
            <p style={{color:"rgba(255,255,255,.60)",fontSize:12.5,margin:0,lineHeight:1.5,fontWeight:500}}>Smart Preparation,<br/>Better Results</p>
            <div style={{display:"flex",gap:10,marginTop:12}}>
              {[["7",T.gold,"STREAK"],["92%",T.green,"AVG"],["10",T.p300,"QUIZZES"]].map(([v,c,l])=>(
                <div key={l} style={{background:"rgba(255,255,255,.12)",borderRadius:10,padding:"6px 12px",textAlign:"center"}}><div style={{color:c,fontSize:18,fontWeight:900}}>{v}</div><div style={{color:"rgba(255,255,255,.55)",fontSize:9,fontWeight:700,letterSpacing:.5}}>{l}</div></div>
              ))}
            </div>
          </div>
          <div style={{width:80,height:80,borderRadius:"50%",flexShrink:0,background:`linear-gradient(135deg,${T.p400},${T.p700})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 6px 24px ${T.p600}60`,fontSize:36}}>🎓</div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"18px 16px"}}>
        {apexData?.eligible&&<div onClick={()=>onNav("analytics")} style={{marginBottom:16,padding:"13px 16px",borderRadius:14,cursor:"pointer",background:`linear-gradient(135deg,#1a0a2e,#2d1274)`,border:`1.5px solid ${T.gold}55`,display:"flex",alignItems:"center",gap:12,boxShadow:`0 4px 20px rgba(245,158,11,.20)`}}>
          <span style={{fontSize:22}}>⚡</span>
          <div style={{flex:1}}><div style={{fontSize:12,fontWeight:800,color:T.gold,letterSpacing:.5}}>APEX STARK — {apexData.tier}</div><div style={{fontSize:11,color:"rgba(255,255,255,.55)",marginTop:2}}>Eligibility Verified · Tap to claim</div></div>
          <ChevronRight size={14} color={T.gold}/>
        </div>}
        <Card style={{marginBottom:14,overflow:"hidden",padding:0}}>
          {features.map(({id,Icon,iconBg,ic,title,sub})=>(
            <button key={id} onClick={()=>onNav(id)} style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"15px 18px",background:"none",border:"none",cursor:"pointer",borderBottom:`1px solid ${T.g100}`,textAlign:"left"}} onPointerEnter={e=>e.currentTarget.style.background=T.p50} onPointerLeave={e=>e.currentTarget.style.background="none"}>
              <div style={{width:44,height:44,borderRadius:13,background:iconBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon size={20} color={ic}/></div>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:14.5,fontWeight:800,color:T.g900}}>{title}</div><div style={{fontSize:11.5,color:T.g400,marginTop:2,fontWeight:500}}>{sub}</div></div>
              <ChevronRight size={16} color={T.g300}/>
            </button>
          ))}
        </Card>
        <p style={{fontSize:12,fontWeight:700,color:T.g500,margin:"0 0 10px",letterSpacing:.5}}>POWER TOOLS</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {[{id:"analytics",Icon:BarChart2,label:"My Analytics",color:T.p600,bg:T.p50},{id:"bridge",Icon:Wifi,label:"Context Bridge",color:T.green,bg:T.greenBg}].map(({id,Icon,label,color,bg})=>(
            <button key={id} onClick={()=>onNav(id)} style={{padding:"14px 12px",borderRadius:14,border:`1.5px solid ${color}30`,background:bg,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}><Icon size={18} color={color}/><span style={{fontSize:13,fontWeight:700,color}}>{label}</span></button>
          ))}
        </div>
        <div style={{padding:"15px 16px",background:`linear-gradient(135deg,${T.p50},${T.white})`,borderRadius:14,border:`1.5px solid ${T.p100}`,display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:28}}>💪</span><div><p style={{margin:0,fontSize:13,fontWeight:800,color:T.p800}}>Keep practising!</p><p style={{margin:"3px 0 0",fontSize:11.5,color:T.p500,fontWeight:500}}>Consistency is the key to success.</p></div></div>
        <div style={{height:10}}/>
      </div>
    </div>
  );
}

function RevisionPlanScreen({onBack}){
  const[exp,setExp]=useState("Mathematics");
  return(
    <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}>
      <BackHeader title="Revision Plan" sub="Personalised study roadmap" onBack={onBack}/>
      <div style={{flex:1,overflowY:"auto",padding:"18px 16px"}}>
        <Card style={{padding:"16px 18px",marginBottom:16,background:`linear-gradient(135deg,${T.p700},${T.p900})`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div><p style={{color:"rgba(255,255,255,.6)",fontSize:11,fontWeight:700,margin:0,letterSpacing:.5}}>OVERALL PROGRESS</p><p style={{color:T.white,fontSize:22,fontWeight:900,margin:"4px 0 0"}}>42% Complete</p></div>
            <div style={{position:"relative",width:56,height:56}}>
              <svg width="56" height="56" viewBox="0 0 56 56"><circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="6"/><circle cx="28" cy="28" r="22" fill="none" stroke={T.gold} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${2*Math.PI*22}`} strokeDashoffset={`${2*Math.PI*22*(1-.42)}`} transform="rotate(-90 28 28)"/></svg>
              <span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:T.gold}}>42%</span>
            </div>
          </div>
          <div style={{display:"flex",gap:16}}>{[["8","Done","#10B981"],["3","Active","#A78BFA"],["7","Pending","#9CA3AF"]].map(([n,l,c])=><div key={l}><div style={{fontSize:18,fontWeight:900,color:c}}>{n}</div><div style={{fontSize:9.5,color:"rgba(255,255,255,.5)",fontWeight:600}}>{l.toUpperCase()}</div></div>)}</div>
        </Card>
        {Object.entries(ROADMAP).map(([subject,chapters])=>{
          const done=chapters.filter(c=>c.status==="done").length;const isOpen=exp===subject;const pct=Math.round((done/chapters.length)*100);
          return(<Card key={subject} style={{marginBottom:12,overflow:"hidden"}}>
            <button onClick={()=>setExp(isOpen?null:subject)} style={{width:"100%",padding:"15px 16px",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
              <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{fontSize:14.5,fontWeight:800,color:T.g900}}>{subject}</span><Badge color={T.p600} bg={T.p50}>{done}/{chapters.length}</Badge></div><div style={{height:5,borderRadius:99,background:T.g100,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${T.p400},${T.p600})`,borderRadius:99}}/></div></div>
              <ChevronDown size={16} color={T.g400} style={{transform:isOpen?"rotate(180deg)":"none",transition:".2s",flexShrink:0}}/>
            </button>
            {isOpen&&<div style={{borderTop:`1px solid ${T.g100}`}}>{chapters.map((ch,i)=>{const cfg=STATUS_CFG[ch.status];return(
              <div key={i} style={{padding:"12px 16px",borderBottom:`1px solid ${T.g100}`,display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:16,flexShrink:0}}>{cfg.icon}</span>
                <div style={{flex:1}}><div style={{fontSize:13.5,fontWeight:700,color:T.g800,marginBottom:4}}>{ch.ch}</div><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{flex:1,height:4,borderRadius:99,background:T.g100,overflow:"hidden"}}><div style={{height:"100%",width:`${ch.pct}%`,background:cfg.color,borderRadius:99}}/></div><span style={{fontSize:10.5,fontWeight:700,color:cfg.color,minWidth:28}}>{ch.pct}%</span></div></div>
                <Badge color={cfg.color} bg={cfg.bg}>{ch.wt}%</Badge>
              </div>
            )})}
            </div>}
          </Card>);
        })}
        <div style={{height:8}}/>
      </div>
    </div>
  );
}

function ImportantTopicsScreen({onBack}){
  const[topics,setTopics]=useState(IMP_TOPICS);
  const[filter,setFilter]=useState("all");
  const shown=filter==="all"?topics:topics.filter(t=>t.tier===filter);
  return(
    <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}>
      <BackHeader title="Important Topics" sub="High weightage analytical blocks" onBack={onBack}/>
      <div style={{padding:"12px 16px 0",flexShrink:0,display:"flex",gap:8}}>
        {[["all","All",T.g600,T.g100],["vimp","🔴 Very Imp",T.red,T.redBg],["imp","🟡 Important",T.gold,T.goldBg]].map(([v,l,c,bg])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{padding:"7px 14px",borderRadius:99,border:`1.5px solid ${filter===v?c:T.g200}`,background:filter===v?bg:T.white,color:filter===v?c:T.g500,fontSize:12,fontWeight:700,cursor:"pointer"}}>{l}</button>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px 16px"}}>
        {shown.map(t=>(
          <Card key={t.id} style={{marginBottom:11,padding:"15px 16px",borderLeft:`4px solid ${t.tier==="vimp"?T.red:T.gold}`}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
              <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}><span style={{fontSize:14}}>{t.tier==="vimp"?"🔴":"🟡"}</span><span style={{fontSize:14.5,fontWeight:800,color:T.g900}}>{t.topic}</span></div><div style={{display:"flex",gap:7}}><Badge color={T.p600} bg={T.p50}>{t.subject}</Badge><Badge color={T.gold} bg={T.goldBg}>{t.wt}% Wt.</Badge></div></div>
              <button onClick={()=>setTopics(p=>p.map(x=>x.id===t.id?{...x,revised:!x.revised}:x))} style={{width:32,height:32,borderRadius:9,border:`2px solid ${t.revised?T.green:T.g200}`,background:t.revised?T.greenBg:T.white,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>{t.revised&&<Check size={14} color={T.green}/>}</button>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{flex:1,height:6,borderRadius:99,background:T.g100,overflow:"hidden"}}><div style={{height:"100%",width:`${t.prob}%`,background:t.tier==="vimp"?`linear-gradient(90deg,${T.red},${T.orange})`:`linear-gradient(90deg,${T.gold},${T.orange})`,borderRadius:99}}/></div>
              <span style={{fontSize:11,fontWeight:800,color:t.tier==="vimp"?T.red:T.gold,minWidth:36}}>{t.prob}%</span>
              <span style={{fontSize:10,color:T.g400,fontWeight:500}}>exam prob.</span>
            </div>
          </Card>
        ))}
        <div style={{height:8}}/>
      </div>
    </div>
  );
}

function MockTestsScreen({onBack}){
  const DC={Hard:{c:T.red,bg:T.redBg},Medium:{c:T.orange,bg:T.orangeBg},Easy:{c:T.green,bg:T.greenBg}};
  return(
    <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}>
      <BackHeader title="Mock Tests" sub="Real exam environment simulations" onBack={onBack}/>
      <div style={{flex:1,overflowY:"auto",padding:"18px 16px"}}>
        {MOCK_TESTS.map(m=>{const dc=DC[m.diff];return(
          <Card key={m.id} style={{marginBottom:13,padding:"17px 16px"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:12}}>
              <div style={{width:46,height:46,borderRadius:13,flexShrink:0,background:m.attempted?T.greenBg:T.p50,display:"flex",alignItems:"center",justifyContent:"center"}}><Trophy size={22} color={m.attempted?T.green:T.p600}/></div>
              <div style={{flex:1}}><div style={{fontSize:14.5,fontWeight:800,color:T.g900,marginBottom:5}}>{m.title}</div><div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{m.subjects.map(s=><Badge key={s} color={T.p600} bg={T.p50}>{s}</Badge>)}</div></div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:13}}>
              <div style={{display:"flex",alignItems:"center",gap:5}}><Hash size={12} color={T.g400}/><span style={{fontSize:12,color:T.g600,fontWeight:600}}>{m.q}Q</span></div>
              <span style={{color:T.g300}}>·</span>
              <div style={{display:"flex",alignItems:"center",gap:5}}><Clock size={12} color={T.g400}/><span style={{fontSize:12,color:T.g600,fontWeight:600}}>{m.mins}m</span></div>
              <span style={{color:T.g300}}>·</span>
              <Badge color={dc.c} bg={dc.bg}>{m.diff}</Badge>
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              {m.attempted&&<div style={{flex:1,padding:"8px 12px",borderRadius:10,background:T.greenBg,display:"flex",alignItems:"center",gap:6}}><TrendingUp size={13} color={T.green}/><span style={{fontSize:12,fontWeight:700,color:T.greenDk}}>Last: {m.score}%</span></div>}
              <button style={{flex:m.attempted?0:1,padding:"10px 18px",borderRadius:12,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${T.p500},${T.p700})`,color:T.white,fontSize:13,fontWeight:800,boxShadow:`0 3px 12px ${T.p600}40`,display:"flex",alignItems:"center",gap:6}}><Play size={13} fill={T.white}/>{m.attempted?"Retake":"Start"}</button>
            </div>
          </Card>
        );})}
        <div style={{height:8}}/>
      </div>
    </div>
  );
}

function PreviousPapersScreen({onBack}){
  const[yr,setYr]=useState("All");const[bd,setBd]=useState("All");
  const BC={JEE:{c:T.p600,bg:T.p50},NEET:{c:T.teal,bg:T.tealBg},CBSE:{c:T.blue,bg:T.blueBg}};
  const shown=PREV_PAPERS.filter(p=>(yr==="All"||p.year===Number(yr))&&(bd==="All"||p.board===bd));
  return(
    <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}>
      <BackHeader title="Previous Papers" sub="Historical year-wise questionnaires" onBack={onBack}/>
      <div style={{padding:"12px 16px 0",flexShrink:0,display:"flex",flexDirection:"column",gap:8}}>
        <div style={{display:"flex",gap:7,overflowX:"auto"}}>{["All","2024","2023","2022"].map(y=><button key={y} onClick={()=>setYr(y)} style={{flexShrink:0,padding:"6px 14px",borderRadius:99,fontSize:12,fontWeight:700,cursor:"pointer",border:`1.5px solid ${yr===y?T.p500:T.g200}`,background:yr===y?T.p500:T.white,color:yr===y?T.white:T.g600}}>{y}</button>)}</div>
        <div style={{display:"flex",gap:7,overflowX:"auto"}}>{["All","JEE","NEET","CBSE"].map(b=><button key={b} onClick={()=>setBd(b)} style={{flexShrink:0,padding:"6px 14px",borderRadius:99,fontSize:12,fontWeight:700,cursor:"pointer",border:`1.5px solid ${bd===b?T.orange:T.g200}`,background:bd===b?T.orange:T.white,color:bd===b?T.white:T.g600}}>{b}</button>)}</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px 16px"}}>
        {shown.map(p=>{const bc=BC[p.board]||{c:T.g600,bg:T.g100};return(
          <Card key={p.id} style={{marginBottom:11,padding:"15px 16px",display:"flex",alignItems:"center",gap:13}}>
            <div style={{width:44,height:44,borderRadius:12,flexShrink:0,background:bc.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><FileText size={20} color={bc.c}/></div>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:13.5,fontWeight:800,color:T.g900,marginBottom:5}}>{p.title}</div><div style={{display:"flex",gap:7,alignItems:"center"}}><Badge color={bc.c} bg={bc.bg}>{p.board}</Badge><span style={{fontSize:11,color:T.g400}}>{p.q}Q · {p.mins}m · {p.year}</span></div></div>
            <div style={{display:"flex",gap:7,flexShrink:0}}>
              <button style={{width:34,height:34,borderRadius:9,border:`1.5px solid ${T.g200}`,background:T.white,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Eye size={15} color={T.g500}/></button>
              <button style={{width:34,height:34,borderRadius:9,border:"none",background:`linear-gradient(135deg,${T.p500},${T.p700})`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Download size={15} color={T.white}/></button>
            </div>
          </Card>
        );})}
        <div style={{height:8}}/>
      </div>
    </div>
  );
}

// ── MEMORY VAULT ──────────────────────────────────────────
function MemoryVault({onBack,memories,processInput,remove,clearAll}){
  const[val,setVal]=useState("");const[toast,setToast]=useState("");
  const hasCmd=/^\s*@(vimp|imp)\s+/m.test(val);
  const PCFG={vimp:{label:"VERY IMPORTANT",color:T.red,bg:T.redBg,dot:"🔴"},imp:{label:"IMPORTANT",color:T.gold,bg:T.goldBg,dot:"🟡"}};
  const submit=()=>{if(!val.trim())return;const{cleanText,captured}=processInput(val);setVal(cleanText);if(captured){setToast(`${captured} item${captured>1?"s":""} saved`);setTimeout(()=>setToast(""),2200)}};
  return(
    <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0,background:T.g900}}>
      <div style={{background:"#111827",padding:"50px 18px 14px",borderBottom:"1px solid rgba(255,255,255,.08)",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={onBack} style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,.08)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><ArrowLeft size={17} color={T.g300}/></button>
          <div style={{flex:1}}><h2 style={{fontSize:20,fontWeight:900,color:T.white,margin:0}}>Core Memory Vault</h2><p style={{fontSize:11.5,color:T.g500,margin:"3px 0 0"}}>@vimp · @imp persistent storage</p></div>
          <div style={{display:"flex",gap:7}}>
            <button onClick={()=>{navigator.clipboard?.writeText(memories.map(m=>`[${m.label}] ${m.content}`).join("\n"));setToast("Copied!");setTimeout(()=>setToast(""),2000)}} style={{padding:"7px 12px",borderRadius:9,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",color:T.p300,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><Copy size={12}/> Export</button>
            {memories.length>0&&<button onClick={clearAll} style={{padding:"7px 12px",borderRadius:9,background:T.redBg,border:`1px solid ${T.red}30`,color:T.red,fontSize:12,fontWeight:700,cursor:"pointer"}}>Clear</button>}
          </div>
        </div>
      </div>
      <div style={{background:`linear-gradient(135deg,${T.p900},${T.p800})`,padding:"13px 18px",flexShrink:0,borderBottom:"1px solid rgba(255,255,255,.08)"}}>
        <p style={{margin:0,fontSize:12.5,color:"rgba(255,255,255,.7)",lineHeight:1.6}}>Start a line with <code style={{background:"rgba(239,68,68,.25)",color:"#FCA5A5",padding:"1px 6px",borderRadius:5,fontWeight:800}}>@vimp</code> or <code style={{background:"rgba(245,158,11,.25)",color:"#FDE68A",padding:"1px 6px",borderRadius:5,fontWeight:800}}>@imp</code> to capture into Permanent Core Memory — immune to context loss.</p>
      </div>
      <div style={{background:"#1f2937",padding:"14px 16px",flexShrink:0,borderBottom:"1px solid rgba(255,255,255,.08)"}}>
        <div style={{position:"relative"}}>
          <textarea value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&(e.metaKey||e.ctrlKey))submit()}} placeholder={`@vimp Discriminant formula: D = b² − 4ac\n@imp Always check units in physics\nRegular notes unaffected…`} rows={4} style={{width:"100%",background:"rgba(255,255,255,.06)",border:`1.5px solid ${hasCmd?"#FDE68A33":"rgba(255,255,255,.12)"}`,borderRadius:12,padding:"12px 14px",color:T.white,fontSize:13.5,lineHeight:1.65,fontFamily:"inherit",resize:"none",outline:"none",boxSizing:"border-box",transition:"border .15s"}}/>
          {hasCmd&&<div style={{position:"absolute",top:8,right:8,padding:"3px 9px",borderRadius:99,background:"rgba(245,158,11,.2)",border:"1px solid rgba(245,158,11,.4)"}}><span style={{fontSize:10,fontWeight:800,color:T.gold}}>⚡ TAG DETECTED</span></div>}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10}}>
          <span style={{fontSize:11,color:T.g500}}>⌘+Enter to process</span>
          <button onClick={submit} style={{padding:"9px 18px",borderRadius:11,border:"none",background:val.trim()?`linear-gradient(135deg,${T.p500},${T.p700})`:"#374151",color:T.white,fontSize:13,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}><Send size={13}/> Process & Save</button>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 16px"}}>
        {memories.length===0?(<div style={{textAlign:"center",padding:"48px 20px"}}><div style={{fontSize:40,marginBottom:12}}>🧠</div><p style={{color:T.g500,fontSize:14,fontWeight:600,margin:0}}>No memories yet</p><p style={{color:T.g600,fontSize:12,margin:"6px 0 0"}}>Use @vimp or @imp above</p></div>):
          memories.slice().reverse().map(mem=>{const cfg=PCFG[mem.priority]||PCFG.imp;return(
            <div key={mem.id} style={{marginBottom:10,padding:"14px 15px",borderRadius:14,background:"#1f2937",border:`1.5px solid ${cfg.color}25`,display:"flex",alignItems:"flex-start",gap:11}}>
              <span style={{fontSize:18,flexShrink:0,marginTop:1}}>{cfg.dot}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}><span style={{fontSize:9.5,fontWeight:800,letterSpacing:.6,padding:"2px 7px",borderRadius:99,background:`${cfg.color}22`,color:cfg.color}}>{cfg.label}</span><span style={{fontSize:10.5,color:T.g500}}>{fmtDate(mem.ts)}</span></div>
                <p style={{margin:0,fontSize:13.5,color:"rgba(255,255,255,.85)",lineHeight:1.55,fontWeight:500}}>{mem.content}</p>
              </div>
              <button onClick={()=>remove(mem.id)} style={{background:"none",border:"none",cursor:"pointer",padding:4,flexShrink:0,opacity:.5}}><X size={14} color={T.g300}/></button>
            </div>
          )})}
        <div style={{height:8}}/>
      </div>
      {toast&&<div style={{position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",background:"#111827",color:T.white,padding:"9px 18px",borderRadius:99,fontSize:12.5,fontWeight:700,zIndex:600,display:"flex",alignItems:"center",gap:6,border:`1px solid ${T.p400}50`,boxShadow:"0 4px 20px rgba(0,0,0,.4)",animation:"fadeInToast .2s ease",whiteSpace:"nowrap"}}><CheckCircle2 size={13} color={T.green}/> {toast}</div>}
    </div>
  );
}

// ── CONTEXT BRIDGE ────────────────────────────────────────
function ContextBridgeScreen({onBack,received,syncing,log,broadcast}){
  const[copied,setCopied]=useState(false);
  const codeLines=(received?JSON.stringify(received,null,2):DEMO_TASK.starterCode).split("\n");
  return(
    <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}>
      <BackHeader title="Context Sync Bridge" sub="Cross-app postMessage API layer" onBack={onBack}/>
      <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,padding:"12px 14px",background:T.p50,borderRadius:13,border:`1px solid ${T.p100}`}}>
          {[{l:"StudyAI App",e:"📱",s:"Source"},{l:"postMessage",e:"→",s:"window API"},{l:"Code Editor",e:"💻",s:"Target"}].map(({l,e,s},i)=>(
            <div key={i} style={{flex:1,textAlign:"center"}}><div style={{fontSize:i===1?18:20,marginBottom:4}}>{e}</div><div style={{fontSize:10.5,fontWeight:700,color:T.p700}}>{l}</div><div style={{fontSize:9.5,color:T.p400}}>{s}</div></div>
          ))}
        </div>
        <Card style={{marginBottom:12,overflow:"hidden"}}>
          <div style={{padding:"12px 14px",background:T.g900,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:8,height:8,borderRadius:"50%",background:T.green,animation:"dotPulse 2s ease infinite"}}/><span style={{fontSize:12,fontWeight:700,color:T.g100}}>StudyAI Context Source</span></div>
            <Badge color={T.p300} bg="rgba(139,92,246,.2)">{DEMO_TASK.type}</Badge>
          </div>
          <div style={{padding:"14px 16px"}}>
            <h4 style={{fontSize:14.5,fontWeight:800,color:T.g900,margin:"0 0 6px"}}>{DEMO_TASK.title}</h4>
            <p style={{fontSize:12.5,color:T.g600,margin:"0 0 10px",lineHeight:1.5}}>{DEMO_TASK.description}</p>
            <div style={{display:"flex",gap:7,marginBottom:12,flexWrap:"wrap"}}><Badge color={T.blue} bg={T.blueBg}>{DEMO_TASK.language}</Badge><Badge color={T.green} bg={T.greenBg}>{DEMO_TASK.framework}</Badge></div>
            {DEMO_TASK.requirements.map((r,i)=><div key={i} style={{display:"flex",gap:7,marginBottom:4,fontSize:12,color:T.g600}}><span style={{color:T.p500,fontWeight:800}}>▸</span>{r}</div>)}
            <button onClick={()=>broadcast(DEMO_TASK)} disabled={syncing} style={{width:"100%",padding:"12px",borderRadius:12,border:"none",cursor:syncing?"not-allowed":"pointer",background:syncing?T.g200:`linear-gradient(135deg,${T.p500},${T.p700})`,color:syncing?T.g400:T.white,fontSize:13.5,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:syncing?"none":`0 3px 14px ${T.p600}45`,marginTop:14,transition:"all .2s"}}>
              {syncing?<><RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/> Syncing…</>:<><Wifi size={14}/> Broadcast to Editor</>}
            </button>
          </div>
        </Card>
        <Card style={{marginBottom:12,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",background:"#0d1117",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",gap:6}}>{["#FF5F56","#FFBD2E","#27C93F"].map(c=><div key={c} style={{width:10,height:10,borderRadius:"50%",background:c}}/>)}<span style={{fontSize:11,color:"#6B7280",marginLeft:6}}>{received?"QuizResultCard.jsx":"editor — awaiting sync"}</span></div>
            <button onClick={()=>{navigator.clipboard?.writeText(JSON.stringify(received||DEMO_TASK,null,2));setCopied(true);setTimeout(()=>setCopied(false),2000)}} style={{background:"none",border:"none",cursor:"pointer",color:"#6B7280",fontSize:11,display:"flex",alignItems:"center",gap:4}}><Copy size={11}/>{copied?"Copied!":"Copy"}</button>
          </div>
          <div style={{background:"#0d1117",padding:"14px",overflowX:"auto"}}>
            <pre style={{margin:0,fontSize:11.5,lineHeight:1.8,fontFamily:"'Courier New',monospace",color:"#e2e8f0"}}>
              {codeLines.map((line,i)=>(
                <div key={i} style={{display:"flex",gap:12}}>
                  <span style={{color:"#374151",minWidth:22,textAlign:"right",userSelect:"none",flexShrink:0}}>{i+1}</span>
                  <span style={{color:line.includes("TODO:")?T.gold:line.includes("//")?T.g500:line.includes("export")||line.includes("import")?T.p300:line.includes("function")||line.includes("return")||line.includes("const")||line.includes("default")?"#7C3AED":line.includes('"')||line.includes("'")?T.green:"#E2E8F0"}}>{line||" "}</span>
                </div>
              ))}
            </pre>
          </div>
          {received&&<div style={{padding:"10px 14px",background:"rgba(16,185,129,.08)",borderTop:"1px solid rgba(16,185,129,.2)",display:"flex",alignItems:"center",gap:8}}><CheckCircle2 size={14} color={T.green}/><span style={{fontSize:12,fontWeight:700,color:T.greenDk}}>Context synced · {fmtDate(Date.now())}</span></div>}
        </Card>
        {log.length>0&&<Card style={{padding:"14px 15px",marginBottom:12}}><p style={{fontSize:12,fontWeight:700,color:T.g500,margin:"0 0 10px",letterSpacing:.5,textTransform:"uppercase"}}>Transmission Log</p>
          {log.map((e,i)=><div key={i} style={{display:"flex",gap:10,marginBottom:6,fontSize:12,color:T.g600,alignItems:"center"}}><span style={{color:T.g400}}>{new Date(e.ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span><span style={{padding:"1px 7px",borderRadius:99,fontSize:10.5,fontWeight:700,background:e.dir==="OUT"?T.p50:T.greenBg,color:e.dir==="OUT"?T.p600:T.green}}>{e.dir}</span><span style={{flex:1}}>{e.summary}</span></div>)}
        </Card>}
        <div style={{height:8}}/>
      </div>
    </div>
  );
}

// ── ANALYTICS + APEX MODAL ────────────────────────────────
function AnalyticsScreen({onBack,apexData,onShowApex}){
  const{stats,subjAvg}=apexData;
  return(
    <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}>
      <BackHeader title="My Analytics" sub="Top Ranker Priority Dispatch" onBack={onBack}/>
      <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
        {apexData.eligible&&<div onClick={onShowApex} style={{marginBottom:16,padding:"18px",borderRadius:18,cursor:"pointer",background:`linear-gradient(135deg,#0f052a,#1e0b4b)`,border:`2px solid ${T.gold}66`,boxShadow:`0 6px 32px rgba(245,158,11,.22)`}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:52,height:52,borderRadius:14,flexShrink:0,background:`linear-gradient(135deg,${T.gold},#D97706)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 18px rgba(245,158,11,.5)`}}><Crown size={26} color={T.white} fill={T.white}/></div>
            <div style={{flex:1}}><div style={{fontSize:10.5,fontWeight:800,color:T.gold,letterSpacing:1,marginBottom:4}}>⚡ APEX STARK EXECUTIVE</div><div style={{fontSize:14.5,fontWeight:900,color:T.white,letterSpacing:-.2}}>Contract Eligibility Verified</div><div style={{fontSize:11,color:"rgba(255,255,255,.5)",marginTop:3}}>Tier: {apexData.tier} · Tap to claim</div></div>
            <ChevronRight size={18} color={T.gold}/>
          </div>
        </div>}
        <Card style={{padding:"20px 18px",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:18}}>
            <div style={{position:"relative",width:90,height:90,flexShrink:0}}>
              <svg width="90" height="90" viewBox="0 0 90 90"><circle cx="45" cy="45" r="36" fill="none" stroke={T.g100} strokeWidth="9"/><circle cx="45" cy="45" r="36" fill="none" stroke={stats.avg>=90?T.gold:stats.avg>=75?T.green:T.p500} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${2*Math.PI*36}`} strokeDashoffset={`${2*Math.PI*36*(1-stats.avg/100)}`} transform="rotate(-90 45 45)" style={{transition:"stroke-dashoffset 1.2s ease"}}/></svg>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:20,fontWeight:900,color:T.g900,lineHeight:1}}>{stats.avg}%</span><span style={{fontSize:9,color:T.g400,fontWeight:600}}>AVG</span></div>
            </div>
            <div style={{flex:1}}><h3 style={{fontSize:16,fontWeight:900,color:T.g900,margin:"0 0 10px"}}>Performance Summary</h3>
              {[["Total Quizzes",stats.n,T.p600],["Perfect Scores",stats.perfect,T.gold],["Day Streak",stats.streak,T.orange]].map(([l,v,c])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:12,color:T.g500,fontWeight:500}}>{l}</span><span style={{fontSize:14,fontWeight:800,color:c}}>{v}</span></div>
              ))}
            </div>
          </div>
        </Card>
        <Card style={{padding:"16px",marginBottom:14}}>
          <p style={{fontSize:12,fontWeight:700,color:T.g500,margin:"0 0 14px",letterSpacing:.5,textTransform:"uppercase"}}>Subject Breakdown</p>
          {subjAvg.map(({subject,avg})=>(
            <div key={subject} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:13,fontWeight:600,color:T.g700}}>{subject}</span><span style={{fontSize:13,fontWeight:800,color:avg>=90?T.green:avg>=75?T.p600:T.orange}}>{avg}%</span></div>
              <div style={{height:7,borderRadius:99,background:T.g100,overflow:"hidden"}}><div style={{height:"100%",width:`${avg}%`,background:avg>=90?`linear-gradient(90deg,${T.green},#059669)`:avg>=75?`linear-gradient(90deg,${T.p400},${T.p600})`:`linear-gradient(90deg,${T.orange},#EA580C)`,borderRadius:99,transition:"width .8s"}}/></div>
            </div>
          ))}
        </Card>
        <Card style={{padding:"16px",overflow:"hidden"}}>
          <p style={{fontSize:12,fontWeight:700,color:T.g500,margin:"0 0 12px",letterSpacing:.5,textTransform:"uppercase"}}>Recent Quizzes</p>
          {QUIZ_HISTORY.slice().reverse().map(q=>(
            <div key={q.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${T.g100}`}}>
              <div style={{width:38,height:38,borderRadius:10,flexShrink:0,background:q.accuracy===100?T.goldBg:q.accuracy>=85?T.greenBg:T.orangeBg,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16}}>{q.accuracy===100?"⭐":q.accuracy>=85?"✅":"📈"}</span></div>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:700,color:T.g800,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.topic}</div><div style={{fontSize:11,color:T.g400}}>{q.subject} · {fmtDate(q.date)}</div></div>
              <div style={{textAlign:"right",flexShrink:0}}><div style={{fontSize:15,fontWeight:900,color:q.accuracy===100?T.gold:q.accuracy>=85?T.green:T.orange}}>{q.accuracy}%</div><div style={{fontSize:10.5,color:T.g400}}>{q.score}/{q.total}</div></div>
            </div>
          ))}
        </Card>
        <div style={{height:8}}/>
      </div>
    </div>
  );
}

function ApexModal({apexData,onClose}){
  const profile=getProfile();const{payload,tier,stats}=apexData;const[claimed,setClaimed]=useState(false);
  const TGRAD={PLATINUM:"linear-gradient(135deg,#e8e8e8,#a8a8a8)",GOLD:"linear-gradient(135deg,#F59E0B,#D97706)",SILVER:"linear-gradient(135deg,#9CA3AF,#6B7280)"};
  return(
    <div style={{position:"fixed",inset:0,zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",background:"rgba(0,0,0,.85)",backdropFilter:"blur(8px)",maxWidth:480,margin:"0 auto"}}>
      <div style={{width:"100%",maxWidth:400,borderRadius:24,overflow:"hidden",background:`linear-gradient(160deg,#0f052a 0%,#1e0b4b 50%,#2d1274 100%)`,border:`2px solid ${T.gold}55`,boxShadow:`0 24px 80px rgba(0,0,0,.8)`,animation:"apexIn .5s cubic-bezier(.34,1.56,.64,1)"}}>
        <div style={{height:5,background:`linear-gradient(90deg,${T.p500},${T.gold},${T.p500})`}}/>
        <div style={{padding:"24px 24px 16px",textAlign:"center"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><div style={{width:64,height:64,borderRadius:18,background:`linear-gradient(135deg,${T.gold},#D97706)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 8px 32px rgba(245,158,11,.6)`}}><Crown size={32} color={T.white} fill={T.white}/></div></div>
          <div style={{fontSize:10,fontWeight:900,letterSpacing:3,color:T.gold,marginBottom:4}}>⚡ APEX STARK</div>
          <div style={{fontSize:13,fontWeight:700,letterSpacing:2,color:"rgba(255,255,255,.7)",marginBottom:8}}>EXECUTIVE CONTRACT</div>
          <div style={{fontSize:22,fontWeight:900,color:T.white,letterSpacing:-.3,lineHeight:1.2}}>ELIGIBILITY<br/><span style={{background:`linear-gradient(90deg,${T.gold},#FDE68A)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>VERIFIED ✓</span></div>
        </div>
        <div style={{height:1,background:`linear-gradient(90deg,transparent,${T.gold}55,transparent)`,margin:"0 24px"}}/>
        <div style={{padding:"16px 24px",textAlign:"center"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 18px",borderRadius:99,background:TGRAD[tier],marginBottom:12,boxShadow:"0 4px 14px rgba(0,0,0,.4)"}}><Star size={13} color={T.white} fill={T.white}/><span style={{fontSize:12,fontWeight:900,color:T.white,letterSpacing:.5}}>{tier} TIER</span></div>
          <p style={{color:T.white,fontSize:18,fontWeight:900,margin:"0 0 3px"}}>{profile.name||"Top Performer"}</p>
          <p style={{color:"rgba(255,255,255,.5)",fontSize:12,margin:0}}>{profile.class||"Class 11"} · {profile.board||"CBSE"}</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:1,background:`${T.gold}22`,margin:"0 16px 16px",borderRadius:14,overflow:"hidden",border:`1px solid ${T.gold}22`}}>
          {[[stats.avg+"%","Accuracy",T.gold],[stats.n,"Quizzes",T.p300],[stats.streak,"Streak",T.orange],[stats.perfect,"Perfect",T.green]].map(([v,l,c])=>(
            <div key={l} style={{padding:"12px 6px",background:"rgba(0,0,0,.4)",textAlign:"center"}}><div style={{fontSize:18,fontWeight:900,color:c}}>{v}</div><div style={{fontSize:9,color:"rgba(255,255,255,.4)",fontWeight:700,letterSpacing:.3}}>{l.toUpperCase()}</div></div>
          ))}
        </div>
        <div style={{margin:"0 16px 16px",padding:"10px 14px",borderRadius:11,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:9.5,color:T.g500,fontWeight:700,letterSpacing:.5}}>VERIFICATION ID</span><span style={{fontSize:9.5,color:T.g500}}>{new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</span></div>
          <code style={{fontSize:11,color:T.p300,fontFamily:"monospace",letterSpacing:.5}}>{payload?.id||"ASX-2026-GOLD-XXXXXXXX"}</code>
        </div>
        <div style={{padding:"0 16px 20px",display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:12,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",color:"rgba(255,255,255,.7)",fontSize:13,fontWeight:700,cursor:"pointer"}}>Close</button>
          <button onClick={()=>{navigator.clipboard?.writeText(JSON.stringify(payload,null,2));setClaimed(true)}} style={{flex:2,padding:"12px",borderRadius:12,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${T.gold},#D97706)`,color:T.white,fontSize:13,fontWeight:800,boxShadow:`0 4px 18px rgba(245,158,11,.5)`,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
            {claimed?<><CheckCircle2 size={14}/> Copied!</>:<><Gift size={14}/> Claim Badge</>}
          </button>
        </div>
        <div style={{height:4,background:`linear-gradient(90deg,${T.p500},${T.gold},${T.p500})`}}/>
      </div>
    </div>
  );
}

// ── PROFILE MENU (Screen 10) ──────────────────────────────
function ProfileMenuScreen({profile,onLogout,onNav}){
  const name=profile?.name||"Student";const track=profile?.track||"iitjee";const cls=profile?.class||"Class 11";const board=profile?.board||"CBSE";const streak=profile?.streak||7;
  const initials=name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
  return(
    <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}>
      <div style={{background:`linear-gradient(150deg,${T.p900} 0%,${T.p700} 60%,${T.p600} 100%)`,padding:"52px 24px 80px",position:"relative",overflow:"hidden",borderRadius:"0 0 32px 32px",flexShrink:0}}>
        <div style={{position:"absolute",top:-60,right:-60,width:200,height:200,borderRadius:"50%",background:`radial-gradient(circle,${T.p500}40,transparent)`,pointerEvents:"none"}}/>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:68,height:68,borderRadius:"50%",background:`linear-gradient(135deg,${T.p400},${T.p600})`,border:"3px solid rgba(255,255,255,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:800,color:T.white,flexShrink:0,boxShadow:"0 4px 20px rgba(0,0,0,.3)"}}>{initials}</div>
            <div><p style={{margin:0,color:"rgba(255,255,255,.6)",fontSize:12,fontWeight:600}}>Welcome back 👋</p><h2 style={{margin:"4px 0 6px",color:T.white,fontSize:22,fontWeight:800}}>{name}</h2><span style={{background:"rgba(255,255,255,.12)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,.2)",borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700,color:T.gold}}>{cls} · {board}</span></div>
          </div>
          <button style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",borderRadius:12,padding:"9px",cursor:"pointer"}}><Bell size={18} color={T.white}/></button>
        </div>
      </div>
      <div style={{margin:"-40px 20px 0",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,flexShrink:0}}>
        {[{Icon:Flame,label:"Day Streak",value:`${streak} 🔥`,color:"#F97316"},{Icon:Target,label:"Track",value:`${TRACK_ICONS[track]} ${TRACK_LABELS[track]}`,color:T.p600},{Icon:Trophy,label:"Rank",value:"Top 5%",color:T.gold}].map(({Icon,label,value,color})=>(
          <Card key={label} style={{padding:"14px 10px",textAlign:"center",boxShadow:"0 4px 20px rgba(109,40,217,.12)"}}><Icon size={18} color={color} style={{margin:"0 auto 6px"}}/><div style={{fontSize:13,fontWeight:800,color:T.g800,marginBottom:2}}>{value}</div><div style={{fontSize:10,fontWeight:600,color:T.g400}}>{label}</div></Card>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px 20px 8px"}}>
        {profile?.subjects?.length>0&&<div style={{marginBottom:20}}><p style={{margin:"0 0 10px",fontSize:13,fontWeight:700,color:T.g600}}>YOUR SUBJECTS</p><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{profile.subjects.map(s=><span key={s} style={{padding:"5px 12px",background:T.p50,borderRadius:99,border:`1px solid ${T.p100}`,fontSize:12,fontWeight:600,color:T.p700}}>{s}</span>)}</div></div>}
        <p style={{margin:"0 0 10px",fontSize:13,fontWeight:700,color:T.g600}}>LEARNING</p>
        <Card style={{padding:0,overflow:"hidden",marginBottom:16}}>
          {[{Icon:BookOpen,label:"My Courses",badge:"3 New",color:T.p600,id:"courses"},{Icon:FileText,label:"My Notes",badge:null,color:T.p600,id:"notes"},{Icon:Bookmark,label:"Bookmarks",badge:"12",color:T.p600,id:"bookmarks"},{Icon:BarChart2,label:"Progress Report",badge:null,color:T.green,id:"analytics"}].map(({Icon,label,badge,color,id})=>(
            <button key={id} onClick={()=>onNav(id)} style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"15px 18px",background:"none",border:"none",cursor:"pointer",borderBottom:`1px solid ${T.g100}`,textAlign:"left"}} onPointerEnter={e=>e.currentTarget.style.background=T.p50} onPointerLeave={e=>e.currentTarget.style.background="none"}>
              <div style={{width:40,height:40,borderRadius:12,background:`${color}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon size={18} color={color}/></div>
              <span style={{flex:1,fontSize:15,fontWeight:600,color:T.g800}}>{label}</span>
              {badge&&<span style={{background:T.p600,color:T.white,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:99}}>{badge}</span>}
              <ChevronRight size={16} color={T.g400}/>
            </button>
          ))}
        </Card>
        <p style={{margin:"0 0 10px",fontSize:13,fontWeight:700,color:T.g600}}>ACCOUNT</p>
        <Card style={{padding:0,overflow:"hidden",marginBottom:24}}>
          {[{Icon:Settings,label:"Preferences",color:T.g600},{Icon:HelpCircle,label:"Help & Support",color:T.g600}].map(({Icon,label,color})=>(
            <button key={label} style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"15px 18px",background:"none",border:"none",cursor:"pointer",borderBottom:`1px solid ${T.g100}`,textAlign:"left"}} onPointerEnter={e=>e.currentTarget.style.background=T.g50} onPointerLeave={e=>e.currentTarget.style.background="none"}>
              <div style={{width:40,height:40,borderRadius:12,background:T.g100,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon size={18} color={color}/></div>
              <span style={{flex:1,fontSize:15,fontWeight:600,color:T.g800}}>{label}</span><ChevronRight size={16} color={T.g400}/>
            </button>
          ))}
          <button onClick={onLogout} style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"15px 18px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}} onPointerEnter={e=>e.currentTarget.style.background="#FEF2F2"} onPointerLeave={e=>e.currentTarget.style.background="none"}>
            <div style={{width:40,height:40,borderRadius:12,background:"#FEF2F2",display:"flex",alignItems:"center",justifyContent:"center"}}><LogOut size={18} color={T.red}/></div>
            <span style={{fontSize:15,fontWeight:700,color:T.red}}>Logout</span>
          </button>
        </Card>
      </div>
    </div>
  );
}

// ── BOTTOM TAB BAR ────────────────────────────────────────
const TABS=[{id:"home",Icon:Home,label:"Home"},{id:"notes",Icon:BookMarked,label:"Notes"},{id:"quiz",Icon:Zap,label:"Quiz"},{id:"exam",Icon:Award,label:"Exam"},{id:"profile",Icon:User,label:"Profile"}];
function BottomTabBar({active,onChange}){
  return(
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:T.white,borderTop:`1px solid ${T.g100}`,display:"flex",zIndex:300,boxShadow:"0 -4px 22px rgba(109,40,217,.09)"}}>
      {TABS.map(({id,Icon,label})=>{const on=active===id;return(
        <button key={id} onClick={()=>onChange(id)} style={{flex:1,padding:"9px 2px 14px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,position:"relative"}}>
          {on&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:28,height:3,borderRadius:"0 0 5px 5px",background:`linear-gradient(90deg,${T.p400},${T.p600})`}}/>}
          <Icon size={21} color={on?T.p600:T.g400} strokeWidth={on?2.5:1.8}/>
          <span style={{fontSize:10,fontWeight:on?700:500,color:on?T.p600:T.g400,letterSpacing:.1}}>{label}</span>
        </button>
      );})}
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────
function App(){
  const[stage,setStage]=useState("boot");
  const[session,setSession]=useState(null);
  const[profile,setProfile]=useState(null);
  const[tab,setTab]=useState("home");
  const[screen,setScreen]=useState("home-dashboard");
  const[qCount,setQCount]=useState(()=>{try{const d=ls.get("q_count_today");return d?.date===new Date().toDateString()?d.count:0}catch{return 0}});
  const[quizCfg,setQuizCfg]=useState(null);
  const[quizQs,setQuizQs]=useState([]);
  const[quizAns,setQuizAns]=useState({});
  const[quizTime,setQuizTime]=useState(0);
  const memory=useMemoryRouter();
  const bridge=useContextBridge();
  const streak=profile?.streak||1;
  const apexData=useMemo(()=>evaluateApex(QUIZ_HISTORY,streak),[streak]);
  const[showApex,setShowApex]=useState(false);

  /** Loads the authenticated user's profile row from Supabase. Decides auth/onboard/app stage. */
  const loadProfile=useCallback(async(user)=>{
    const row=await fetchProfile(user.id);
    if(row&&row.name&&row.track){
      const full={...row,email:user.email};
      ls.set("edu_profile",full);
      setProfile(full);
      setStage("app");
    }else{
      // Authenticated but no profile yet → first-time onboarding
      ls.set("edu_profile",{id:user.id,email:user.email});
      setStage("onboard");
    }
  },[]);

  // ── REAL AUTH: bootstrap session + subscribe to changes ──
  useEffect(()=>{
    let active=true;
    supabase.auth.getSession().then(({data:{session}})=>{
      if(!active)return;
      setSession(session);
      if(session?.user)loadProfile(session.user);
      else setStage("auth");
    });
    const{data:listener}=supabase.auth.onAuthStateChange((_event,session)=>{
      setSession(session);
      if(session?.user)loadProfile(session.user);
      else{ls.del("edu_profile");setProfile(null);setStage("auth")}
    });
    return()=>{active=false;listener?.subscription?.unsubscribe()};
  },[loadProfile]);

  useEffect(()=>{
    if(stage==="app"&&apexData.eligible&&!sessionStorage.getItem("apex_shown")){
      setTimeout(()=>{setShowApex(true);sessionStorage.setItem("apex_shown","1")},2000);
    }
  },[stage,apexData.eligible]);

  const go=s=>setScreen(s);
  const handleTab=id=>{
    setTab(id);
    const map={home:"home-dashboard",notes:"notes",quiz:"quiz-setup",exam:"exam-dashboard",profile:"profile-menu"};
    go(map[id]||"home-dashboard");
  };
  const handleLogout=async()=>{
    await supabase.auth.signOut(); // real backend sign-out, clears session everywhere
    ls.del("edu_profile");
    setProfile(null);setStage("auth");setTab("home");go("home-dashboard");
  };
  const handleStartQuiz=(cfg,qs)=>{setQuizCfg(cfg);setQuizQs(qs);setQuizAns({});setQuizTime(0);go("quiz-play")};
  const handleFinishQuiz=(ans,elapsed)=>{setQuizAns(ans);setQuizTime(elapsed);go("quiz-result")};
  const handleRetry=()=>{const qs=buildQuiz(quizCfg.subject,quizCfg.topic,quizCfg.difficulty,quizCfg.count);setQuizQs(qs);setQuizAns({});setQuizTime(0);go("quiz-play")};

  const hideTab=["quiz-play","chat","vault"].includes(screen);

  if(stage==="boot")return<div style={{minHeight:"100vh",background:T.p950,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:T.p300,fontSize:14,fontWeight:700,animation:"pulse 1.5s ease infinite"}}>Loading StudyAI Elite…</div></div>;
  if(stage==="auth")return(<><GlobalStyles/><AuthScreen/></>);
  if(stage==="onboard")return(<><GlobalStyles/><ProfileSetupScreen onComplete={async(p)=>{
    const full={...p,id:session.user.id,email:session.user.email,streak:1};
    await persistProfile(full); // real INSERT into Supabase 'profiles' table
    setProfile(full);setStage("app");
  }}/></>);

  const renderScreen=()=>{
    switch(screen){
      case"home-dashboard": return<HomeDashboard profile={profile} onNav={id=>{if(id==="chat"){go("chat")}else if(id==="quiz-setup"){handleTab("quiz")}else if(id==="notes"){handleTab("notes")}else if(id==="exam"){handleTab("exam")}}}/>;
      case"chat":           return<AIChatScreen onBack={()=>go("home-dashboard")} questionCount={qCount} setQuestionCount={setQCount}/>;
      case"notes":          return<NotesScreen/>;
      case"quiz-setup":     return<QuizSetupScreen onBack={()=>handleTab("home")} onStart={handleStartQuiz}/>;
      case"quiz-play":      return quizCfg?<QuizPlayScreen config={quizCfg} questions={quizQs} onBack={()=>go("quiz-setup")} onFinish={handleFinishQuiz}/>:null;
      case"quiz-result":    return quizCfg?<QuizResultScreen config={quizCfg} questions={quizQs} answers={quizAns} timeTaken={quizTime} onBack={()=>handleTab("home")} onRetry={handleRetry}/>:null;
      case"exam-dashboard": return<ExamDashboard profile={profile} onNav={go} apexData={apexData} onOpenVault={()=>go("vault")}/>;
      case"revision":       return<RevisionPlanScreen onBack={()=>go("exam-dashboard")}/>;
      case"important":      return<ImportantTopicsScreen onBack={()=>go("exam-dashboard")}/>;
      case"mock":           return<MockTestsScreen onBack={()=>go("exam-dashboard")}/>;
      case"papers":         return<PreviousPapersScreen onBack={()=>go("exam-dashboard")}/>;
      case"vault":          return<MemoryVault onBack={()=>go(tab==="exam"?"exam-dashboard":"home-dashboard")} {...memory}/>;
      case"bridge":         return<ContextBridgeScreen onBack={()=>go("exam-dashboard")} {...bridge}/>;
      case"analytics":      return<AnalyticsScreen onBack={()=>go("exam-dashboard")} apexData={apexData} onShowApex={()=>setShowApex(true)}/>;
      case"profile-menu":   return<ProfileMenuScreen profile={profile} onLogout={handleLogout} onNav={id=>{if(id==="notes")handleTab("notes");else if(id==="analytics")go("analytics")}}/>;
      default:              return<HomeDashboard profile={profile} onNav={go}/>;
    }
  };

  return(
    <>
      <GlobalStyles/>
      <div style={{flex:1,display:"flex",flexDirection:"column",paddingBottom:hideTab?0:72,overflowY:["quiz-play","chat"].includes(screen)?"hidden":"auto"}}>
        {renderScreen()}
      </div>
      {screen!=="vault"&&<button onClick={()=>go("vault")} style={{position:"fixed",bottom:hideTab?24:90,right:20,zIndex:250,width:50,height:50,borderRadius:"50%",border:"none",cursor:"pointer",background:`linear-gradient(135deg,${T.p600},${T.p900})`,boxShadow:`0 6px 22px rgba(109,40,217,.5)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <Brain size={20} color={T.white}/>
        {memory.memories.length>0&&<span style={{position:"absolute",top:4,right:4,width:18,height:18,borderRadius:"50%",background:T.gold,border:`2px solid ${T.white}`,fontSize:9,fontWeight:900,color:T.white,display:"flex",alignItems:"center",justifyContent:"center"}}>{memory.memories.length>9?"9+":memory.memories.length}</span>}
      </button>}
      {!hideTab&&<BottomTabBar active={tab} onChange={handleTab}/>}
      {showApex&&apexData.eligible&&<ApexModal apexData={apexData} onClose={()=>setShowApex(false)}/>}
    </>
  );
}

export default function StudyAIElite(){return<App/>;}
