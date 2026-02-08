import React from 'react';
import { ChevronRight, Calendar, Clock, Map, Zap } from 'lucide-react';

const ActivityCard = ({ activity, onClick }) => {
    const { summary, timestamp } = activity;

    const dateStr = new Date(timestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div
            onClick={onClick}
            className="group relative glass-card p-6 transition-all cursor-pointer hover:border-accent/40 hover:translate-y-[-4px] overflow-hidden"
        >
            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2 text-white/40">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{dateStr}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </div>

                <div className="mb-6">
                    <h3 className="text-3xl font-black tracking-tight mb-1">
                        {(summary.distance || 0).toFixed(2)} <span className="text-sm text-white/20 uppercase">km</span>
                    </h3>
                    <div className="flex items-center gap-2 text-white/40">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">{((summary.duration || 0) / 60).toFixed(0)} min</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-tighter">Avg Speed</p>
                        <p className="text-sm font-bold">{(summary.avgSpeed || 0).toFixed(1)} <span className="text-[10px] opacity-40">km/h</span></p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-tighter">Avg Power / NP</p>
                        <p className="text-sm font-bold">
                            {(summary.avgPower || 0).toFixed(0)}
                            <span className="text-white/20 mx-1">/</span>
                            <span className="text-blue-400">{(summary.normalizedPower || summary.avgPower || 0).toFixed(0)}</span>
                            <span className="text-[10px] opacity-40 ml-1">W</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityCard;
