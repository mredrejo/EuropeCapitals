

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award, BarChart3, Check, Clock3, Flame, Globe2, Home, Map,
  Medal, RefreshCcw, Settings, Sparkles, Star, Trophy, Volume2,
  VolumeX, X, Zap
} from "lucide-react";

const COUNTRIES = [
  { country: "Albania", capital: "Tirana", x: 54, y: 73, region: "Balkans" },
  { country: "Germany", capital: "Berlin", x: 45, y: 45, region: "Central Europe" },
  { country: "Andorra", capital: "Andorra la Vella", x: 31, y: 68, region: "Western Europe" },
  { country: "Armenia", capital: "Yerevan", x: 87, y: 70, region: "Caucasus" },
  { country: "Austria", capital: "Vienna", x: 52, y: 55, region: "Central Europe" },
  { country: "Azerbaijan", capital: "Baku", x: 93, y: 67, region: "Caucasus" },
  { country: "Belgium", capital: "Brussels", x: 37, y: 47, region: "Western Europe" },
  { country: "Belarus", capital: "Minsk", x: 65, y: 42, region: "Eastern Europe" },
  { country: "Bosnia and Herzegovina", capital: "Sarajevo", x: 53, y: 65, region: "Balkans" },
  { country: "Bulgaria", capital: "Sofia", x: 62, y: 69, region: "Balkans" },
  { country: "Czechia", capital: "Prague", x: 50, y: 49, region: "Central Europe" },
  { country: "Cyprus", capital: "Nicosia", x: 75, y: 84, region: "Mediterranean" },
  { country: "Vatican City", capital: "Vatican City", x: 47, y: 72, region: "Southern Europe" },
  { country: "Croatia", capital: "Zagreb", x: 51, y: 61, region: "Balkans" },
  { country: "Denmark", capital: "Copenhagen", x: 46, y: 34, region: "Northern Europe" },
  { country: "Slovakia", capital: "Bratislava", x: 55, y: 53, region: "Central Europe" },
  { country: "Slovenia", capital: "Ljubljana", x: 49, y: 59, region: "Central Europe" },
  { country: "Spain", capital: "Madrid", x: 28, y: 71, region: "Southern Europe" },
  { country: "Estonia", capital: "Tallinn", x: 61, y: 28, region: "Baltic States" },
  { country: "Finland", capital: "Helsinki", x: 60, y: 22, region: "Northern Europe" },
  { country: "France", capital: "Paris", x: 35, y: 57, region: "Western Europe" },
  { country: "Georgia", capital: "Tbilisi", x: 84, y: 65, region: "Caucasus" },
  { country: "Greece", capital: "Athens", x: 59, y: 79, region: "Southern Europe" },
  { country: "Hungary", capital: "Budapest", x: 57, y: 57, region: "Central Europe" },
  { country: "Ireland", capital: "Dublin", x: 22, y: 43, region: "Western Europe" },
  { country: "Iceland", capital: "Reykjavik", x: 17, y: 17, region: "Northern Europe" },
  { country: "Italy", capital: "Rome", x: 46, y: 69, region: "Southern Europe" },
  { country: "Kosovo", capital: "Pristina", x: 59, y: 69, region: "Balkans" },
  { country: "Latvia", capital: "Riga", x: 61, y: 33, region: "Baltic States" },
  { country: "Liechtenstein", capital: "Vaduz", x: 43, y: 57, region: "Central Europe" },
  { country: "Lithuania", capital: "Vilnius", x: 61, y: 38, region: "Baltic States" },
  { country: "Luxembourg", capital: "Luxembourg", x: 39, y: 51, region: "Western Europe" },
  { country: "North Macedonia", capital: "Skopje", x: 59, y: 73, region: "Balkans" },
  { country: "Malta", capital: "Valletta", x: 47, y: 84, region: "Mediterranean" },
  { country: "Moldova", capital: "Chisinau", x: 67, y: 57, region: "Eastern Europe" },
  { country: "Monaco", capital: "Monaco", x: 39, y: 66, region: "Western Europe" },
  { country: "Montenegro", capital: "Podgorica", x: 56, y: 69, region: "Balkans" },
  { country: "Norway", capital: "Oslo", x: 45, y: 22, region: "Northern Europe" },
  { country: "Netherlands", capital: "Amsterdam", x: 39, y: 43, region: "Western Europe" },
  { country: "Poland", capital: "Warsaw", x: 56, y: 45, region: "Central Europe" },
  { country: "Portugal", capital: "Lisbon", x: 23, y: 72, region: "Southern Europe" },
  { country: "United Kingdom", capital: "London", x: 29, y: 44, region: "Western Europe" },
  { country: "Romania", capital: "Bucharest", x: 64, y: 63, region: "Eastern Europe" },
  { country: "Russia", capital: "Moscow", x: 75, y: 35, region: "Eastern Europe" },
  { country: "San Marino", capital: "San Marino", x: 48, y: 67, region: "Southern Europe" },
  { country: "Serbia", capital: "Belgrade", x: 57, y: 64, region: "Balkans" },
  { country: "Sweden", capital: "Stockholm", x: 52, y: 24, region: "Northern Europe" },
  { country: "Switzerland", capital: "Bern", x: 41, y: 58, region: "Central Europe" },
  { country: "Turkey", capital: "Ankara", x: 72, y: 75, region: "Southeastern Europe" },
  { country: "Ukraine", capital: "Kyiv", x: 68, y: 49, region: "Eastern Europe" }
];

