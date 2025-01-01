const STORAGE_KEY = 'augmented-hltb-cache';
const CACHE_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

type StoreData = {
    players: {
        recent: number,
        peak_today: number,
        peak_all: number
    },
    hltb: {
        story: number | null;
        extras: number | null;
        complete: number | null;
        url: string;
    }
};

type StorageData = {
    data: StoreData;
    expiry: number;
};

async function fetchStorePageData(appid: string): Promise<StoreData> {
    const response = await fetch(`https://api.augmentedsteam.com/app/${appid}/v2`);
    return await response.json();
}

export async function getHltbData(appid: string): Promise<StoreData> {
    const cachedData: Record<string, StorageData> = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    let appData = cachedData[appid];

    if (!appData || appData.expiry < Date.now()) {
        const fetchedData = await fetchStorePageData(appid);
        appData = {
            data: fetchedData,
            expiry: Date.now() + CACHE_TIME,
        };
        cachedData[appid] = appData;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedData));
    }

    return appData.data;
}
