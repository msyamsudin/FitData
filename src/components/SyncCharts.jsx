import React, { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Activity, Zap, Heart, Wind } from 'lucide-react';

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

const SyncCharts = ({ data }) => {
    const [visibleMetrics, setVisibleMetrics] = useState({
        power: true,
        heartRate: true,
        cadence: false,
        speed: false
    });

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

    return (
        <div className="w-full mt-8 space-y-6">
            <div className="glass-card p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight text-white">Activity Analysis</h3>
                        <p className="text-white/40 text-xs uppercase tracking-widest mt-1">Multi-Metric Over Time</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
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
            </div>
        </div>
    );
};

export default SyncCharts;
