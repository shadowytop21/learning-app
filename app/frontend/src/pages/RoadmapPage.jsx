import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoadmap, getProgress, saveProgress } from "../api";

const USER_ID = "user-123";

const TYPE_COLORS = {
  Video:   { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200"   },
  Article: { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"  },
  Course:  { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200"},
  Book:    { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
};

const TYPE_ICONS = {
  Video:   "▶",
  Article: "📄",
  Course:  "🎓",
  Book:    "📖",
};

function TypeBadge({ type }) {
  const colors = TYPE_COLORS[type] || TYPE_COLORS.Article;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
      <span>{TYPE_ICONS[type] || "📄"}</span>
      {type}
    </span>
  );
}

function ResourceCard({ resource, completed, onToggle, saving }) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ${
      completed
        ? "bg-green-50 border-green-200 opacity-75"
        : "bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm"
    }`}>
      {/* Checkbox */}
      <button
        onClick={() => onToggle(resource.url, !completed)}
        disabled={saving}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
          completed
            ? "bg-green-500 border-green-500"
            : "border-gray-300 hover:border-green-400"
        } ${saving ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
      >
        {completed && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2 6 5 9 10 3" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className={`font-semibold text-sm ${completed ? "line-through text-gray-400" : "text-gray-900"}`}>
            {resource.title}
          </p>
          <TypeBadge type={resource.type} />
          <span className="text-xs text-gray-400">
            ⏱ {resource.duration_minutes} min
          </span>
        </div>
        <p className="text-xs text-gray-400 italic mb-2">{resource.why}</p>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-900 hover:underline transition-colors"
        >
          Open Resource
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </div>
  );
}

function StageCard({ stage, completedUrls, onToggle, savingUrl }) {
  const allResources = stage.resources || [];
  const completedCount = allResources.filter(r => completedUrls.has(r.url)).length;
  const isStageComplete = allResources.length > 0 && completedCount === allResources.length;

  return (
    <div className="relative pl-10">
      {/* Timeline dot */}
      <div className={`absolute left-0 top-6 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm border-2 ${
        isStageComplete
          ? "bg-green-500 border-green-400 text-white"
          : "bg-blue-700 border-blue-600 text-white"
      }`}>
        {isStageComplete ? "✓" : stage.stage_number}
      </div>

      {/* Card */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start justify-between mb-1 flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-gray-900">{stage.title}</h3>
            <span className="text-xs text-gray-400 font-medium">{stage.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            {isStageComplete && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                ✓ Completed
              </span>
            )}
            <span className="text-xs text-gray-400">
              {completedCount}/{allResources.length} done
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4 leading-relaxed">{stage.goal}</p>

        <div className="flex flex-col gap-3">
          {allResources.map((resource, idx) => (
            <ResourceCard
              key={idx}
              resource={resource}
              completed={completedUrls.has(resource.url)}
              onToggle={onToggle}
              saving={savingUrl === resource.url}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState(null);
  const [roadmapMeta, setRoadmapMeta] = useState(null);
  const [completedUrls, setCompletedUrls] = useState(new Set());
  const [loadingPage, setLoadingPage] = useState(true);
  const [savingUrl, setSavingUrl] = useState(null);
  const [error, setError] = useState("");

  // Fetch roadmap + progress on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [meta, progressRecords] = await Promise.all([
          getRoadmap(id),
          getProgress(USER_ID, id),
        ]);
        setRoadmapMeta(meta);
        setRoadmap(meta.roadmap_json);
        const done = new Set(
          progressRecords.filter(p => p.completed).map(p => p.resource_url)
        );
        setCompletedUrls(done);
      } catch (err) {
        setError(err.message || "Failed to load roadmap.");
      } finally {
        setLoadingPage(false);
      }
    };
    load();
  }, [id]);

  // Toggle a resource completion
  const handleToggle = useCallback(async (resourceUrl, completed) => {
    setSavingUrl(resourceUrl);
    // Optimistic update
    setCompletedUrls(prev => {
      const next = new Set(prev);
      completed ? next.add(resourceUrl) : next.delete(resourceUrl);
      return next;
    });
    try {
      await saveProgress({
        user_id: USER_ID,
        roadmap_id: id,
        resource_url: resourceUrl,
        completed,
      });
    } catch {
      // Rollback on failure
      setCompletedUrls(prev => {
        const next = new Set(prev);
        completed ? next.delete(resourceUrl) : next.add(resourceUrl);
        return next;
      });
    } finally {
      setSavingUrl(null);
    }
  }, [id]);

  // Compute overall progress
  const allResources = roadmap
    ? roadmap.stages.flatMap(s => s.resources || [])
    : [];
  const totalCount = allResources.length;
  const completedCount = allResources.filter(r => completedUrls.has(r.url)).length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loadingPage) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-700 animate-spin"></div>
          <p className="text-gray-500 text-sm">Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-800 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-700 font-medium transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                New Skill
              </button>
              <span className="text-gray-200">|</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-700 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <span className="font-bold text-gray-900 text-sm">SkillPath</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-0.5">Overall Progress</p>
              <p className="text-sm font-bold text-gray-900">{completedCount}/{totalCount} resources · {progressPct}%</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-blue-700 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Roadmap Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            {roadmap?.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              📅 {roadmap?.total_weeks} weeks
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
              🎯 {roadmapMeta?.level}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
              ⏱ {roadmapMeta?.hours_per_day}h/day
            </span>
          </div>
          <p className="text-gray-500 leading-relaxed">{roadmap?.description}</p>
        </div>

        {/* Timeline */}
        <div className="relative flex flex-col gap-8">
          {/* Vertical line */}
          <div className="absolute left-3.5 top-8 bottom-8 w-0.5 bg-gray-200 -z-0"></div>

          {roadmap?.stages?.map((stage) => (
            <StageCard
              key={stage.stage_number}
              stage={stage}
              completedUrls={completedUrls}
              onToggle={handleToggle}
              savingUrl={savingUrl}
            />
          ))}
        </div>

        {/* Completion Banner */}
        {progressPct === 100 && (
          <div className="mt-10 bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-xl font-bold text-green-800 mb-1">Roadmap Complete!</h3>
            <p className="text-green-700 text-sm">You've finished every resource. Time to build something amazing.</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              Start a New Skill →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
