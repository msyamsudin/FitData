const FitParser = require('fit-file-parser').default;
const fs = require('fs');

const filePath = './Sample-fit-data/2026-01-11-114059-FID1085_17011116582-0-0.fit';
const logPath = './fit_analysis.txt';

try {
    const content = fs.readFileSync(filePath);
    const fitParser = new FitParser({
        force: true,
        mode: 'both',
    });

    fitParser.parse(content, (error, data) => {
        let output = "";
        const log = (msg) => output += msg + "\n";

        if (error) {
            log("PARSE ERROR: " + error);
        } else {
            log("=== MAIN SECTIONS ===");
            log(Object.keys(data).join(', '));

            const printKeys = (label, arr) => {
                if (arr && arr.length > 0) {
                    log(`\n=== ${label} (Count: ${arr.length}) ===`);
                    const keys = new Set();
                    arr.forEach(item => Object.keys(item).forEach(k => keys.add(k)));
                    log(Array.from(keys).sort().join(', '));
                }
            };

            printKeys('RECORDS', data.records);
            printKeys('SESSIONS', data.sessions);
            printKeys('LAPS', data.laps);
            printKeys('DEVICES', data.devices);
            printKeys('EVENTS', data.events);
            printKeys('FILE_IDS', data.file_ids);
            printKeys('USER_PROFILES', data.user_profiles);
            printKeys('SPORTS', data.sports);
        }

        fs.writeFileSync(logPath, output);
        console.log("Analysis written to " + logPath);
    });
} catch (e) {
    fs.writeFileSync(logPath, "FS ERROR: " + e);
}
