import Dexie from 'dexie';

export const db = new Dexie('FitDataAnalytics');

db.version(3).stores({
    activities: '++id, timestamp, distance, duration, fingerprint' // Indexing for search/sort
}).upgrade(async tx => {
    // Populate fingerprints for existing activities
    return await tx.activities.toCollection().modify(activity => {
        if (!activity.fingerprint) {
            activity.fingerprint = `${new Date(activity.timestamp).getTime()}-${activity.summary.distance}`;
        }
    });
});

export const saveActivity = async (data) => {
    const timestamp = data.startTime;
    const distance = data.summary.distance;
    const fingerprint = `${new Date(timestamp).getTime()}-${distance}`;

    // Check for duplicates
    const existing = await db.activities
        .where('fingerprint')
        .equals(fingerprint)
        .first();

    if (existing) {
        throw new Error('DUPLICATE_ACTIVITY');
    }

    const activity = {
        timestamp,
        fingerprint,
        summary: data.summary,
        records: data.records,
        powerZones: data.powerZones,
        createdAt: new Date()
    };
    return await db.activities.add(activity);
};

export const getActivities = async () => {
    return await db.activities.orderBy('timestamp').reverse().toArray();
};

export const getActivity = async (id) => {
    return await db.activities.get(id);
};

export const deleteActivity = async (id) => {
    return await db.activities.delete(id);
};