const MODES = [
  { id: "country", label: "Country → capital", icon: Globe2, desc: "Choose the correct capital" },
  { id: "capital", label: "Capital → country", icon: Sparkles, desc: "Choose the correct country" },
  { id: "map", label: "Map challenge", icon: Map, desc: "Tap the right point on the map" },
  { id: "mixed", label: "Mixed practice", icon: Zap, desc: "All question types combined" }
];

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

function makeQuestion(mode, mastery, previous) {
  // Balanced rotation: every country is asked once before any country repeats.
  // The stored number of hits + misses acts as the number of times asked.
  const attempts = item => {
    const stats = mastery[item.country] || { hits: 0, misses: 0 };
    return stats.hits + stats.misses;
  };


  const fewestAttempts = Math.min(...COUNTRIES.map(attempts));
  let candidates = COUNTRIES.filter(item => attempts(item) === fewestAttempts);


  // Avoid an immediate repeat when possible.
  const withoutPrevious = candidates.filter(item => item.country !== previous);
  if (withoutPrevious.length) candidates = withoutPrevious;


  // Among equally practised countries, slightly prioritise those with more errors.
  const mostMisses = Math.max(...candidates.map(item => mastery[item.country]?.misses || 0));
  const priorityCandidates = candidates.filter(
    item => (mastery[item.country]?.misses || 0) === mostMisses
  );


  const item = pick(priorityCandidates);
  const actualMode = mode === "mixed" ? pick(["country", "capital", "map"]) : mode;
  if (actualMode === "map") return { item, type: "map", prompt: `Find ${item.country} on the map` };
  const wantsCapital = actualMode === "country";
  const answer = wantsCapital ? item.capital : item.country;
  const field = wantsCapital ? "capital" : "country";
  const wrong = shuffle(COUNTRIES.filter(x => x.country !== item.country)).slice(0, 3).map(x => x[field]);
  return {
    item, type: actualMode, answer,
    prompt: wantsCapital ? `What is the capital of ${item.country}?` : `${item.capital} is the capital of…`,
    options: shuffle([answer, ...wrong])
  };
}

function levelFor(score) {
  if (score >= 1000) return { name: "Master of Europe", icon: Trophy, next: null, floor: 1000 };
  if (score >= 500) return { name: "Europe Expert", icon: Medal, next: 1000, floor: 500 };
  if (score >= 200) return { name: "Explorer", icon: Award, next: 500, floor: 200 };
  return { name: "Beginner", icon: Star, next: 200, floor: 0 };
}

