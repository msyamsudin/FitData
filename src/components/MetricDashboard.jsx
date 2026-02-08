import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Zap, Heart, Timer, Flame, Activity, ShieldCheck, AlertCircle, Info } from 'lucide-react';

const SummaryCard = ({ icon: Icon, label, value, unit, color }) => (
    <div className="glass-card p-6 flex items-start gap-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">{label}</p>
            <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold tracking-tight">{value}</span>
                <span className="text-white/40 text-xs font-medium">{unit}</span>
            </div>
        </div>
    </div>
);

const ZONE_INFO = {
    Z1: { label: 'Pemulihan Aktif', color: '#6b7280', range: [0, 0.55], benefit: 'Mendorong pemulihan setelah upaya intens dan meningkatkan aliran darah.' },
    Z2: { label: 'Daya Tahan (Endurance)', color: '#3b82f6', range: [0.55, 0.75], benefit: 'Meningkatkan kepadatan mitokondria dan kapasitas aerobik.' },
    Z3: { label: 'Tempo', color: '#10b981', range: [0.75, 0.90], benefit: 'Meningkatkan penyimpanan glikogen dan daya tahan otot.' },
    Z4: { label: 'Ambang Laktat (Threshold)', color: '#f59e0b', range: [0.90, 1.05], benefit: 'Meningkatkan daya yang dapat Anda pertahankan selama satu jam.' },
    Z5: { label: 'VO2 Max', color: '#ef4444', range: [1.05, 1.20], benefit: 'Mengembangkan kapasitas konsumsi oksigen dan output jantung.' },
    Z6: { color: '#b91c1c', range: [1.20, 1.50], label: 'Kapasitas Anaerobik', benefit: 'Meningkatkan daya sprint dan toleransi terhadap upaya intensitas tinggi.' },
    Z7: { color: '#7e22ce', range: [1.50, Infinity], label: 'Daya Neuromuskular', benefit: 'Memaksimalkan penggunaan serat otot cepat dan daya puncak.' }
};

