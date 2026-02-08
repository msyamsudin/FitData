import React from 'react';
import { Camera, X, Image, Check } from 'lucide-react';
import { ASPECT_RATIOS, AVAILABLE_METRICS } from '../utils/screenshotUtils';

const ScreenshotModal = ({
    isOpen,
    onClose,
    onGenerate,
    selectedMetrics,
    onMetricToggle,
    selectedRatio,
    onRatioChange,
    isGenerating
}) => {
    if (!isOpen) return null;

    const currentRatioConfig = Object.values(ASPECT_RATIOS).find(r => r.id === selectedRatio);

    const toggleSelectAllInSection = (section) => {
        const metricsInSection = AVAILABLE_METRICS.filter(m => m.section === section).map(m => m.id);
        const allSelected = metricsInSection.every(id => selectedMetrics.includes(id));

        if (allSelected) {
            // Deselect all in this section
            onMetricToggle(selectedMetrics.filter(id => !metricsInSection.includes(id)));
        } else {
            // Select all in this section
            const newMetrics = [...new Set([...selectedMetrics, ...metricsInSection])];
            onMetricToggle(newMetrics);
        }
    };

    const sections = ['header', 'chart', 'table'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative glass-card p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-accent/20">
                            <Camera className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black tracking-tight">Share to Social Media</h3>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">
                                Customize your screenshot
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        disabled={isGenerating}
                    >
                        <X className="w-5 h-5 text-white/60" />
                    </button>
                </div>

                {/* Aspect Ratio Selection */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-black uppercase tracking-widest text-white/60">
                            Aspect Ratio
                        </h4>
                        {currentRatioConfig && (
                            <p className="text-xs text-accent font-bold">
                                {currentRatioConfig.width && currentRatioConfig.height
                                    ? `${currentRatioConfig.width} × ${currentRatioConfig.height} px`
                                    : 'Responsive'
                                }
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.values(ASPECT_RATIOS).map((ratio) => (
                            <button
                                key={ratio.id}
                                onClick={() => onRatioChange(ratio.id)}
                                disabled={isGenerating}
                                className={`
                  p-4 rounded-xl border-2 transition-all group
                  ${selectedRatio === ratio.id
                                        ? 'border-accent bg-accent/10 text-accent'
                                        : 'border-white/10 hover:border-white/20 text-white/60 hover:text-white'
                                    }
                  ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <Image className="w-5 h-5" />
                                    {selectedRatio === ratio.id && (
                                        <Check className="w-4 h-4" />
                                    )}
                                </div>
                                <p className="text-sm font-black tracking-tight text-left">
                                    {ratio.label}
                                </p>
                                <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-left opacity-60">
                                    {ratio.ratio}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Metric Selection */}
                <div className="mb-8">
                    <h4 className="text-sm font-black uppercase tracking-widest text-white/60 mb-4">
                        Select Metrics to Include
                    </h4>

                    {sections.map((section) => {
                        const metricsInSection = AVAILABLE_METRICS.filter(m => m.section === section);
                        const allSelected = metricsInSection.every(m => selectedMetrics.includes(m.id));

                        return (
                            <div key={section} className="mb-6 last:mb-0">
                                <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-xs font-black uppercase tracking-widest text-white/40">
                                        {section === 'header' ? 'Summary' : section === 'chart' ? 'Charts' : 'Table'}
                                    </h5>
                                    <button
                                        onClick={() => toggleSelectAllInSection(section)}
                                        disabled={isGenerating}
                                        className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-accent/80 transition-colors"
                                    >
                                        {allSelected ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {metricsInSection.map((metric) => (
                                        <label
                                            key={metric.id}
                                            className={`
                        flex items-start gap-3 p-3 rounded-lg border border-white/5 
                        hover:border-white/10 transition-all cursor-pointer group
                        ${selectedMetrics.includes(metric.id) ? 'bg-white/5' : ''}
                        ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedMetrics.includes(metric.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        onMetricToggle([...selectedMetrics, metric.id]);
                                                    } else {
                                                        onMetricToggle(selectedMetrics.filter(id => id !== metric.id));
                                                    }
                                                }}
                                                disabled={isGenerating}
                                                className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 
                                   checked:bg-accent checked:border-accent
                                   focus:ring-2 focus:ring-accent/50 cursor-pointer"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">
                                                    {metric.label}
                                                </p>
                                                <p className="text-[10px] text-white/40 mt-0.5 font-medium">
                                                    {metric.description}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Warning if no metrics selected */}
                {selectedMetrics.length === 0 && (
                    <div className="mb-6 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <p className="text-sm text-orange-400 font-bold">
                            ⚠️ Please select at least one metric to include in the screenshot.
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onGenerate}
                        disabled={isGenerating || selectedMetrics.length === 0}
                        className={`
              flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl
              font-black uppercase tracking-widest text-sm transition-all
              ${isGenerating || selectedMetrics.length === 0
                                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                : 'bg-accent hover:bg-accent/90 text-black hover:scale-[1.02]'
                            }
            `}
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Camera className="w-5 h-5" />
                                Generate & Download
                            </>
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isGenerating}
                        className="px-6 py-4 rounded-xl border border-white/10 hover:border-white/20 
                       text-white/60 hover:text-white font-black uppercase tracking-widest 
                       text-sm transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScreenshotModal;