function Stat({ icon: Icon, label, value, tone }) {
  return <div className="rounded-2xl bg-white/80 p-3 shadow-sm ring-1 ring-slate-200 backdrop-blur">
    <div className={`mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${tone}`}><Icon size={15}/>{label}</div>
    <div className="text-xl font-black text-slate-800">{value}</div>
  </div>;
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [mode, setMode] = useState("mixed");
  const [score, setScore] = useState(() => Number(localStorage.getItem("euScore") || 0));
  const [hits, setHits] = useState(() => Number(localStorage.getItem("euHits") || 0));
  const [fails, setFails] = useState(() => Number(localStorage.getItem("euFails") || 0));
  const [bestStreak, setBestStreak] = useState(() => Number(localStorage.getItem("euBest") || 0));
  const [streak, setStreak] = useState(0);
  const [mastery, setMastery] = useState(() => JSON.parse(localStorage.getItem("euMastery") || "{}"));
  const [sound, setSound] = useState(() => localStorage.getItem("euSound") !== "off");
  const [timed, setTimed] = useState(false);
  const [time, setTime] = useState(60);
  const [question, setQuestion] = useState(() => makeQuestion("mixed", {}, ""));
  const [feedback, setFeedback] = useState(null);
  const [ended, setEnded] = useState(false);
  const audioCtx = useRef(null);

  const total = hits + fails;
  const accuracy = total ? Math.round((hits / total) * 100) : 0;
  const level = levelFor(score);
  const LevelIcon = level.icon;

  useEffect(() => {
    localStorage.setItem("euScore", score); localStorage.setItem("euHits", hits);
    localStorage.setItem("euFails", fails); localStorage.setItem("euBest", bestStreak);
    localStorage.setItem("euMastery", JSON.stringify(mastery));
    localStorage.setItem("euSound", sound ? "on" : "off");
  }, [score, hits, fails, bestStreak, mastery, sound]);

  useEffect(() => {
    if (!timed || screen !== "quiz" || ended || feedback) return;
    const timer = setInterval(() => setTime(t => {
      if (t <= 1) { setEnded(true); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(timer);
  }, [timed, screen, ended, feedback]);

  const beep = correct => {
    if (!sound) return;
    try {
      audioCtx.current ||= new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx.current, osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(correct ? 660 : 180, ctx.currentTime);
      if (correct) osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + .12);
      gain.gain.setValueAtTime(.08, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .2);
      osc.start(); osc.stop(ctx.currentTime + .2);
    } catch {}
  };

  const start = selected => {
    setMode(selected); setQuestion(makeQuestion(selected, mastery, ""));
    setFeedback(null); setEnded(false); setTime(60); setStreak(0); setScreen("quiz");
  };

  const answer = chosen => {
    if (feedback || ended) return;
    const correct = question.type === "map" ? chosen.country === question.item.country : chosen === question.answer;
    const bonus = correct ? 10 + Math.min(streak, 5) * 2 : -5;
    beep(correct);
    setFeedback({ correct, chosen, bonus });
    if (correct) {
      setScore(s => s + bonus); setHits(h => h + 1); setStreak(s => { const n = s + 1; setBestStreak(b => Math.max(b, n)); return n; });
    } else {
      setScore(s => s - 5); setFails(f => f + 1); setStreak(0);
    }
    setMastery(m => ({ ...m, [question.item.country]: {
      hits: (m[question.item.country]?.hits || 0) + (correct ? 1 : 0),
      misses: (m[question.item.country]?.misses || 0) + (correct ? 0 : 1)
    }}));
  };

  const next = () => {
    setQuestion(makeQuestion(mode, mastery, question.item.country)); setFeedback(null);
  };

  const reset = () => {
    setScore(0); setHits(0); setFails(0); setStreak(0); setBestStreak(0); setMastery({});
    localStorage.removeItem("euScore"); localStorage.removeItem("euHits"); localStorage.removeItem("euFails");
    localStorage.removeItem("euBest"); localStorage.removeItem("euMastery");
  };

  const weakest = useMemo(() => COUNTRIES.map(c => ({...c, ...(mastery[c.country] || {hits:0, misses:0})}))
    .filter(c => c.hits + c.misses > 0).sort((a,b) => b.misses - a.misses || a.hits - b.hits).slice(0,5), [mastery]);

  return <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-violet-100 text-slate-800">
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <button onClick={() => setScreen("home")} className="flex items-center gap-2 text-left">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 text-xl shadow-lg shadow-blue-200">🇪🇺</span>
          <span><b className="block leading-tight">Europe Quest</b><span className="text-xs text-slate-500">Countries & capitals</span></span>
        </button>
        <div className="flex gap-2">
          <button aria-label="Progress" onClick={() => setScreen("progress")} className="rounded-xl p-2.5 hover:bg-slate-100"><BarChart3 size={21}/></button>
          <button aria-label="Settings" onClick={() => setScreen("settings")} className="rounded-xl p-2.5 hover:bg-slate-100"><Settings size={21}/></button>
        </div>
      </div>
    </header>

    <main className="mx-auto max-w-5xl p-4 pb-24 sm:p-6">
      <AnimatePresence mode="wait">
        {screen === "home" && <motion.section key="home" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white shadow-xl sm:p-9">
            <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
              <div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-bold"><Sparkles size={15}/> Marcos learns by playing</div>
                <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Master the capitals of Europe</h1>
                <p className="mt-3 max-w-xl text-blue-100">Practise every country, earn points and revisit the places that need more work.</p>
              </div>
              <div className="grid min-w-44 grid-cols-2 gap-2 rounded-3xl bg-white/10 p-4 backdrop-blur">
                <div><div className="text-xs text-blue-200">SCORE</div><div className="text-2xl font-black">{score}</div></div>
                <div><div className="text-xs text-blue-200">ACCURACY</div><div className="text-2xl font-black">{accuracy}%</div></div>
                <div className="col-span-2 flex items-center gap-2 border-t border-white/20 pt-3"><LevelIcon size={20}/><b>{level.name}</b></div>
              </div>
            </div>
          </div>

          <h2 className="mb-3 mt-7 text-xl font-black">Choose a challenge</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {MODES.map(({id,label,icon:Icon,desc}) => <button key={id} onClick={() => start(id)} className="group flex items-center gap-4 rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white"><Icon size={27}/></span>
              <span className="min-w-0 flex-1"><b className="block text-lg">{label}</b><span className="text-sm text-slate-500">{desc}</span></span>
              <span className="text-xl text-slate-300">›</span>
            </button>)}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={Star} label="Points" value={score} tone="text-amber-600"/>
            <Stat icon={Check} label="Correct" value={hits} tone="text-emerald-600"/>
            <Stat icon={X} label="Wrong" value={fails} tone="text-rose-600"/>
            <Stat icon={Flame} label="Best streak" value={bestStreak} tone="text-orange-600"/>
          </div>
        </motion.section>}

        {screen === "quiz" && <motion.section key="quiz" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <button onClick={() => setScreen("home")} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold shadow-sm"><Home size={17}/> Home</button>
            <div className="flex gap-2">
              {timed && <span className={`flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-black ${time <= 10 ? "bg-rose-100 text-rose-700" : "bg-white"}`}><Clock3 size={17}/>{time}s</span>}
              <span className="flex items-center gap-1 rounded-xl bg-amber-100 px-3 py-2 text-sm font-black text-amber-700"><Star size={17}/>{score}</span>
              <span className="flex items-center gap-1 rounded-xl bg-orange-100 px-3 py-2 text-sm font-black text-orange-700"><Flame size={17}/>{streak}</span>
            </div>
          </div>

          {ended ? <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-xl">
            <Trophy className="mx-auto text-amber-500" size={64}/><h2 className="mt-3 text-3xl font-black">Time is up!</h2>
            <p className="mt-2 text-slate-500">Great practice. Your progress has been saved on this device.</p>
            <div className="my-6 grid grid-cols-3 gap-2"><Stat icon={Star} label="Score" value={score} tone="text-amber-600"/><Stat icon={Check} label="Correct" value={hits} tone="text-emerald-600"/><Stat icon={Flame} label="Streak" value={bestStreak} tone="text-orange-600"/></div>
            <button onClick={() => start(mode)} className="w-full rounded-2xl bg-blue-600 px-5 py-4 font-black text-white">Play again</button>
          </div> : <div className="mx-auto max-w-3xl rounded-3xl bg-white p-5 shadow-xl sm:p-8">
            <div className="mb-2 flex items-center justify-between"><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-indigo-700">{MODES.find(m => m.id === mode)?.label}</span><span className="text-sm text-slate-400">+10 to +20 / −5</span></div>
            <p className="mt-5 text-center text-2xl font-black sm:text-3xl">{question.prompt}</p>
            {question.type !== "map" ? <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {question.options.map(option => {
                const isRight = feedback && option === question.answer;
                const isWrong = feedback && option === feedback.chosen && !feedback.correct;
                return <button key={option} disabled={!!feedback} onClick={() => answer(option)} className={`min-h-16 rounded-2xl border-2 p-4 text-left text-lg font-bold transition ${isRight ? "border-emerald-500 bg-emerald-50 text-emerald-800" : isWrong ? "border-rose-500 bg-rose-50 text-rose-800" : "border-slate-200 hover:border-blue-500 hover:bg-blue-50"}`}>{option}{isRight && <Check className="float-right"/>}{isWrong && <X className="float-right"/>}</button>;
              })}
            </div> : <div className="relative mt-6 aspect-[4/3] w-full overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-b from-sky-100 to-blue-50 shadow-inner">
              <div className="absolute inset-0 opacity-40" style={{backgroundImage:"radial-gradient(#60a5fa 1px, transparent 1px)",backgroundSize:"18px 18px"}}/>
              <div className="absolute left-[12%] top-[8%] h-[76%] w-[82%] rounded-[45%_55%_50%_40%] bg-emerald-100/70 blur-sm"/>
              {COUNTRIES.map(c => {
                const right = feedback && c.country === question.item.country;
                const wrong = feedback && feedback.chosen?.country === c.country && !feedback.correct;
                return <button key={c.country} aria-label={c.country} disabled={!!feedback} onClick={() => answer(c)} style={{left:`${c.x}%`,top:`${c.y}%`}} className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white transition hover:z-20 hover:scale-150 ${right ? "h-6 w-6 bg-emerald-500" : wrong ? "h-6 w-6 bg-rose-500" : "h-3.5 w-3.5 bg-blue-600"}`} title={feedback ? c.country : "Tap this location"}/>;
              })}
              <div className="absolute bottom-3 left-3 rounded-xl bg-white/90 px-3 py-2 text-xs text-slate-500 shadow">Schematic learning map</div>
            </div>}

            <AnimatePresence>{feedback && <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className={`mt-5 rounded-2xl p-4 ${feedback.correct ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
              <div className="flex gap-3"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-white ${feedback.correct ? "bg-emerald-500" : "bg-rose-500"}`}>{feedback.correct ? <Check/> : <X/>}</span>
                <div className="flex-1"><b className="text-lg">{feedback.correct ? `Correct! ${feedback.bonus > 10 ? `+${feedback.bonus} streak bonus` : "+10 points"}` : "Not quite. −5 points"}</b><p className="text-sm">{question.item.country} — {question.item.capital} <span className="opacity-60">· {question.item.region}</span></p></div>
              </div><button onClick={next} className={`mt-4 w-full rounded-xl px-4 py-3 font-black text-white ${feedback.correct ? "bg-emerald-600" : "bg-rose-600"}`}>Next question</button>
            </motion.div>}</AnimatePresence>
          </div>}
        </motion.section>}

        {screen === "progress" && <motion.section key="progress" initial={{opacity:0}} animate={{opacity:1}}>
          <h1 className="text-3xl font-black">Your progress</h1><p className="mt-1 text-slate-500">Results are stored only on this device.</p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><Stat icon={Star} label="Points" value={score} tone="text-amber-600"/><Stat icon={Check} label="Correct" value={hits} tone="text-emerald-600"/><Stat icon={BarChart3} label="Accuracy" value={`${accuracy}%`} tone="text-blue-600"/><Stat icon={Flame} label="Best streak" value={bestStreak} tone="text-orange-600"/></div>
          <div className="mt-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-600"><LevelIcon/></span><div><div className="text-sm text-slate-500">Current level</div><div className="text-xl font-black">{level.name}</div></div></div>
            {level.next && <div className="mt-4"><div className="mb-1 flex justify-between text-xs font-bold"><span>{score} points</span><span>{level.next} needed</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{width:`${Math.max(0,Math.min(100,((score-level.floor)/(level.next-level.floor))*100))}%`}}/></div></div>}
          </div>
          <div className="mt-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="text-xl font-black">Needs more practice</h2><p className="mb-4 text-sm text-slate-500">Missed countries appear more often in future quizzes.</p>
            {weakest.length ? <div className="space-y-2">{weakest.map(c => <div key={c.country} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span><b>{c.country}</b><span className="block text-xs text-slate-500">{c.capital}</span></span><span className="text-sm font-bold text-rose-600">{c.misses} missed</span></div>)}</div> : <div className="rounded-xl bg-blue-50 p-4 text-blue-700">Play a quiz to build your learning profile.</div>}
          </div>
        </motion.section>}

        {screen === "settings" && <motion.section key="settings" initial={{opacity:0}} animate={{opacity:1}} className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-black">Settings</h1>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex items-center gap-3">{sound ? <Volume2 className="text-blue-600"/> : <VolumeX/>}<div><b>Sound effects</b><p className="text-sm text-slate-500">Short tones for right and wrong answers</p></div></div><button onClick={() => setSound(s=>!s)} className={`h-7 w-12 rounded-full p-1 transition ${sound ? "bg-blue-600" : "bg-slate-300"}`}><span className={`block h-5 w-5 rounded-full bg-white transition ${sound ? "translate-x-5" : ""}`}/></button></div>
            <div className="flex items-center justify-between rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex items-center gap-3"><Clock3 className="text-indigo-600"/><div><b>60-second challenge</b><p className="text-sm text-slate-500">Add a countdown to every quiz</p></div></div><button onClick={() => setTimed(t=>!t)} className={`h-7 w-12 rounded-full p-1 transition ${timed ? "bg-blue-600" : "bg-slate-300"}`}><span className={`block h-5 w-5 rounded-full bg-white transition ${timed ? "translate-x-5" : ""}`}/></button></div>
            <button onClick={reset} className="flex w-full items-center gap-3 rounded-3xl bg-white p-5 text-left text-rose-600 shadow-sm ring-1 ring-rose-200"><RefreshCcw/><span><b>Reset all progress</b><span className="block text-sm text-rose-400">Delete points, results and learning history</span></span></button>
          </div>
        </motion.section>}
      </AnimatePresence>
    </main>

    <nav className="fixed bottom-3 left-1/2 z-40 flex -translate-x-1/2 gap-1 rounded-2xl border border-white/70 bg-white/90 p-1.5 shadow-2xl backdrop-blur sm:hidden">
      <button onClick={() => setScreen("home")} className={`rounded-xl p-3 ${screen==="home"?"bg-blue-600 text-white":""}`}><Home size={20}/></button>
      <button onClick={() => setScreen("progress")} className={`rounded-xl p-3 ${screen==="progress"?"bg-blue-600 text-white":""}`}><BarChart3 size={20}/></button>
      <button onClick={() => setScreen("settings")} className={`rounded-xl p-3 ${screen==="settings"?"bg-blue-600 text-white":""}`}><Settings size={20}/></button>
    </nav>
  </div>;
}
