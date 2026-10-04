import React, { useEffect, useState, useMemo } from 'react';
import { useCommuniq } from '../hooks/useCommuniq';
import {
  db,
  ActivityRecord,
  ConversationThread,
  getConversationThreads,
  deleteConversationThread,
  toggleFavoriteLog,
  deleteLog,
  clearAllUserData
} from '../services/db';
import { syncLocalLogsWithBackend, SyncStatus } from '../services/sync';
import { Button } from '../components/Button';
import {
  Calendar,
  Star,
  Trash2,
  RotateCcw,
  Download,
  Printer,
  RefreshCw,
  AlertTriangle,
  User,
  Users,
  CheckCircle,
  BarChart3,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Search,
  Timer,
  CalendarDays
} from 'lucide-react';

const getTodayAndYesterdayKeys = () => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  return { today, yesterday };
};

const getPast7DayKeys = (todayStr: string) => {
  const parts = todayStr.split('-').map(Number);
  const base = new Date(parts[0], parts[1] - 1, parts[2]);
  const days: { dateKey: string; dayName: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(base.getTime() - i * 86400000);
    const dateKey = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    days.push({ dateKey, dayName });
  }
  return days;
};

export const MyDayPage: React.FC = () => {
  const { speak, t } = useCommuniq();
  const [logs, setLogs] = useState<ActivityRecord[]>([]);
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [expandedThreadIds, setExpandedThreadIds] = useState<Set<string>>(new Set());
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [filterFavorite, setFilterFavorite] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [isTestSessionActive, setIsTestSessionActive] = useState<boolean>(false);
  const [testSessionSeconds, setTestSessionSeconds] = useState<number>(0);
  const [testSessionStartCount, setTestSessionStartCount] = useState<number>(0);
  const [testSessionSummary, setTestSessionSummary] = useState<{
    duration: string;
    utterances: number;
    ratePerMin: string;
  } | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTestSessionActive) {
      interval = setInterval(() => {
        setTestSessionSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTestSessionActive]);

  const handleStartTestSession = () => {
    setIsTestSessionActive(true);
    setTestSessionSeconds(0);
    setTestSessionStartCount(logs.length);
    setTestSessionSummary(null);
  };

  const handleEndTestSession = () => {
    setIsTestSessionActive(false);
    const minutes = Math.floor(testSessionSeconds / 60);
    const seconds = testSessionSeconds % 60;
    const durationStr = `${minutes}m ${seconds}s`;
    const sessionUtterances = Math.max(0, logs.length - testSessionStartCount);
    const rate = testSessionSeconds > 0 ? ((sessionUtterances / testSessionSeconds) * 60).toFixed(1) : '0';

    setTestSessionSummary({
      duration: durationStr,
      utterances: sessionUtterances,
      ratePerMin: rate
    });
  };

  const fetchData = async () => {
    const allLogs = await db.activityLogs.orderBy('timestamp').reverse().toArray();
    setLogs(allLogs);
    const allThreads = await getConversationThreads();
    setThreads(allThreads);
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      db.activityLogs.orderBy('timestamp').reverse().toArray(),
      getConversationThreads()
    ]).then(([allLogs, allThreads]) => {
      if (isMounted) {
        setLogs(allLogs);
        setThreads(allThreads);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleFavorite = async (id?: number) => {
    if (!id) return;
    await toggleFavoriteLog(id);
    await fetchData();
  };

  const handleDeleteEntry = async (id?: number) => {
    if (!id) return;
    await deleteLog(id);
    await fetchData();
  };

  const handleDeleteThread = async (id: string) => {
    await deleteConversationThread(id);
    await fetchData();
  };

  const handleToggleExpandThread = (id: string) => {
    setExpandedThreadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleClearAll = async () => {
    await clearAllUserData();
    setShowDeleteModal(false);
    await fetchData();
  };

  const handleSync = async () => {
    setIsSyncing(true);
    const result = await syncLocalLogsWithBackend();
    setSyncStatus(result);
    setIsSyncing(false);
    await fetchData();
  };

  const handleExportJson = () => {
    const exportPayload = {
      phrases: logs,
      conversations: threads,
      exportedAt: new Date().toISOString()
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `communiq_activity_log_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter and group logs
  const { todayLogs, yesterdayLogs, earlierLogs } = useMemo(() => {
    const { today: todayStr, yesterday: yStr } = getTodayAndYesterdayKeys();

    let filtered = logs;
    if (filterFavorite) {
      filtered = filtered.filter((l) => l.isFavorite);
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((l) => l.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((l) => l.phrase.toLowerCase().includes(q));
    }

    const today: ActivityRecord[] = [];
    const yesterday: ActivityRecord[] = [];
    const earlier: ActivityRecord[] = [];

    for (const item of filtered) {
      if (item.dateKey === todayStr) {
        today.push(item);
      } else if (item.dateKey === yStr) {
        yesterday.push(item);
      } else {
        earlier.push(item);
      }
    }

    return {
      todayLogs: today,
      yesterdayLogs: yesterday,
      earlierLogs: earlier
    };
  }, [logs, filterFavorite, categoryFilter, searchQuery]);

  const weeklyBreakdown = useMemo(() => {
    const { today: todayStr } = getTodayAndYesterdayKeys();
    const days = getPast7DayKeys(todayStr);
    return days.map(({ dateKey, dayName }) => {
      const dayLogs = logs.filter((l) => l.dateKey === dateKey);
      return { dateKey, dayName, count: dayLogs.length, logs: dayLogs };
    });
  }, [logs]);

  // Plain Daily Summary calculation for parent/teacher (pure count, no AI)
  const summaryStats = useMemo(() => {
    const phraseCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const distinctWordsSet = new Set<string>();

    for (const log of todayLogs) {
      phraseCounts[log.phrase] = (phraseCounts[log.phrase] || 0) + 1;
      categoryCounts[log.category] = (categoryCounts[log.category] || 0) + 1;

      const words = log.phrase.toLowerCase().split(/\s+/).filter(Boolean);
      for (const w of words) {
        distinctWordsSet.add(w.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ''));
      }
    }

    const topPhrases = Object.entries(phraseCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([phrase, count]) => ({ phrase, count }));

    return {
      totalToday: todayLogs.length,
      distinctWordsCount: distinctWordsSet.size,
      totalConversations: threads.length,
      topPhrases
    };
  }, [todayLogs, threads]);

  const renderTimelineItem = (record: ActivityRecord) => {
    const isUser = record.speaker === 'user';
    const timeFormatted = new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <div
        key={record.id}
        className="bg-white border-2 border-[#E5DACF] rounded-[14px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors hover:border-[#0A6C6E]"
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 border ${
              isUser ? 'bg-[#E2F3F3] text-[#085557] border-[#0A6C6E]' : 'bg-[#FFF8EF] text-[#5E564D] border-[#E5DACF]'
            }`}
          >
            {isUser ? <User className="w-5 h-5" /> : <Users className="w-5 h-5" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold text-[#5E564D]">{timeFormatted}</span>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[6px] bg-[#FFF8EF] border border-[#E5DACF] text-[#5E564D]">
                {record.category}
              </span>
              {record.speaker === 'partner' && (
                <span className="text-[11px] font-bold text-[#5E564D]">Partner</span>
              )}
            </div>
            <p className="text-lg font-bold text-[#1F1B16] leading-snug break-words">
              "{record.phrase}"
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {/* One tap reuse */}
          <button
            type="button"
            onClick={() => speak(record.phrase, { category: record.category })}
            title={t.speakAgain}
            aria-label={`${t.speakAgain}: ${record.phrase}`}
            className="w-10 h-10 rounded-[10px] bg-[#E2F3F3] border border-[#0A6C6E] flex items-center justify-center text-[#085557] hover:bg-[#0A6C6E] hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Favorite toggle */}
          <button
            type="button"
            onClick={() => handleToggleFavorite(record.id)}
            title={t.favorite}
            aria-label={record.isFavorite ? 'Remove favorite' : 'Add favorite'}
            className="w-10 h-10 rounded-[10px] bg-white border border-[#E5DACF] flex items-center justify-center text-[#FFB703] hover:bg-[#FFF4D6] transition-colors"
          >
            <Star className={`w-4 h-4 ${record.isFavorite ? 'fill-[#FFB703]' : ''}`} />
          </button>

          {/* Delete entry */}
          <button
            type="button"
            onClick={() => handleDeleteEntry(record.id)}
            title={t.delete}
            aria-label={`Delete record ${record.phrase}`}
            className="w-10 h-10 rounded-[10px] bg-white border border-[#E5DACF] flex items-center justify-center text-[#D62828] hover:bg-[#FEE2E2] transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-24 print:pb-0">
      {/* Top Header */}
      <div className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1F1B16]">{t.myDayTitle}</h2>
          <p className="text-sm font-semibold text-[#085557] mt-0.5">
            {t.myDayDesc}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Button
            variant={viewMode === 'weekly' ? 'primary' : 'secondary'}
            size="normal"
            onClick={() => setViewMode(viewMode === 'weekly' ? 'daily' : 'weekly')}
            icon={<CalendarDays className="w-4 h-4" />}
          >
            {viewMode === 'weekly' ? 'Daily View' : 'Weekly View'}
          </Button>

          <Button
            variant={isTestSessionActive ? 'emergency' : 'secondary'}
            size="normal"
            onClick={isTestSessionActive ? handleEndTestSession : handleStartTestSession}
            icon={<Timer className={`w-4 h-4 ${isTestSessionActive ? 'animate-pulse text-white' : 'text-[#0A6C6E]'}`} />}
          >
            {isTestSessionActive
              ? `End Test (${Math.floor(testSessionSeconds / 60)}:${(testSessionSeconds % 60).toString().padStart(2, '0')})`
              : 'Test Session'}
          </Button>

          <Button
            variant="secondary"
            size="normal"
            onClick={() => setFilterFavorite(!filterFavorite)}
            icon={<Star className={`w-4 h-4 ${filterFavorite ? 'fill-[#FFB703] text-[#FFB703]' : 'text-[#5E564D]'}`} />}
          >
            {filterFavorite ? 'All Phrases' : 'Favorites'}
          </Button>

          <Button
            variant="secondary"
            size="normal"
            onClick={handleExportJson}
            icon={<Download className="w-4 h-4 text-[#0A6C6E]" />}
          >
            {t.exportJson}
          </Button>

          <Button
            variant="secondary"
            size="normal"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4 text-[#5E564D]" />}
          >
            {t.printView}
          </Button>

          <Button
            variant="primary"
            size="normal"
            onClick={handleSync}
            disabled={isSyncing}
            icon={<RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />}
          >
            {isSyncing ? 'Syncing...' : 'Sync Cloud'}
          </Button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatus && (
        <div
          className={`rounded-[12px] border-2 p-3.5 flex items-center justify-between text-sm font-bold ${
            syncStatus.backendConnected
              ? 'bg-[#EBF7EF] border-[#1B7A42] text-[#1E4620]'
              : 'bg-[#FFF4D6] border-[#FFB703] text-[#7A5400]'
          }`}
        >
          <div className="flex items-center gap-2">
            {syncStatus.backendConnected ? (
              <CheckCircle className="w-5 h-5 text-[#1B7A42]" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-[#FFB703]" />
            )}
            <span>{syncStatus.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncStatus(null)}
            className="text-xs underline ml-2 cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      )}

      {/* Active Test Session Sticky Banner */}
      {isTestSessionActive && (
        <div className="bg-[#E2F3F3] border-2 border-[#0A6C6E] rounded-[14px] p-4 flex items-center justify-between shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <Timer className="w-6 h-6 text-[#0A6C6E]" />
            <div>
              <span className="font-extrabold text-sm text-[#085557] uppercase tracking-wider block">
                Active AAC Evaluation / Test Session
              </span>
              <p className="text-xs font-semibold text-[#1F1B16] mt-0.5">
                Elapsed: {Math.floor(testSessionSeconds / 60)}m {(testSessionSeconds % 60).toString().padStart(2, '0')}s | Utterances recorded: {Math.max(0, logs.length - testSessionStartCount)}
              </p>
            </div>
          </div>
          <Button variant="emergency" size="normal" onClick={handleEndTestSession}>
            Finish Test Session
          </Button>
        </div>
      )}

      {/* Completed Test Session Summary Modal/Card */}
      {testSessionSummary && (
        <div className="bg-[#FFF4D6] border-2 border-[#FFB703] rounded-[16px] p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#FFB703] pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#7A5400]" />
              <h3 className="font-black text-lg text-[#1F1B16]">Test Session Evaluation Report</h3>
            </div>
            <button
              type="button"
              onClick={() => setTestSessionSummary(null)}
              className="text-xs font-bold text-[#7A5400] hover:underline"
            >
              Dismiss
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white border border-[#E5DACF] rounded-[10px] p-3">
              <span className="text-xs font-bold text-[#5E564D] uppercase block">Duration</span>
              <span className="text-xl font-black text-[#1F1B16]">{testSessionSummary.duration}</span>
            </div>
            <div className="bg-white border border-[#E5DACF] rounded-[10px] p-3">
              <span className="text-xs font-bold text-[#5E564D] uppercase block">Utterances</span>
              <span className="text-xl font-black text-[#0A6C6E]">{testSessionSummary.utterances}</span>
            </div>
            <div className="bg-white border border-[#E5DACF] rounded-[10px] p-3">
              <span className="text-xs font-bold text-[#5E564D] uppercase block">Rate / Min</span>
              <span className="text-xl font-black text-[#FFB703]">{testSessionSummary.ratePerMin}</span>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar & Category Filter Bar */}
      <div className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-4 space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E564D]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search spoken phrases or conversation logs..."
            className="w-full pl-11 pr-4 py-2.5 bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[12px] font-bold text-sm text-[#1F1B16] focus:border-[#0A6C6E] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#5E564D] hover:text-[#1F1B16]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'food_drink', label: 'Food & Drink' },
            { id: 'personal_needs', label: 'Needs' },
            { id: 'health', label: 'Health' },
            { id: 'emergency', label: 'Emergency' },
            { id: 'feelings', label: 'Feelings' },
            { id: 'practice', label: 'Practice' },
            { id: 'drawing', label: 'Drawing' },
            { id: 'sign', label: 'Sign' }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-[10px] text-xs font-bold border transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-[#0A6C6E] text-white border-[#0A6C6E]'
                  : 'bg-[#FFF8EF] text-[#5E564D] border-[#E5DACF] hover:border-[#0A6C6E]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly View Aggregation */}
      {viewMode === 'weekly' && (
        <section className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5DACF] pb-3">
            <CalendarDays className="w-6 h-6 text-[#0A6C6E]" />
            <h3 className="text-xl font-black text-[#1F1B16]">Past 7 Days Communication Volume</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
            {weeklyBreakdown.map((day) => (
              <div
                key={day.dateKey}
                className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[12px] p-3 text-center"
              >
                <span className="text-xs font-bold text-[#5E564D] block">{day.dayName}</span>
                <span className="text-2xl font-black text-[#0A6C6E] block mt-1">{day.count}</span>
                <span className="text-[11px] text-[#5E564D] font-medium block">utterances</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Plain Daily Summary for Parent or Teacher (No AI needed) */}
      <section
        aria-labelledby="daily-summary-heading"
        className="bg-white border-2 border-[#0A6C6E] rounded-[16px] p-6 shadow-sm print:border-black"
      >
        <div className="flex items-center gap-2.5 mb-4 border-b-2 border-[#E5DACF] pb-3">
          <BarChart3 className="w-6 h-6 text-[#0A6C6E]" />
          <div>
            <h3 id="daily-summary-heading" className="text-xl font-black text-[#1F1B16]">
              {t.dailySummaryTitle}
            </h3>
            <p className="text-xs text-[#5E564D] font-semibold">
              Deterministic statistics generated directly on this device.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[12px] p-4 text-center">
            <span className="block text-xs font-bold uppercase tracking-wider text-[#5E564D]">
              {t.totalPhrasesSpoken}
            </span>
            <span className="block text-4xl font-black text-[#085557] mt-1">
              {summaryStats.totalToday}
            </span>
          </div>

          <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[12px] p-4 text-center">
            <span className="block text-xs font-bold uppercase tracking-wider text-[#5E564D]">
              {t.todaysWords} (Unique)
            </span>
            <span className="block text-4xl font-black text-[#FFB703] mt-1">
              {summaryStats.distinctWordsCount}
            </span>
          </div>

          <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[12px] p-4 text-center">
            <span className="block text-xs font-bold uppercase tracking-wider text-[#5E564D]">
              Conversations
            </span>
            <span className="block text-4xl font-black text-[#0A6C6E] mt-1">
              {summaryStats.totalConversations}
            </span>
          </div>
        </div>

        {summaryStats.topPhrases.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-black uppercase tracking-wider text-[#5E564D]">
              {t.mostUsedPhrases}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {summaryStats.topPhrases.map((tp, idx) => (
                <div
                  key={idx}
                  className="bg-[#FFF8EF] border border-[#E5DACF] rounded-[10px] px-3.5 py-2 flex items-center justify-between text-sm font-bold"
                >
                  <span className="truncate pr-2">"{tp.phrase}"</span>
                  <span className="text-xs font-black text-[#085557] shrink-0 bg-white border border-[#0A6C6E] px-2 py-0.5 rounded-[6px]">
                    {tp.count}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Two-Way Conversation Threads Section */}
      <section
        aria-labelledby="conversation-threads-heading"
        className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 space-y-4 shadow-sm"
      >
        <div className="flex items-center justify-between border-b-2 border-[#E5DACF] pb-3">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-[#0A6C6E]" />
            <div>
              <h3 id="conversation-threads-heading" className="text-xl font-black text-[#1F1B16]">
                Conversation Threads ({threads.length})
              </h3>
              <p className="text-xs text-[#5E564D] font-semibold">
                Saved multi-turn dialogs with conversation partners.
              </p>
            </div>
          </div>
        </div>

        {threads.length === 0 ? (
          <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[14px] p-6 text-center text-[#5E564D] font-bold">
            No conversation threads recorded yet. Start talking in the Talk screen to save dialogues.
          </div>
        ) : (
          <div className="space-y-3">
            {threads.map((thread) => {
              const isExpanded = expandedThreadIds.has(thread.id);
              const formattedDate = new Date(thread.updatedAt).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={thread.id}
                  className="border-2 border-[#E5DACF] rounded-[14px] bg-white transition-colors hover:border-[#0A6C6E]"
                >
                  {/* Thread Summary Card */}
                  <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#5E564D]">{formattedDate}</span>
                        <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-[6px] bg-[#E2F3F3] text-[#085557] border border-[#0A6C6E]">
                          {thread.turns.length} turns
                        </span>
                        <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-[6px] bg-[#FFF8EF] border border-[#E5DACF] text-[#5E564D]">
                          {thread.language.toUpperCase()}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-[6px] bg-[#FFF8EF] border border-[#E5DACF] text-[#5E564D]">
                          {thread.userMode}
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-black text-[#1F1B16] truncate">
                        "{thread.title}"
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleExpandThread(thread.id)}
                        className="px-3 py-1.5 rounded-[8px] bg-[#FFF8EF] border border-[#E5DACF] text-xs font-bold text-[#1F1B16] hover:border-[#0A6C6E] flex items-center gap-1 cursor-pointer"
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? (
                          <>
                            <span>Hide turns</span>
                            <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            <span>View {thread.turns.length} turns</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteThread(thread.id)}
                        title="Delete conversation thread"
                        aria-label={`Delete conversation ${thread.title}`}
                        className="w-9 h-9 rounded-[8px] bg-white border border-[#E5DACF] flex items-center justify-center text-[#D62828] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Turns List */}
                  {isExpanded && (
                    <div className="border-t-2 border-[#E5DACF] bg-[#FFF8EF] p-4 space-y-2.5 rounded-b-[12px]">
                      {thread.turns.map((turn, tIdx) => {
                        const isUser = turn.speaker === 'user';
                        return (
                          <div
                            key={tIdx}
                            className={`p-3 rounded-[10px] border flex items-center justify-between gap-3 ${
                              isUser
                                ? 'bg-[#E2F3F3] border-[#0A6C6E] text-[#1F1B16]'
                                : 'bg-white border-[#E5DACF] text-[#1F1B16]'
                            }`}
                          >
                            <div className="space-y-0.5 flex-1 min-w-0">
                              <span className="text-[10px] font-black uppercase tracking-wider text-[#5E564D] block">
                                {isUser ? 'You' : 'Partner'}
                              </span>
                              <p className="text-sm font-bold break-words">"{turn.text}"</p>
                            </div>

                            <button
                              type="button"
                              onClick={() => speak(turn.text)}
                              title={t.speakAgain}
                              aria-label={`Speak phrase: ${turn.text}`}
                              className="w-8 h-8 rounded-[6px] bg-white border border-[#0A6C6E] text-[#085557] flex items-center justify-center shrink-0 hover:bg-[#0A6C6E] hover:text-white transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Timeline Sections: Today, Yesterday, Earlier */}
      <div className="space-y-6">
        {/* Today */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <Calendar className="w-5 h-5 text-[#0A6C6E]" />
            <h3 className="text-xl font-black text-[#1F1B16]">
              {t.today} ({todayLogs.length})
            </h3>
          </div>
          {todayLogs.length === 0 ? (
            <div className="bg-white border-2 border-[#E5DACF] rounded-[14px] p-6 text-center text-[#5E564D] font-bold">
              {t.emptyLog}
            </div>
          ) : (
            <div className="space-y-2.5">{todayLogs.map(renderTimelineItem)}</div>
          )}
        </div>

        {/* Yesterday */}
        {yesterdayLogs.length > 0 && (
          <div>
            <h3 className="text-xl font-black text-[#1F1B16] mb-3 px-1">
              {t.yesterday} ({yesterdayLogs.length})
            </h3>
            <div className="space-y-2.5">{yesterdayLogs.map(renderTimelineItem)}</div>
          </div>
        )}

        {/* Earlier Days */}
        {earlierLogs.length > 0 && (
          <div>
            <h3 className="text-xl font-black text-[#1F1B16] mb-3 px-1">
              {t.earlierDays} ({earlierLogs.length})
            </h3>
            <div className="space-y-2.5">{earlierLogs.map(renderTimelineItem)}</div>
          </div>
        )}
      </div>

      {/* Delete All Data Danger Section */}
      <div className="bg-[#FEE2E2] border-2 border-[#D62828] rounded-[16px] p-6 mt-10 print:hidden flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-lg font-black text-[#991B1B]">{t.deleteAllData}</h4>
          <p className="text-xs sm:text-sm font-semibold text-[#991B1B] mt-0.5">
            Permanently clear all logged phrases, turns, and preferences from this device.
          </p>
        </div>

        <Button
          variant="emergency"
          size="normal"
          onClick={() => setShowDeleteModal(true)}
          icon={<Trash2 className="w-4 h-4 text-white" />}
        >
          {t.deleteAllData}
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-all-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
        >
          <div className="w-full max-w-md bg-white border-2 border-[#D62828] rounded-[16px] p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-[#D62828] mb-4">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <h3 id="delete-all-title" className="text-xl font-black text-[#1F1B16]">
                {t.deleteAllData}
              </h3>
            </div>

            <p className="text-sm font-semibold text-[#5E564D] mb-6">
              {t.deleteAllDataConfirm}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                size="normal"
                onClick={() => setShowDeleteModal(false)}
              >
                {t.cancel}
              </Button>
              <Button
                variant="emergency"
                size="normal"
                onClick={handleClearAll}
              >
                {t.delete}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
