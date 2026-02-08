import FitParser from 'fit-file-parser';

export const parseFitFile = (file, ftp = 250) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const content = event.target.result;
            const fitParser = new FitParser({
                force: true,
                speedUnit: 'km/h',
                lengthUnit: 'km',
                temperatureUnit: 'celsius',
                elapsedRecordField: true,
                mode: 'both',
            });

            fitParser.parse(content, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(processFitData(data, ftp));
                }
            });
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};

const processFitData = (rawData, ftp = 250) => {
    const records = rawData.records || [];
    const session = rawData.sessions ? rawData.sessions[0] : {};

    // Map temporal records
    const processedRecords = records.map((record, index) => ({
        timestamp: record.timestamp,
        elapsed: index, // fit-file-parser sometimes lacks elapsed_time
        power: record.power || 0,
        heartRate: record.heart_rate || 0,
        cadence: record.cadence || 0,
        speed: record.speed || record.enhanced_speed || 0,
        distance: record.distance || 0,
    }));

    // Summary statistics
    const summary = {
        duration: session.total_timer_time || 0,
        distance: session.total_distance || 0,
        calories: session.total_calories || 0,
        avgPower: session.avg_power || 0,
        maxPower: session.max_power || 0,
        avgHR: session.avg_heart_rate || 0,
        maxHR: session.max_heart_rate || 0,
        avgCadence: session.avg_cadence || 0,
        avgSpeed: session.avg_speed || session.enhanced_avg_speed || (session.total_distance / (session.total_timer_time / 3600)) || 0,
        totalWork: session.total_work || (session.avg_power * session.total_timer_time / 1000) || 0,
        normalizedPower: session.normalized_power || 0,
        movingTime: session.total_moving_time || session.total_timer_time || 0,
        hrv: (rawData.hrv && rawData.hrv.length > 0)
            ? (() => {
                const allIntervals = rawData.hrv.flatMap(h => h.time || []);
                if (allIntervals.length === 0) return 0;
                const avgMs = (allIntervals.reduce((a, b) => a + b, 0) / allIntervals.length) * 1000;
                return avgMs.toFixed(1);
            })()
            : 0,
        intensityFactor: (session.normalized_power / ftp) || 0,
        tss: ((session.total_timer_time * (session.normalized_power || 0) * (session.normalized_power / ftp)) / (ftp * 36)) || 0,
        ftp: ftp
    };

    // Training Zones (simplified Coggan Power Zones based on user FTP)
    const powerZones = {
        Z1: 0, Z2: 0, Z3: 0, Z4: 0, Z5: 0, Z6: 0, Z7: 0
    };

    processedRecords.forEach(r => {
        const p = r.power;
        if (p < 0.55 * ftp) powerZones.Z1++;
        else if (p < 0.75 * ftp) powerZones.Z2++;
        else if (p < 0.90 * ftp) powerZones.Z3++;
        else if (p < 1.05 * ftp) powerZones.Z4++;
        else if (p < 1.20 * ftp) powerZones.Z5++;
        else if (p < 1.50 * ftp) powerZones.Z6++;
        else powerZones.Z7++;
    });

    return {
        startTime: session.start_time || records[0]?.timestamp || new Date(),
        records: processedRecords,
        summary,
        powerZones: Object.entries(powerZones).map(([name, value]) => ({ name, value })),
    };
};
