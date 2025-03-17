import { callable } from '@steambrew/webkit';
import { AugmentedBrowser } from './browser-types';
import { getCdn, getLoopbackCdn, Logger, sleep, VERSION } from './shared';

// In this file we emulate the extension browser api for the Augmented Steam extension
const augmentedBrowser: Partial<AugmentedBrowser> = {};

//#region Defaults

augmentedBrowser.runtime = {
    getManifest: () => { return {version: VERSION}; },
    id: 'kdbmhfkmnlmbkgbabkdealhhbfhlmmon', // Chrome
    onInstalled: {
        addListener: () => {},
    },
    onStartup: {
        addListener: () => {},
    },
    getURL: (resource: string) => {
        // Disable early access badge on achievements page because of incompatibility with SteamDB plugin
        if (location.href.includes('/stats') && resource.includes('early_access')) {
            const gameLogo = document.querySelector('.gameLogo');
            if (gameLogo) {
                gameLogo.classList.add('es_ea_checked');
            }
        }

        if (resource.endsWith('.png') || resource.endsWith('.svg') || resource.endsWith('.gif') || resource.startsWith('/localization/')) {
            return getLoopbackCdn(resource);
        }
        return getCdn(resource);
    },
    onMessage: {
        addListener
    },
    sendMessage
};

augmentedBrowser.contextMenus = {
    onClicked: {
        addListener: () => {},
        hasListener: () => false,
    },
};

//#endregion

//#region Storage

const SYNC_STORAGE_KEY = 'augmented-options-sync';
const LOCAL_STORAGE_KEY = 'augmented-options-local';

async function StorageGet(storageKey: string, items?: string | string[] | Record<string, unknown>, callback?: Function): Promise<Record<string, unknown>> {
    const storedData = localStorage.getItem(storageKey);
    const result: Record<string, unknown> = {};
    let parsedData: Record<string, unknown> = {};

    try {
        parsedData = storedData ? JSON.parse(storedData) : {};
    } catch {
        throw new Error(`failed to parse JSON for ${storageKey}`);
    }

    if (typeof items === 'string') {
        items = [items];
    }

    if (Array.isArray(items)) {
        items.forEach(key => {
            if (key in parsedData) {
                result[key] = parsedData[key];
            }
        });
    } else if (typeof items === 'object') {
        for (const key in items) {
            result[key] = key in parsedData ? parsedData[key] : items[key];
        }
    }

    if (callback) {
        callback(result);
    }

    return result;
}

async function StorageSet(storageKey: string, item: Record<string, unknown>, callback?: Function) {
    const storedData = localStorage.getItem(storageKey);
    let parsedData: Record<string, object> = {};

    try {
        parsedData = storedData ? JSON.parse(storedData) : {};
    } catch {
        throw new Error(`failed to parse JSON for ${storageKey}`);
    }

    Object.assign(parsedData, item);
    localStorage.setItem(storageKey, JSON.stringify(parsedData));

    if (callback) {
        callback();
    }
}

async function StorageRemove(storageKey: string, key: string | string[], callback?: Function) {
    const storedData = localStorage.getItem(storageKey);
    let parsedData: Record<string, object> = {};

    try {
        parsedData = storedData ? JSON.parse(storedData) : {};
    } catch {
        throw new Error(`failed to parse JSON for ${storageKey}`);
    }

    if (!Array.isArray(key)) {
        key = [key];
    }

    key.forEach(k => {
        delete parsedData[k];
    });

    localStorage.setItem(storageKey, JSON.stringify(parsedData));

    if (callback) {
        callback();
    }
}

augmentedBrowser.storage = {
    sync: {
        get: (items?: Record<string, unknown>, callback?: Function) => StorageGet(SYNC_STORAGE_KEY, items, callback),
        set: (item: Record<string, unknown>, callback?: Function) => StorageSet(SYNC_STORAGE_KEY, item, callback),
        remove: (key: string | string[], callback?: Function) => StorageRemove(SYNC_STORAGE_KEY, key, callback),
    },
    local: {
        get: (items?: Record<string, unknown>, callback?: Function) => StorageGet(LOCAL_STORAGE_KEY, items, callback),
        set: (item: Record<string, unknown>, callback?: Function) => StorageSet(LOCAL_STORAGE_KEY, item, callback),
        remove: (key: string | string[], callback?: Function) => StorageRemove(LOCAL_STORAGE_KEY, key, callback),
    },
};

//#endregion

//#region fake fetch
const oldFetch = window.fetch;

const interceptedUrls: RegExp[] = [
    /steamcommunity\.com\/id/,
    /steamcommunity\.com\/profiles\/\d+\/$/,
    /steamcommunity\.com\/profiles\/\d+\/ajaxgetbadgeinfo/,
    /steamcommunity\.com\/inventory\//,
    /store\.steampowered\.com\/steamaccount\/addfunds/,
];

const backendFetch = callable<[{ url: string }], string>('BackendFetch');

type BackendResponse = {
    status: number,
    url: string,
    headers: Record<string, string>,
    body: string
};

export const retrieveUrlQuery = 'retrieveUrl';

const getRetrieveUrlResponse = callable('GetRetrieveUrlResponse');
let requestLocked = false;

async function waitLock(): Promise<boolean> {
    const startTime = Date.now();
    while (requestLocked && Date.now() - startTime < 15000) {
        await sleep(250);
    }
    return !requestLocked;
}