const MetricDashboard = ({ summary, powerZones }) => {
    const ftp = summary.ftp || 250;

    const formatDuration = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const enhancedPowerZones = (powerZones || []).map(zone => {
        const info = ZONE_INFO[zone.name];
        const minW = Math.round(info.range[0] * ftp);
        const maxW = info.range[1] === Infinity ? '+' : `-${Math.round(info.range[1] * ftp)}`;
        return {
            ...zone,
            fullName: `${zone.name} (${minW}${maxW}W)`,
            label: info.label,
            benefit: info.benefit
        };
    });

    return (
        <div className="space-y-8">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <SummaryCard icon={Timer} label="Duration" value={formatDuration(summary.duration || 0)} unit="" color="bg-accent" />
                <SummaryCard icon={Zap} label="Avg Power" value={Math.round(summary.avgPower || 0)} unit="W" color="bg-warning" />
                <SummaryCard icon={Heart} label="Avg HR" value={Math.round(summary.avgHR || 0)} unit="bpm" color="bg-danger" />
                <SummaryCard icon={Activity} label="Avg Cadence" value={Math.round(summary.avgCadence || 0)} unit="rpm" color="bg-success" />
                <SummaryCard icon={Activity} label="Avg Speed" value={(summary.avgSpeed || 0).toFixed(1)} unit="km/h" color="bg-purple-500" />
                <SummaryCard icon={Zap} label="NP" value={Math.round(summary.normalizedPower || 0)} unit="W" color="bg-blue-500" />
                <SummaryCard icon={Timer} label="Moving" value={formatDuration(summary.movingTime || 0)} unit="" color="bg-cyan-500" />
                <SummaryCard icon={Flame} label="Energy" value={Math.round(summary.calories || 0)} unit="kcal" color="bg-orange-500" />
            </div>

            {/* Zone Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-card p-8 lg:col-span-2 space-y-8">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold tracking-tight">Power Zone Distribution</h3>
                            <p className="text-white/40 text-[10px] uppercase font-medium tracking-widest">Time in Zones (Sec)</p>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={enhancedPowerZones} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <XAxis
                                    dataKey="fullName"
                                    stroke="#ffffff20"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#ffffff10"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#141417', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}
                                    labelStyle={{ fontWeight: 'black', color: '#fff', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                    itemStyle={{ fontSize: '12px' }}
                                    formatter={(value, name, props) => [
                                        <span className="font-bold text-white">{value}s</span>,
                                        <span className="text-white/40">{props.payload.label}</span>
                                    ]}
                                />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                                    {enhancedPowerZones.map((entry, index) => (
                                        <Cell key={index} fill={ZONE_INFO[entry.name].color} fillOpacity={0.9} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-8 flex flex-col justify-center gap-6">
                    <div className="space-y-1">
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed">Intensity Profile</p>
                        <h2 className="text-3xl font-black text-white leading-tight underline decoration-accent/40 decoration-4 underline-offset-8">Peak Performance</h2>
                    </div>
                    <div className="space-y-4 pt-4">
                        <div className="flex justify-between border-b border-white/5 pb-3">
                            <span className="text-white/60">Max Power</span>
                            <span className="font-bold text-warning">{summary.maxPower || 0} W</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-3">
                            <span className="font-bold text-white/60">Max Heart Rate</span>
                            <span className="font-bold text-danger">{summary.maxHR || 0} bpm</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-3">
                            <span className="text-white/60">Efficiency Factor</span>
                            <span className="font-bold text-accent">{((summary.avgPower || 0) / (summary.avgHR || 1)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-3">
                            <span className="text-white/60">Functional Threshold (FTP)</span>
                            <span className="font-bold text-warning">{summary.ftp || 250} W</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-3">
                            <span className="text-white/60">Total Work</span>
                            <span className="font-bold text-success">{Math.round(summary.totalWork || 0)} kJ</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-3">
                            <span className="text-white/60">Intensity Factor</span>
                            <span className="font-bold text-purple-400">{(summary.intensityFactor || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-3">
                            <span className="text-white/60">Training Stress (TSS)</span>
                            <span className="font-bold text-orange-400">{Math.round(summary.tss || 0)}</span>
                        </div>
                        {summary.hrv > 0 && (
                            <div className="flex justify-between">
                                <span className="text-white/60">Avg HRV (HR)</span>
                                <span className="font-bold text-indigo-400">{summary.hrv} ms</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Training Benefits Card */}
                <div className="glass-card p-8 lg:col-span-2">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                        <div className="p-2 bg-accent/10 rounded-lg">
                            <Info className="w-5 h-5 text-accent" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="text-xl font-bold tracking-tight">Zone Training Benefits</h3>
                            <p className="text-white/20 text-[10px] uppercase font-black tracking-[0.2em]">Coggan Model - Physiological Guide</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {Object.entries(ZONE_INFO).map(([key, info]) => (
                            <div key={key} className="space-y-2 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: info.color }} />
                                    <span className="text-white font-black text-sm tabular-nums">{key}</span>
                                    <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">{info.label}</span>
                                </div>
                                <p className="text-sm text-white/50 leading-relaxed italic group-hover:text-white/80 transition-colors">
                                    {info.benefit}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recovery Advisor */}
                <div className="glass-card p-8 lg:col-span-1 flex flex-col gap-6 bg-accent/5 overflow-hidden relative">
                    <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
                        <ShieldCheck className="w-48 h-48" />
                    </div>

                    <div className="space-y-4 relative z-10 text-center lg:text-left">
                        <div className="flex items-center gap-3 justify-center lg:justify-start">
                            <ShieldCheck className="w-6 h-6 text-accent" />
                            <h3 className="text-xl font-black uppercase tracking-tight">Recovery Advisor</h3>
                        </div>

                        <p className="text-white/40 text-sm leading-relaxed">
                            Berdasarkan TSS <span className="text-white font-bold">{Math.round(summary.tss || 0)}</span>,
                            estimasi jendela pemulihan Anda:
                        </p>

                        <div className="space-y-3">
                            <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl flex items-center gap-3">
                                <div className={`w-1.5 h-8 rounded-full ${summary.tss < 150 ? 'bg-success' : summary.tss < 300 ? 'bg-warning' : 'bg-danger'}`} />
                                <div>
                                    <p className="text-[10px] font-black text-white/20 uppercase">Fatigue Level</p>
                                    <p className="text-base font-bold">
                                        {summary.tss < 150 ? 'Low Fatigue' : summary.tss < 300 ? 'Moderate Fatigue' : 'High Fatigue'}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl">
                                <p className="text-[10px] font-black text-white/20 uppercase">Est. Recovery</p>
                                <p className="text-base font-bold text-accent">
                                    {summary.tss < 150 ? '~ 24 Hours' : summary.tss < 300 ? '24 - 48 Hours' : '48 - 72 Hours'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                        <AlertCircle className="w-4 h-4 text-white/20 shrink-0 mt-0.5" />
                        <p className="text-xs text-white/30 leading-relaxed italic">
                            Dengarkan tubuh Anda dan prioritaskan tidur serta nutrisi yang baik.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetricDashboard;
