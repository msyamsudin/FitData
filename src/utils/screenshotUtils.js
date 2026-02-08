/**
 * Screenshot utility functions for generating social media-ready images
 */

export const ASPECT_RATIOS = {
    INSTAGRAM_SQUARE: {
        id: 'instagram-square',
        label: 'Instagram Square',
        ratio: '1:1',
        width: 1080,
        height: 1080,
        columns: 2,
        gap: 24,
        chartHeight: 280
    },
    INSTAGRAM_STORY: {
        id: 'instagram-story',
        label: 'Instagram Story',
        ratio: '9:16',
        width: 1080,
        height: 1920,
        columns: 1,
        gap: 32,
        chartHeight: 320
    },
    TWITTER: {
        id: 'twitter',
        label: 'Twitter Post',
        ratio: '16:9',
        width: 1200,
        height: 675,
        columns: 2,
        gap: 20,
        chartHeight: 250
    },
    FACEBOOK: {
        id: 'facebook',
        label: 'Facebook Post',
        ratio: '1.91:1',
        width: 1200,
        height: 628,
        columns: 2,
        gap: 20,
        chartHeight: 240
    },
    ORIGINAL: {
        id: 'original',
        label: 'Original Size',
        ratio: 'Original',
        width: null,
        height: null,
        columns: 2,
        gap: 32,
        chartHeight: 300
    }
};

export const AVAILABLE_METRICS = [
    {
        id: 'summary',
        label: 'Summary Stats',
        section: 'header',
        description: 'Total sessions, distance, energy, power, FTP'
    },
    {
        id: 'power',
        label: 'Power Progression',
        section: 'chart',
        description: 'Average power output per session'
    },
    {
        id: 'volume',
        label: 'Volume Trends',
        section: 'chart',
        description: 'Distance covered per session'
    },
    {
        id: 'energy-exp',
        label: 'Energy Expenditure',
        section: 'chart',
        description: 'Total calories burned'
    },
    {
        id: 'energy-int',
        label: 'Energy Intensity',
        section: 'chart',
        description: 'Calories per minute'
    },
    {
        id: 'ftp',
        label: 'FTP Evolution',
        section: 'chart',
        description: 'Functional Threshold Power progression'
    },
    {
        id: 'table',
        label: 'Session History',
        section: 'table',
        description: 'Detailed session breakdown'
    }
];

/**
 * Get aspect ratio configuration
 */
export const getAspectRatioConfig = (ratioId) => {
    return Object.values(ASPECT_RATIOS).find(r => r.id === ratioId) || ASPECT_RATIOS.ORIGINAL;
};

/**
 * Apply screenshot-specific styles to element
 */
export const applyScreenshotStyles = (element, config, selectedMetrics) => {
    if (!element) return;

    const clone = element.cloneNode(true);

    // Apply container styles
    clone.style.padding = '48px';
    clone.style.background = 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)';
    clone.style.minHeight = 'auto';

    if (config.width && config.height) {
        clone.style.width = `${config.width}px`;
        clone.style.maxWidth = `${config.width}px`;
    }

    // Hide elements not in selected metrics
    const headerStats = clone.querySelector('[data-screenshot-id="summary"]');
    const powerChart = clone.querySelector('[data-screenshot-id="power"]');
    const volumeChart = clone.querySelector('[data-screenshot-id="volume"]');
    const energyExpChart = clone.querySelector('[data-screenshot-id="energy-exp"]');
    const energyIntChart = clone.querySelector('[data-screenshot-id="energy-int"]');
    const ftpChart = clone.querySelector('[data-screenshot-id="ftp"]');
    const historyTable = clone.querySelector('[data-screenshot-id="table"]');

    if (!selectedMetrics.includes('summary') && headerStats) {
        headerStats.style.display = 'none';
    }
    if (!selectedMetrics.includes('power') && powerChart) {
        powerChart.style.display = 'none';
    }
    if (!selectedMetrics.includes('volume') && volumeChart) {
        volumeChart.style.display = 'none';
    }
    if (!selectedMetrics.includes('energy-exp') && energyExpChart) {
        energyExpChart.style.display = 'none';
    }
    if (!selectedMetrics.includes('energy-int') && energyIntChart) {
        energyIntChart.style.display = 'none';
    }
    if (!selectedMetrics.includes('ftp') && ftpChart) {
        ftpChart.style.display = 'none';
    }
    if (!selectedMetrics.includes('table') && historyTable) {
        historyTable.style.display = 'none';
    }

    // Hide elements marked for exclusion from screenshots (like buttons)
    const excludedElements = clone.querySelectorAll('[data-screenshot-exclude="true"]');
    excludedElements.forEach(element => {
        element.style.display = 'none';
    });

    // Adjust grid layouts based on config
    const chartGrids = clone.querySelectorAll('.grid.grid-cols-1.lg\\:grid-cols-2');
    chartGrids.forEach(grid => {
        if (config.columns === 1) {
            grid.style.gridTemplateColumns = '1fr';
        } else {
            grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        }
        grid.style.gap = `${config.gap}px`;
    });

    return clone;
};

/**
 * Generate and download screenshot
 */
export const generateScreenshot = async (element, filename, config, selectedMetrics) => {
    // Dynamically import html2canvas
    const html2canvas = (await import('html2canvas')).default;

    const clone = applyScreenshotStyles(element, config, selectedMetrics);
    if (!clone) {
        throw new Error('Failed to prepare screenshot element');
    }

    // Append clone to body temporarily
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    document.body.appendChild(clone);

    try {
        const canvas = await html2canvas(clone, {
            backgroundColor: '#0a0a0a',
            scale: 2, // Higher quality
            logging: false,
            useCORS: true,
            allowTaint: true,
            windowWidth: config.width || element.offsetWidth,
            windowHeight: config.height || element.offsetHeight
        });

        // Convert canvas to blob
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));

        // Download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();

        // Cleanup
        URL.revokeObjectURL(url);
    } finally {
        // Remove clone
        document.body.removeChild(clone);
    }
};

/**
 * Generate filename for screenshot
 */
export const generateFilename = (ratioConfig) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const ratioLabel = ratioConfig.label.toLowerCase().replace(/\s+/g, '-');
    return `fitdata-trends-${ratioLabel}-${timestamp}.png`;
};