async function WindowFetch(url: string): Promise<string | null> {
    const lockFreed = await waitLock();
    if (!lockFreed) {
        Logger.Warn('Failed to retrieve url. Request already in progress.', url);
        return null;
    }

    requestLocked = true;
    const communityWindow = window.open(`https://steamcommunity.com/?${retrieveUrlQuery}=${url}`, undefined, 'width=0,height=1000000,left=0,top=0'); // We set height really high so for some reason the width becomes 0
    if (!communityWindow) {
        Logger.Error('Failed to open new window for window request.', url);
        return null;
    }

    let urlResponse = null;
    const startTime = Date.now();
    while (urlResponse === null && Date.now() - startTime < 10000) {
        urlResponse = await getRetrieveUrlResponse();
        if (urlResponse === 0) {
            urlResponse = null;
        }

        await sleep(250);
    }

    if (urlResponse === null) {
        Logger.Error('Failed to retrieve url. Request timed out after 10 seconds.', url);
        return null;
    }

    return urlResponse as string;
}

async function handleInterceptedFetch(url: string, params?: RequestInit): Promise<Response> {
    Logger.Debug(`intercepting ${url}`);
    if (params) {
        const headers = Object.keys(params).filter(h => h.toLowerCase() !== 'credentials');
        // We only support the credentials header for now, so if we see any other log a warning
        if (headers.length > 0) {
            Logger.Warn('fetch params not fully supported', params);
        }
    }

    const response = JSON.parse(await backendFetch({url: url.toString()})) as BackendResponse;

    let responseObject = new Response(response.body, {status: response.status, headers: response.headers});
    if (response.status === 403 && params?.credentials === 'include') {
        // If we need credentials to access this page, and we can't do it via the backend we do it via the browser
        let windowResponse = null;
        try {
            windowResponse = await WindowFetch(url.toString());
        } catch (e) {
            Logger.Error('Failed to retrieve URL', url.toString(), e);
        }
        requestLocked = false;
        if (windowResponse === null) {
            return new Response(null, {status: 500});
        }

        responseObject = new Response(windowResponse, {status: 200});
    }

    Object.defineProperty(responseObject, 'url', {value: response.url});
    return responseObject;
}

window.fetch = async (url: string | URL | Request, params?: RequestInit): Promise<Response> => {
    for (const intercept of interceptedUrls) {
        if (url.toString().match(intercept)) {
            return await handleInterceptedFetch(url.toString(), params);
        }
    }

    return oldFetch(url, params);
};
//#endregion

//#region Background messaging
augmentedBrowser.clients = {
    matchAll: () => [{url: 'html/offscreen_domparser.html'}],
};
augmentedBrowser.offscreen = {
    closeDocument: () => {},
};

type MessageCallback = (message: unknown, sender: object, sendResponse: (response: unknown) => void) => void;

const messageListeners: MessageCallback[] = [];

function addListener(callback: MessageCallback) {
    messageListeners.push(callback);
};

function sendMessage(message: unknown, callback?: (response: unknown) => void): void {
    Logger.Debug('Sending message', message);
    messageListeners.forEach((listener) => {
        listener(
            message,
            {tab: {}},
            (response: unknown) => {
                if (callback) {
                    callback(response);
                }
            },
        );
    });
};

//#endregion

//#region open newly created <a> tags in own way
const oldCreateElement = document.createElement.bind(document);

// TODO: maybe make this an option
const externalLinks = [
    'twitch.tv',
    'youtube.com',
    'google.com',
    'astats.nl',
    'steamrep.com',
    'steamgifts.com',
    'steamtrades.com',
    'barter.vg',
    'achievementstats.com',
    'backpack.tf',
    'steamcardexchange.net',
    'augmentedsteam.com',
];
const popupLinks = [
    'steamdb.info',
    'isthereanydeal.com',
    'howlongtobeat.com',
    'pcgamingwiki.com',
];
const EXTERNAL_PROTOCOL = 'steam://openurl_external/';

function modifyHrefForExternalLinks(tag: HTMLAnchorElement): void {
    externalLinks.forEach(link => {
        if (tag.href.includes(link)) {
            tag.href = EXTERNAL_PROTOCOL + tag.href;
        }
    });
}

function addPopupClickListener(tag: HTMLAnchorElement): void {
    popupLinks.forEach(link => {
        if (tag.href.includes(link)) {
            tag.onclick = (event) => {
                if (event.ctrlKey) {
                    return;
                }

                event.preventDefault();

                const ctrlClickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    ctrlKey: true,
                });

                tag.dispatchEvent(ctrlClickEvent);
            };
        }
    });
}

function observeAnchorTag(tag: HTMLAnchorElement): void {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'href') {
                modifyHrefForExternalLinks(tag);
                addPopupClickListener(tag);
                observer.disconnect();
            }
        });
    });

    observer.observe(tag, {attributes: true});
}

document.createElement = function (tagName: string, options?: ElementCreationOptions) {
    const tag: HTMLElement = oldCreateElement(tagName, options);

    if (tagName.toLowerCase() === 'a') {
        observeAnchorTag(tag as HTMLAnchorElement);
    }

    return tag;
};
//#endregion

window.augmentedBrowser = augmentedBrowser as AugmentedBrowser;