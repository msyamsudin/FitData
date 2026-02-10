import React, { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceArea
} from 'recharts';
import { Activity, Zap, Heart, Wind, Layers } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card/90 backdrop-blur-md border border-white/10 p-4 rounded-lg shadow-xl text-sm leading-relaxed">
                <p className="text-white/60 mb-2">{`Time: ${label}s`}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-white/80 font-medium min-w-[80px]">{entry.name}:</span>
                        <span className="font-bold text-white">
                            {entry.value} <span className="text-white/40 text-xs font-normal ml-1">{entry.unit}</span>
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const SyncCharts = ({ data, ftp = 250, maxHr = 190, restingHr = 60, hrMethod = 'standard' }) => {
    const [visibleMetrics, setVisibleMetrics] = useState({
        power: true,
        heartRate: true,
        cadence: false,
        speed: false
    });
    const [showZones, setShowZones] = useState(false);

    const metricsConfig = {
        power: { key: 'power', name: 'Power', color: '#3b82f6', unit: 'W', icon: Zap, yAxisId: 'power' },
        heartRate: { key: 'heartRate', name: 'Heart Rate', color: '#ef4444', unit: 'bpm', icon: Heart, yAxisId: 'hr' },
        cadence: { key: 'cadence', name: 'Cadence', color: '#10b981', unit: 'rpm', icon: Activity, yAxisId: 'cadence' },
        speed: { key: 'speed', name: 'Speed', color: '#a855f7', unit: 'km/h', icon: Wind, yAxisId: 'speed' },
    };

    const toggleMetric = (key) => {
        setVisibleMetrics(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Calculate Power Zones based on FTP
    const powerZones = [
        { name: 'Z1 Active Recovery', max: ftp * 0.55, fill: '#9ca3af', label: 'Z1' }, // Gray
        { name: 'Z2 Endurance', max: ftp * 0.75, fill: '#3b82f6', label: 'Z2' },      // Blue
        { name: 'Z3 Tempo', max: ftp * 0.90, fill: '#10b981', label: 'Z3' },          // Green
        { name: 'Z4 Threshold', max: ftp * 1.05, fill: '#eab308', label: 'Z4' },      // Yellow
        { name: 'Z5 VO2 Max', max: ftp * 1.20, fill: '#ef4444', label: 'Z5' },        // Red
        { name: 'Z6 Anaerobic', max: ftp * 1.50, fill: '#a855f7', label: 'Z6' },      // Purple
    ];

    // Calculate Heart Rate Zones based on Max HR (Standard or Karvonen)
    const calculateZoneLimit = (percentage) => {
        if (hrMethod === 'karvonen') {
            // Karvonen: ((MaxHR - RestingHR) * %Int) + RestingHR
            return Math.round(((maxHr - restingHr) * percentage) + restingHr);
        }
        // Standard: MaxHR * %Int
        return Math.round(maxHr * percentage);
    };

    const hrZones = [
        { name: 'Z1 Very Light', max: calculateZoneLimit(0.60), fill: '#9ca3af', label: 'Z1', benefit: 'Recovery' }, // Gray
        { name: 'Z2 Light', max: calculateZoneLimit(0.70), fill: '#3b82f6', label: 'Z2', benefit: 'Endurance' },      // Blue
        { name: 'Z3 Moderate', max: calculateZoneLimit(0.80), fill: '#10b981', label: 'Z3', benefit: 'Aerobic' },     // Green
        { name: 'Z4 Hard', max: calculateZoneLimit(0.90), fill: '#eab308', label: 'Z4', benefit: 'Anaerobic' },       // Yellow
        { name: 'Z5 Maximum', max: calculateZoneLimit(1.00), fill: '#ef4444', label: 'Z5', benefit: 'VO2 Max' },      // Red
    ];

    // Determine which zones to show
    // Priority: Power > Heart Rate
    const activeZoneType = visibleMetrics.power ? 'power' : (visibleMetrics.heartRate ? 'heartRate' : null);
    const activeZones = activeZoneType === 'power' ? powerZones : (activeZoneType === 'heartRate' ? hrZones : []);
    const activeAxisId = activeZoneType === 'power' ? 'power' : 'hr';

    return (
        <div className="w-full mt-8 space-y-6">
            <div className="glass-card p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight text-white">Activity Analysis</h3>
                        <p className="text-white/40 text-xs uppercase tracking-widest mt-1">Multi-Metric Over Time</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {/* Zone Toggle */}
                        <button
                            onClick={() => setShowZones(!showZones)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${showZones
                                ? 'bg-white/10 text-white border-white/20'
                                : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                                }`}
                        >
                            <Layers className="w-3.5 h-3.5" />
                            {showZones ? 'Hide Zones' : 'Show Zones'}
                        </button>

                        <div className="w-px h-6 bg-white/10 mx-2" />

                        {Object.entries(metricsConfig).map(([key, config]) => {
                            const Icon = config.icon;
                            return (
                                <button
                                    key={key}
                                    onClick={() => toggleMetric(key)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all
                                        ${visibleMetrics[key]
                                            ? `text-white shadow-lg`
                                            : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'}
                                    `}
                                    style={visibleMetrics[key] ? {
                                        backgroundColor: `${config.color}20`,
                                        borderColor: `${config.color}50`,
                                        boxShadow: `0 0 20px ${config.color}10`
                                    } : {}}
                                >
                                    <Icon className="w-3.5 h-3.5"
                                        style={{ color: visibleMetrics[key] ? config.color : 'currentColor' }} />
                                    {config.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />

                            {/* Background Zones */}
                            {showZones && activeZoneType && activeZones.map((zone, index) => {
                                const y1 = index === 0 ? 0 : activeZones[index - 1].max;
                                const y2 = zone.max;
                                return (
                                    <ReferenceArea
                                        key={zone.name}
                                        y1={y1}
                                        y2={y2}
                                        yAxisId={activeAxisId}
                                        fill={zone.fill}
                                        fillOpacity={0.1}
                                        strokeOpacity={0}
                                    />
                                );
                            })}

                            <XAxis
                                dataKey="elapsed"
                                stroke="#ffffff40"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => Math.floor(val / 60)}
                                label={{ value: 'Minutes', position: 'insideBottomRight', offset: -10, fill: '#ffffff40', fontSize: 10 }}
                            />
                            <Tooltip content={<CustomTooltip />} />

                            {/* Y Axes Configuration */}
                            {visibleMetrics.power && (
                                <YAxis yAxisId="power" orientation="left" stroke={metricsConfig.power.color} width={40} fontSize={10} tickLine={false} axisLine={false} />
                            )}
                            {visibleMetrics.heartRate && (
                                <YAxis yAxisId="hr" orientation="right" stroke={metricsConfig.heartRate.color} width={40} fontSize={10} tickLine={false} axisLine={false} />
                            )}
                            {visibleMetrics.cadence && (
                                <YAxis yAxisId="cadence" orientation="right" stroke={metricsConfig.cadence.color} width={40} fontSize={10} tickLine={false} axisLine={false} hide={visibleMetrics.heartRate || visibleMetrics.speed} />
                            )}
                            {visibleMetrics.speed && (
                                <YAxis yAxisId="speed" orientation="right" stroke={metricsConfig.speed.color} width={40} fontSize={10} tickLine={false} axisLine={false} hide={visibleMetrics.heartRate} />
                            )}

                            {/* Lines */}
                            {Object.entries(metricsConfig).map(([key, config]) => (
                                visibleMetrics[key] && (
                                    <Line
                                        key={key}
                                        yAxisId={config.yAxisId}
                                        type="monotone"
                                        dataKey={key}
                                        name={config.name}
                                        unit={config.unit}
                                        stroke={config.color}
                                        strokeWidth={1.5}
                                        dot={false}
                                        activeDot={{ r: 4, strokeWidth: 0, fill: config.color }}
                                        isAnimationActive={true}
                                    />
                                )
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Zone Legend */}
                {showZones && activeZones.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
                        {activeZones.map((zone) => (
                            <div key={zone.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: zone.fill, opacity: 0.8 }}></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider leading-none mb-0.5">{zone.name}</span>
                                    {zone.benefit && <span className="text-[8px] text-white/40 uppercase tracking-tight leading-none">{zone.benefit}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SyncCharts;
