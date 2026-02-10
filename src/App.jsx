import React, { useState, useEffect } from 'react';
import { Upload, Bike, Share2, Info, History, Trash2, ChevronRight, BarChart2, Layout, ArrowLeft, Zap, CheckSquare, Square, CheckSquare2, Heart } from 'lucide-react';
import { parseFitFile } from './utils/fitParser';
import { saveActivity, getActivities, deleteActivity } from './utils/db';
import MetricDashboard from './components/MetricDashboard';
import SyncCharts from './components/SyncCharts';
import ComparisonDashboard from './components/ComparisonDashboard';
import ActivityCard from './components/ActivityCard';
import ConfirmationModal from './components/ConfirmationModal';

function App() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [showHistory, setShowHistory] = useState(false);
  const [view, setView] = useState('gallery'); // 'gallery', 'single', or 'trends'
  const [ftp, setFtp] = useState(() => {
    return Number(localStorage.getItem('user_ftp')) || 250;
  });
  const [age, setAge] = useState(() => {
    return Number(localStorage.getItem('user_age')) || 30;
  });

  const [restingHr, setRestingHr] = useState(() => {
    return Number(localStorage.getItem('user_resting_hr')) || 60;
  });
  const [hrMethod, setHrMethod] = useState(() => {
    return localStorage.getItem('user_hr_method') || 'standard'; // 'standard' or 'karvonen'
  });
  const [showZoneInfo, setShowZoneInfo] = useState(false);

  // Calculate maxHr based on age
  const maxHr = 220 - age;

  const calculateZoneLimits = (percentage) => {
    if (hrMethod === 'karvonen') {
      return Math.round(((maxHr - restingHr) * percentage) + restingHr);
    }
    return Math.round(maxHr * percentage);
  };

  const currentZones = [
    { name: 'Zone 1', range: `${hrMethod === 'karvonen' ? restingHr : Math.round(maxHr * 0.5)} - ${calculateZoneLimits(0.60)}`, desc: 'Very Light', benefit: 'Recovery & Warm-up' },
    { name: 'Zone 2', range: `${calculateZoneLimits(0.60) + 1} - ${calculateZoneLimits(0.70)}`, desc: 'Light', benefit: 'Endurance & Fat Burn' },
    { name: 'Zone 3', range: `${calculateZoneLimits(0.70) + 1} - ${calculateZoneLimits(0.80)}`, desc: 'Moderate', benefit: 'Aerobic Fitness' },
    { name: 'Zone 4', range: `${calculateZoneLimits(0.80) + 1} - ${calculateZoneLimits(0.90)}`, desc: 'Hard', benefit: 'Anaerobic Capacity' },
    { name: 'Zone 5', range: `${calculateZoneLimits(0.90) + 1} - ${maxHr}`, desc: 'Maximum', benefit: 'Max Power & Speed' },
  ];

  // Update localStorage whenever age changes (though not strictly necessary as we derive maxHr on the fly, 
  // but good to keep consistency if other components read it)
  useEffect(() => {
    localStorage.setItem('user_age', age);
    localStorage.setItem('user_max_hr', maxHr);
    localStorage.setItem('user_resting_hr', restingHr);
    localStorage.setItem('user_hr_method', hrMethod);
  }, [age, maxHr, restingHr, hrMethod]);

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, activityIds: [] });
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const activities = await getActivities();
      setHistory(activities);
      if (activities.length > 0) {
        if (!data && view === 'single') {
          setData(activities[0]);
        }
      } else {
        setView('gallery');
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    let successCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;
    let lastResult = null;

    try {
      for (const file of files) {
        try {
          const result = await parseFitFile(file, ftp);
          await saveActivity(result);
          successCount++;
          lastResult = result;
        } catch (err) {
          if (err.message === 'DUPLICATE_ACTIVITY') {
            duplicateCount++;
          } else {
            console.error(`Failed to parse ${file.name}:`, err);
            errorCount++;
          }
        }
      }

      await loadHistory();

      if (successCount > 0) {
        if (files.length === 1) {
          setData(lastResult);
          setView('single');
        } else {
          // Stay in gallery to show all new activities
          setView('gallery');
          setData(null);
        }
      }

      // Construct feedback messages
      if (successCount > 0) {
        let msg = `Successfully added ${successCount} activity${successCount > 1 ? 'ies' : ''}.`;
        if (duplicateCount > 0) msg += ` ${duplicateCount} duplicates were skipped.`;
        setSuccess(msg);
      }

      if (errorCount > 0) {
        setError(`Failed to process ${errorCount} file${errorCount > 1 ? 's' : ''}. Make sure they are valid FIT files.`);
      } else if (duplicateCount > 0 && successCount === 0) {
        setError(`All ${duplicateCount} files were already in your history.`);
      }

    } catch (err) {

      console.error(err);
      setError('An unexpected error occurred during upload.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = (id, e) => {
    if (e) e.stopPropagation();
    setConfirmModal({ isOpen: true, activityIds: [id] });
  };

  const handleBatchDeleteRequest = () => {
    if (selectedIds.length === 0) return;
    setConfirmModal({ isOpen: true, activityIds: [...selectedIds] });
  };

  const handleConfirmDelete = async () => {
    const ids = confirmModal.activityIds;
    if (ids && ids.length > 0) {
      for (const id of ids) {
        await deleteActivity(id);
      }
      await loadHistory();

      // If the currently viewed activity was deleted, go back to gallery
      if (data && ids.includes(data.id)) {
        setData(null);
        setView('gallery');
      }

      // Cleanup selection
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
      if (selectedIds.length === ids.length) {
        setIsSelectMode(false);
      }
    }
  };

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedIds([]);
  };

  const handleSelectItem = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === history.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(history.map(a => a.id));
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="border-b border-white/5 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-3 font-brand cursor-pointer"
            onClick={() => {
              setData(null);
              setView('gallery');
            }}
          >
            <div className="bg-accent p-2 rounded-lg">
              <Bike className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter">FIT DATA<span className="text-accent underline decoration-2 underline-offset-4 ml-1">ANALYTICS</span></h1>
          </div>

          <div className="flex items-center gap-4">
            {/* View Switcher */}
            {history.length > 0 && (
              <div className="flex bg-white/5 p-1 rounded-full border border-white/5">
                <button
                  onClick={() => setView('gallery')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${view === 'gallery' ? 'bg-white/10 text-white shadow-xl' : 'text-white/30 hover:text-white/60'}`}
                >
                  <Layout className="w-3.5 h-3.5" />
                  Gallery
                </button>
                <button
                  onClick={() => setView('trends')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${view === 'trends' ? 'bg-accent text-black shadow-xl' : 'text-white/30 hover:text-white/60'}`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  Trends
                </button>
              </div>
            )}

            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 transition-colors flex items-center gap-2 px-4 py-2 rounded-full border ${showHistory ? 'bg-accent/20 border-accent/40 text-accent' : 'bg-white/5 border-white/5 text-white/40 hover:text-white'}`}
            >
              <History className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">History</span>
            </button>

            {/* FTP Settings */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
              <Zap className="w-4 h-4 text-warning" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-white/20 uppercase leading-none mb-0.5">Your FTP</span>
                <input
                  type="number"
                  value={ftp}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFtp(val);
                    localStorage.setItem('user_ftp', val);
                  }}
                  className="bg-transparent border-none text-xs font-bold text-white w-12 p-0 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <span className="text-[10px] font-bold text-white/20">W</span>
            </div>

            {/* Age Settings & Max HR Display */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
              <Heart className="w-4 h-4 text-danger" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-white/20 uppercase leading-none mb-0.5">Age</span>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > 0 && val < 120) {
                      setAge(val);
                    }
                  }}
                  className="bg-transparent border-none text-xs font-bold text-white w-8 p-0 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="h-6 w-px bg-white/10 mx-1"></div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-white/20 uppercase leading-none mb-0.5">Max HR</span>
                <span className="text-xs font-bold text-white/60">{maxHr} <span className="text-[8px] text-white/20">bpm</span></span>
              </div>
            </div>

            {/* HR Method Toggle & Resting HR */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
              <button
                onClick={() => setHrMethod(prev => prev === 'standard' ? 'karvonen' : 'standard')}
                className="flex flex-col items-start text-left group"
              >
                <span className="text-[8px] font-black text-white/20 uppercase leading-none mb-0.5 group-hover:text-accent transition-colors">Method</span>
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">{hrMethod === 'standard' ? 'Max HR' : 'Karvonen'}</span>
              </button>

              {hrMethod === 'karvonen' && (
                <>
                  <div className="h-6 w-px bg-white/10 mx-1"></div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-white/20 uppercase leading-none mb-0.5">Rest HR</span>
                    <input
                      type="number"
                      value={restingHr}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val > 0 && val < maxHr) {
                          setRestingHr(val);
                        }
                      }}
                      className="bg-transparent border-none text-xs font-bold text-white w-8 p-0 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </>
              )}
            </div>
            {/* Zone Info Button */}
            <div className="relative">
              <button
                onClick={() => setShowZoneInfo(!showZoneInfo)}
                className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all ${showZoneInfo ? 'bg-accent text-black border-accent' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
              >
                <Info className="w-5 h-5" />
              </button>

              {showZoneInfo && (
                <div className="absolute top-full right-0 mt-4 w-64 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Zone Ranges</h3>
                    <span className="text-[10px] font-bold text-white/40 uppercase">{hrMethod === 'karvonen' ? 'Karvonen' : 'Standard'}</span>
                  </div>
                  <div className="space-y-4">
                    {currentZones.map((zone) => (
                      <div key={zone.name} className="flex flex-col gap-1 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex flex-col">
                            <span className="font-bold text-white/60">{zone.name}</span>
                            <span className="text-[10px] text-white/20 uppercase">{zone.desc}</span>
                          </div>
                          <span className="font-bold text-white font-mono">{zone.range} <span className="text-[8px] text-white/20 font-sans">bpm</span></span>
                        </div>
                        <span className="text-[10px] text-accent/60 italic leading-tight">{zone.benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 relative">
        {/* History Sidebar/Overlay */}
        {showHistory && (
          <div className="fixed inset-y-0 right-0 w-80 bg-background/95 backdrop-blur-2xl border-l border-white/5 z-[60] shadow-2xl p-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col">
                <h2 className="text-xl font-black tracking-tight">ACTIVITY <span className="text-white/20">HISTORY</span></h2>
                {history.length > 0 && (
                  <button
                    onClick={toggleSelectMode}
                    className={`text-[10px] font-black uppercase tracking-widest text-left mt-1 transition-colors ${isSelectMode ? 'text-accent' : 'text-white/20 hover:text-white'}`}
                  >
                    {isSelectMode ? 'Cancel Selection' : 'Select Multiple'}
                  </button>
                )}
              </div>
              <button onClick={() => setShowHistory(false)} className="text-white/20 hover:text-white">✕</button>
            </div>

            {isSelectMode && history.length > 0 && (
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                >
                  {selectedIds.length === history.length ? <CheckSquare2 className="w-4 h-4 text-accent" /> : <Square className="w-4 h-4" />}
                  {selectedIds.length === history.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-[10px] font-black text-accent">{selectedIds.length} Selected</span>
              </div>
            )}

            <div className={`space-y-4 overflow-y-auto pr-2 history-scroll ${isSelectMode ? 'max-h-[calc(100vh-320px)]' : 'max-h-[calc(100vh-210px)]'}`}>
              {history.length === 0 ? (
                <p className="text-white/20 text-center py-12 text-sm font-medium">No saved activities yet.</p>
              ) : (
                history.map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() => {
                      if (isSelectMode) {
                        handleSelectItem(activity.id);
                      } else {
                        setData(activity);
                        setView('single');
                        setShowHistory(false);
                      }
                    }}
                    className={`group relative glass-card p-4 transition-all cursor-pointer hover:border-accent/40 ${data?.id === activity.id ? 'border-accent/60 bg-accent/5' : ''} ${isSelectMode && selectedIds.includes(activity.id) ? 'border-accent/40 bg-accent/5' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {isSelectMode && (
                          <div onClick={(e) => handleSelectItem(activity.id, e)}>
                            {selectedIds.includes(activity.id) ? (
                              <CheckSquare className="w-4 h-4 text-accent animate-in zoom-in duration-200" />
                            ) : (
                              <Square className="w-4 h-4 text-white/20 group-hover:text-white/40" />
                            )}
                          </div>
                        )}
                        <p className="text-xs font-black text-white/40 uppercase tracking-widest">
                          {new Date(activity.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      {!isSelectMode && (
                        <button
                          onClick={(e) => handleDeleteRequest(activity.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-danger transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-lg font-bold">{(activity.summary.distance).toFixed(1)} km</p>
                        <p className="text-[10px] font-bold text-white/20 uppercase">{(activity.summary.duration / 60).toFixed(0)} min</p>
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-transform ${data?.id === activity.id ? 'text-accent translate-x-1' : 'text-white/10 group-hover:text-white group-hover:translate-x-1'}`} />
                    </div>
                  </div>
                ))
              )}
            </div>

            {isSelectMode ? (
              <button
                onClick={handleBatchDeleteRequest}
                disabled={selectedIds.length === 0}
                className="mt-8 flex items-center justify-center gap-2 w-full bg-danger hover:bg-danger/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all p-4 rounded-xl font-bold text-sm text-white"
              >
                <Trash2 className="w-4 h-4" />
                DELETE SELECTED ({selectedIds.length})
              </button>
            ) : (
              <label className="mt-8 flex items-center justify-center gap-2 w-full bg-accent hover:bg-accent/80 transition-colors p-4 rounded-xl font-bold text-sm cursor-pointer text-black text-center">
                <Upload className="w-4 h-4" />
                UPLOAD NEW FILE
                <input type="file" className="hidden" accept=".fit" onChange={handleFileUpload} multiple />
              </label>
            )}

          </div>
        )}

        {view === 'gallery' && !loading && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <h2 className="text-5xl font-black tracking-tight leading-tight">Your Activity <span className="text-white/20">Dashboard.</span></h2>
                <p className="text-white/40 text-lg max-w-xl leading-relaxed">Select an activity to view deep telemetry analysis and performance metrics.</p>
              </div>
              <label className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors px-6 py-4 rounded-xl font-bold text-sm cursor-pointer border border-white/5">
                <Upload className="w-4 h-4 text-accent" />
                UPLOAD NEW FILE
                <input type="file" className="hidden" accept=".fit" onChange={handleFileUpload} multiple />
              </label>
            </div>

            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <Upload className="w-12 h-12 text-white/10 mb-4" />
                <p className="text-white/20 font-bold uppercase tracking-widest text-xs">No telemetry data found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onClick={() => {
                      setData(activity);
                      setView('single');
                    }}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 text-white/20 text-xs font-bold uppercase tracking-[0.2em] justify-center pt-8">
              <Info className="w-4 h-4" />
              <span>Institutional-grade data processing for stationary bike telemetry</span>
            </div>
          </div>
        )}

        {loading && (
          <div className="py-40 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/40 font-bold uppercase tracking-widest text-xs animate-pulse">Processing Telemetry...</p>
          </div>
        )}

        {error && (
          <div className="bg-danger/10 border border-danger/20 p-6 rounded-xl text-danger text-center max-w-xl mx-auto shadow-2xl relative group mb-8">
            <button onClick={() => setError(null)} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] font-black uppercase">Dismiss</button>
            <p className="font-bold mb-1 tracking-tight">System Notice</p>
            <p className="text-xs opacity-80">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-accent/10 border border-accent/20 p-6 rounded-xl text-accent text-center max-w-xl mx-auto shadow-2xl relative group mb-8">
            <button onClick={() => setSuccess(null)} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] font-black uppercase">Dismiss</button>
            <p className="font-bold mb-1 tracking-tight">Upload Success</p>
            <p className="text-xs opacity-80">{success}</p>
          </div>
        )}

        {data && view === 'single' && !loading && (
          <div className="animate-in fade-in duration-1000 space-y-8">
            <button
              onClick={() => {
                setData(null);
                setView('gallery');
              }}
              className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Back to Gallery</span>
            </button>
            <MetricDashboard summary={data.summary} powerZones={data.powerZones} />
            <SyncCharts data={data.records} ftp={ftp} maxHr={maxHr} restingHr={restingHr} hrMethod={hrMethod} />
          </div>
        )}

        {view === 'trends' && history.length > 0 && !loading && (
          <ComparisonDashboard history={history} />
        )}

        {/* Global Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          onConfirm={handleConfirmDelete}
          title={confirmModal.activityIds.length > 1 ? "Delete Multiple Activities" : "Delete Activity"}
          message={confirmModal.activityIds.length > 1
            ? `Are you sure you want to delete ${confirmModal.activityIds.length} activities? This action cannot be undone.`
            : "This action cannot be undone. All telemetry data for this activity will be permanently removed."}
          confirmText={confirmModal.activityIds.length > 1 ? `Delete ${confirmModal.activityIds.length} Activities` : "Delete Activity"}
          type="danger"
        />
      </main>
    </div>
  );
}

export default App;
