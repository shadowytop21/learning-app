import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateRoadmap } from "../api";

const SKILL_CHIPS = [
  "Python",
  "Video Editing",
  "Graphic Design",
  "Public Speaking",
  "Photography",
  "UI/UX Design",
];

const LOADING_MESSAGES = [
  "Scanning the best resources...",
  "Building your learning path...",
  "Personalizing your roadmap...",
];

const USER_ID = "user-123";

export default function HomePage() {
  const navigate = useNavigate();
  const [skill, setSkill] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [hoursPerDay, setHoursPerDay] = useState("1");
  const [loading, setLoading] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [error, setError] = useState("");

  const startMessageRotation = () => {
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length;
      setMsgIndex(idx);
    }, 2000);
    return interval;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!skill.trim()) {
      setError("Please enter a skill you want to learn.");
      return;
    }
    setError("");
    setLoading(true);
    setMsgIndex(0);
    const interval = startMessageRotation();

    try {
      const data = await generateRoadmap({
        skill: skill.trim(),
        level,
        hours_per_day: parseFloat(hoursPerDay),
        user_id: USER_ID,
      });
      clearInterval(interval);
      navigate(`/roadmap/${data.roadmap_id}`);
    } catch (err) {
      clearInterval(interval);
      setLoading(false);
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <nav className="px-6 py-4 flex items-center border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">SkillPath</span>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-col items-center justify-center px-4 pt-20 pb-16">
        <div className="max-w-2xl w-full text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            AI-Powered Learning Roadmaps
          </div>

          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
            Learn Anything.<br />
            <span className="text-blue-700">Actually Finish It.</span>
          </h1>

          <p className="text-lg text-gray-500 mb-10 leading-relaxed">
            Enter a skill and get your personal step-by-step roadmap built from
            the internet's best resources.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 text-left">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              What do you want to learn?
            </label>
            <input
              type="text"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="e.g. Machine Learning, Guitar, Web Development..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition mb-4 text-base"
            />

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white transition text-base"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Daily Time</label>
                <select
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white transition text-base"
                >
                  <option value="0.5">30 mins / day</option>
                  <option value="1">1 hour / day</option>
                  <option value="2">2+ hours / day</option>
                </select>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-semibold py-3.5 px-6 rounded-xl text-base transition-colors duration-150 flex items-center justify-center gap-2"
            >
              Build My Roadmap
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </form>

          {/* Skill Chips */}
          <div className="mt-6">
            <p className="text-sm text-gray-400 mb-3">Try one of these:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SKILL_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setSkill(chip)}
                  className="px-4 py-1.5 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-150 font-medium"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            {/* Spinner */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-700 border-t-transparent animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900 mb-1">
                {LOADING_MESSAGES[msgIndex]}
              </p>
              <p className="text-sm text-gray-400">This usually takes 10–20 seconds</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
