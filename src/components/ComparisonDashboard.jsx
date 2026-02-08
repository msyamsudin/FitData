import React, { useMemo, useState, useRef } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, AreaChart, Area, ReferenceLine, Label
} from 'recharts';
import { TrendingUp, Activity, Zap, Heart, Calendar, ArrowUpRight, Camera } from 'lucide-react';
import ScreenshotModal from './ScreenshotModal';
import { generateScreenshot, generateFilename, getAspectRatioConfig, AVAILABLE_METRICS } from '../utils/screenshotUtils';

const ComparisonDashboard = ({ history }) => {
    const [showAverages, setShowAverages] = useState(false);
    const [showScreenshotModal, setShowScreenshotModal] = useState(false);
    const [selectedAspectRatio, setSelectedAspectRatio] = useState('instagram-square');
    const [selectedMetrics, setSelectedMetrics] = useState(AVAILABLE_METRICS.map(m => m.id));
    const [isGeneratingScreenshot, setIsGeneratingScreenshot] = useState(false);
    const dashboardRef = useRef(null);

    const stats = useMemo(() => {
        if (!history || history.length === 0) return null;

        const totalDistance = history.reduce((sum, act) => sum + (act.summary?.distance || 0), 0);
        const totalCalories = history.reduce((sum, act) => sum + (act.summary?.calories || 0), 0);
        const totalDuration = history.reduce((sum, act) => sum + (act.summary?.duration || 0), 0);
        const avgPower = history.reduce((sum, act) => sum + (act.summary?.avgPower || 0), 0) / history.length;

        // Sort history by date for charts
        const chartData = [...history].reverse().map(act => ({
            date: new Date(act.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            distance: Number((act.summary?.distance || 0).toFixed(1)),
            avgPower: Math.round(act.summary?.avgPower || 0),
            maxPower: act.summary?.maxPower || 0,
            avgHR: act.summary?.avgHR || 0,
            calories: act.summary?.calories || 0,
            energyIntensity: act.summary?.duration > 0
                ? Number((act.summary.calories / (act.summary.duration / 60)).toFixed(1))
                : 0,
            ftp: act.summary?.ftp || 250,
            timestamp: act.timestamp,
            efficiencyFactor: act.summary?.avgHR > 0 ? (act.summary.avgPower / act.summary.avgHR).toFixed(2) : '0.00'
        }));

        const avgDistance = totalDistance / history.length;
        const avgCalories = totalCalories / history.length;
        const avgIntensity = chartData.reduce((sum, act) => sum + act.energyIntensity, 0) / chartData.length;

        return {
            totalDistance,
            totalCalories,
            totalDuration,
            avgPower,
            avgDistance,
            avgCalories,
            avgIntensity,
            chartData,
            count: history.length
        };
    }, [history]);

    if (!stats) return null;

    const handleGenerateScreenshot = async () => {
        if (!dashboardRef.current || selectedMetrics.length === 0) return;

        setIsGeneratingScreenshot(true);
        try {
            const config = getAspectRatioConfig(selectedAspectRatio);
            const filename = generateFilename(config);
            await generateScreenshot(dashboardRef.current, filename, config, selectedMetrics);
            setShowScreenshotModal(false);
        } catch (error) {
            console.error('Failed to generate screenshot:', error);
            alert('Failed to generate screenshot. Please try again.');
        } finally {
            setIsGeneratingScreenshot(false);
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background/90 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl">
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2 font-brand">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-8 mb-1">
                            <span className="text-white/60 text-xs font-bold uppercase tracking-tight">{entry.name}</span>
                            <span className="text-white font-black text-sm">{entry.value} {entry.unit}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-1000" ref={dashboardRef}>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter">PERFORMANCE <span className="text-white/20">TRENDS</span></h2>
                </div>
                <div className="flex items-center gap-3" data-screenshot-exclude="true">
                    <button
                        onClick={() => setShowScreenshotModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full border bg-accent/20 border-accent/40 text-accent hover:bg-accent/30 transition-all"
                    >
                        <Camera className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Share</span>
                    </button>
                    <button
                        onClick={() => setShowAverages(!showAverages)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${showAverages ? 'bg-accent/20 border-accent/40 text-accent' : 'bg-white/5 border-white/5 text-white/40 hover:text-white'}`}
                    >
                        <Activity className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{showAverages ? 'Hide Averages' : 'Show Averages'}</span>
                    </button>
                </div>
            </div>

            {/* Global Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6" data-screenshot-id="summary">
                {[
                    { label: 'Total Sessions', value: stats.count, icon: Calendar, color: 'text-accent' },
                    { label: 'Total Distance', value: `${stats.totalDistance.toFixed(1)} km`, icon: TrendingUp, color: 'text-success' },
                    { label: 'Total Energy', value: `${stats.totalCalories.toLocaleString()} kcal`, icon: Zap, color: 'text-orange-500' },
                    { label: 'Avg Power', value: `${Math.round(stats.avgPower)} W`, icon: Activity, color: 'text-blue-400' },
                    { label: 'Current FTP', value: `${stats.chartData[stats.chartData.length - 1]?.ftp || 0} W`, icon: Zap, color: 'text-warning' }
                ].map((item, i) => (
                    <div key={i} className="glass-card p-6 flex items-center justify-between group hover:border-white/20 transition-all">
                        <div>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1 font-brand">{item.label}</p>
                            <h3 className="text-2xl font-black tracking-tighter">{item.value}</h3>
                        </div>
                        <div className={`p-3 rounded-xl bg-white/5 ${item.color} group-hover:scale-110 transition-transform duration-500`}>
                            <item.icon className="w-6 h-6" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Performance Trend Chart */}
                <div className="glass-card p-8" data-screenshot-id="power">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black tracking-tight font-brand">POWER <span className="text-white/20">PROGRESSION</span></h3>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Average Output per Session</p>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-white/20" />
                    </div>
                    <div className="h-[300px] w-full mt-4 overflow-hidden">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ADFF2F" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ADFF2F" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 800 }}
                                    dy={10}
                                    padding={{ left: 10, right: 30 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 800 }}
                                    unit="W"
                                />
                                <Tooltip content={<CustomTooltip />} />
                                {showAverages && (
                                    <ReferenceLine y={stats.avgPower} stroke="#ADFF2F" strokeDasharray="5 5" strokeWidth={2}>
                                        <Label value={`AVG: ${Math.round(stats.avgPower)}W`} position="insideTopLeft" fill="#ADFF2F" fontSize={10} fontWeight={800} dy={10} dx={10} />
                                    </ReferenceLine>
                                )}
                                <Area
                                    type="monotone"
                                    dataKey="avgPower"
                                    name="Avg Power"
                                    unit="W"
                                    stroke="#ADFF2F"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#powerGradient)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distance Volume Chart */}
                <div className="glass-card p-8" data-screenshot-id="volume">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black tracking-tight font-brand">VOLUME <span className="text-white/20">TRENDS</span></h3>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Kilometers per Session</p>
                        </div>
                        <TrendingUp className="w-5 h-5 text-white/20" />
                    </div>
                    <div className="h-[300px] w-full mt-4 overflow-hidden">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 800 }}
                                    dy={10}
                                    padding={{ left: 10, right: 30 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 800 }}
                                    unit="km"
                                />
                                <Tooltip content={<CustomTooltip />} />
                                {showAverages && (
                                    <ReferenceLine y={stats.avgDistance} stroke="#ADFF2F" strokeDasharray="5 5" strokeWidth={2}>
                                        <Label value={`AVG: ${stats.avgDistance.toFixed(1)}km`} position="insideTopLeft" fill="#ADFF2F" fontSize={10} fontWeight={800} dy={10} dx={10} />
                                    </ReferenceLine>
                                )}
                                <Bar
                                    dataKey="distance"
                                    name="Distance"
                                    unit="km"
                                    radius={[4, 4, 0, 0]}
                                    animationDuration={2500}
                                >
                                    {stats.chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === stats.chartData.length - 1 ? '#ADFF2F' : 'rgba(255,255,255,0.05)'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Energy Expenditure Chart */}
                <div className="glass-card p-8" data-screenshot-id="energy-exp">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black tracking-tight font-brand">ENERGY <span className="text-white/20">EXPENDITURE</span></h3>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Total Calories per Session</p>
                        </div>
                        <Zap className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="h-[300px] w-full mt-4 overflow-hidden">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="energyExpGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 800 }}
                                    dy={10}
                                    padding={{ left: 10, right: 30 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 800 }}
                                    unit=" kcal"
                                />
                                <Tooltip content={<CustomTooltip />} />
                                {showAverages && (
                                    <ReferenceLine y={stats.avgCalories} stroke="#f97316" strokeDasharray="5 5" strokeWidth={2}>
                                        <Label value={`AVG: ${Math.round(stats.avgCalories)}kcal`} position="insideTopLeft" fill="#f97316" fontSize={10} fontWeight={800} dy={10} dx={10} />
                                    </ReferenceLine>
                                )}
                                <Bar
                                    dataKey="calories"
                                    name="Energy"
                                    unit=" kcal"
                                    radius={[4, 4, 0, 0]}
                                    animationDuration={2500}
                                >
                                    {stats.chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="url(#energyExpGradient)" />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Energy Intensity Chart */}
                <div className="glass-card p-8" data-screenshot-id="energy-int">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black tracking-tight font-brand">ENERGY <span className="text-white/20">INTENSITY</span></h3>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Calories burned per minute</p>
                        </div>
                        <Activity className="w-5 h-5 text-rose-400" />
                    </div>
                    <div className="h-[300px] w-full mt-4 overflow-hidden">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="energyIntGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#fb7185" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 800 }}
                                    dy={10}
                                    padding={{ left: 10, right: 30 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 800 }}
                                    unit=" kcal/m"
                                />
                                <Tooltip content={<CustomTooltip />} />
                                {showAverages && (
                                    <ReferenceLine y={stats.avgIntensity} stroke="#fb7185" strokeDasharray="5 5" strokeWidth={2}>
                                        <Label value={`AVG: ${stats.avgIntensity.toFixed(1)}kcal/m`} position="insideTopLeft" fill="#fb7185" fontSize={10} fontWeight={800} dy={10} dx={10} />
                                    </ReferenceLine>
                                )}
                                <Area
                                    type="monotone"
                                    dataKey="energyIntensity"
                                    name="Energy Intensity"
                                    unit=" kcal/min"
                                    stroke="#fb7185"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#energyIntGradient)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* FTP Progression Chart */}
            <div className="glass-card p-8" data-screenshot-id="ftp">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-xl font-black tracking-tight font-brand">FITNESS <span className="text-white/20">EVOLUTION (FTP)</span></h3>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Functional Threshold Power over time</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-warning" />
                </div>
                <div className="h-[250px] w-full mt-4 overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 800 }}
                                padding={{ left: 10, right: 30 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 800 }}
                                unit="W"
                                domain={['auto', 'auto']}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="stepAfter"
                                dataKey="ftp"
                                name="FTP"
                                unit="W"
                                stroke="#EAB308"
                                strokeWidth={4}
                                dot={{ fill: '#EAB308', r: 4, strokeWidth: 0 }}
                                activeDot={{ r: 6, fill: '#EAB308' }}
                                animationDuration={3000}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="glass-card p-8" data-screenshot-id="table">
                <h3 className="text-xl font-black tracking-tight mb-8 font-brand">DETAILED <span className="text-white/20">SESSION HISTORY</span></h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="pb-4 text-[10px] font-black text-white/20 uppercase tracking-widest">Date</th>
                                <th className="pb-4 text-[10px] font-black text-white/20 uppercase tracking-widest text-right">Distance</th>
                                <th className="pb-4 text-[10px] font-black text-white/20 uppercase tracking-widest text-right">Avg Power</th>
                                <th className="pb-4 text-[10px] font-black text-white/20 uppercase tracking-widest text-right">FTP</th>
                                <th className="pb-4 text-[10px] font-black text-white/20 uppercase tracking-widest text-right">Max Power</th>
                                <th className="pb-4 text-[10px] font-black text-white/20 uppercase tracking-widest text-right">Avg HR</th>
                                <th className="pb-4 text-[10px] font-black text-white/20 uppercase tracking-widest text-right">Eff. Factor</th>
                                <th className="pb-4 text-[10px] font-black text-white/20 uppercase tracking-widest text-right">Energy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...stats.chartData].reverse().map((session, i) => (
                                <tr key={session.timestamp} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                    <td className="py-4 font-bold text-sm text-white/60 group-hover:text-white transition-colors">
                                        {new Date(session.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="py-4 text-right font-black tracking-tighter">{session.distance} km</td>
                                    <td className="py-4 text-right font-black tracking-tighter">{session.avgPower} W</td>
                                    <td className="py-4 text-right font-black tracking-tighter text-warning">{session.ftp} W</td>
                                    <td className="py-4 text-right font-black tracking-tighter text-white/40">{session.maxPower} W</td>
                                    <td className="py-4 text-right font-black tracking-tighter flex items-center justify-end gap-1">
                                        {session.avgHR} <Heart className="w-3 h-3 text-danger opacity-40" />
                                    </td>
                                    <td className="py-4 text-right font-black tracking-tighter text-accent">{session.efficiencyFactor}</td>
                                    <td className="py-4 text-right font-black tracking-tighter text-accent">{session.calories} kcal</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Screenshot Modal */}
            <ScreenshotModal
                isOpen={showScreenshotModal}
                onClose={() => setShowScreenshotModal(false)}
                onGenerate={handleGenerateScreenshot}
                selectedMetrics={selectedMetrics}
                onMetricToggle={setSelectedMetrics}
                selectedRatio={selectedAspectRatio}
                onRatioChange={setSelectedAspectRatio}
                isGenerating={isGeneratingScreenshot}
            />
        </div>
    );
};

export default ComparisonDashboard;
