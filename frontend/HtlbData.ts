const STORAGE_KEY = 'augmented-hltb-cache';
const CACHE_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

type HltbData = {
    story: number | null;
    extras: number | null;
    complete: number | null;
    url: string;
};

type StorageData = {
    data: HltbData;
    expiry: number;
};

async function fetchStorePageData(appid: string): Promise<HltbData> {
    const response = await fetch(`https://api.augmentedsteam.com/app/${appid}/v2`);
    return (await response.json())?.hltb;
}

export async function getHltbData(appid: string): Promise<HltbData> {
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
