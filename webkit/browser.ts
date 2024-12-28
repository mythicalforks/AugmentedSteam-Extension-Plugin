import { callable } from "@steambrew/webkit";
import { getCdn, getLoopbackCdn, Logger, VERSION } from "./shared";

// In this file we emulate the extension browser api for the Augmented Steam extension

window.augmentedBrowser = {};
const augmentedBrowser = window.augmentedBrowser;

// #region Defaults

// augmentedBrowser.storage.sync.onChanged = {};
augmentedBrowser.runtime = {};
augmentedBrowser.runtime.getManifest = () => {return {version: VERSION}};
augmentedBrowser.runtime.id = 'kdbmhfkmnlmbkgbabkdealhhbfhlmmon'; // Chrome

export const SYNC_STORAGE_KEY = 'augmented-options-sync';
const LOCAL_STORAGE_KEY = 'augmented-options-local';

augmentedBrowser.runtime.onInstalled = {};
augmentedBrowser.runtime.onInstalled.addListener = () => {};

augmentedBrowser.runtime.onStartup = {};
augmentedBrowser.runtime.onStartup.addListener = () => {};

augmentedBrowser.contextMenus = {};
augmentedBrowser.contextMenus.onClicked = {};
augmentedBrowser.contextMenus.onClicked.addListener = () => {};
augmentedBrowser.contextMenus.onClicked.hasListener = () => {};

//#endregion

// #region Storage

augmentedBrowser.storage = {};
augmentedBrowser.storage.sync = {};

async function StorageGet(storageKey: string, items?: string | string[] | {[key: string]: any}, callback?: Function): Promise<any> {
    let storedData = localStorage.getItem(storageKey);
    let result: { [key: string]: any } = {};
    let parsedData: { [key: string]: any } = {};

    try {
        parsedData = storedData ? JSON.parse(storedData) : {};
    } catch (e) {
        Logger.Error(`failed to parse JSON for ${storageKey}`);
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
            for (let key in items) {
                let foundItem = key in parsedData ? parsedData[key] : items[key];
                // if (typeof foundItem === 'boolean') {
                    result[key] = foundItem
                // }
            }
    }

    if (callback) {
        callback(result);
    }

    return result;
}

async function StorageSet(storageKey: string, item: { [key: string]: any }, callback?: Function) {
    let storedData = localStorage.getItem(storageKey);
    let parsedData: { [key: string]: any } = {};

    try {
        parsedData = storedData ? JSON.parse(storedData) : {};
    } catch (e) {
        Logger.Error(`failed to parse JSON for ${storageKey}`);
    }

    // let key = Object.keys(item)[0];
    // storageListeners.forEach(callback => {
    //     callback({
    //         [key]: {
    //             oldValue: parsedData[key],
    //             newValue: item[key]
    //         }
    //     });
    // });

    Object.assign(parsedData, item);
    localStorage.setItem(storageKey, JSON.stringify(parsedData));

    if (callback) {
        callback();
    }
}

async function StorageRemove(storageKey: string, key: string | string[], callback?: Function) {
    let storedData = localStorage.getItem(storageKey);
    let parsedData: { [key: string]: any } = {};

    try {
        parsedData = storedData ? JSON.parse(storedData) : {};
    } catch (e) {    
        Logger.Error(`failed to parse JSON for ${storageKey}`);
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

augmentedBrowser.storage.sync.get = (items?: any, callback?: Function) => StorageGet(SYNC_STORAGE_KEY, items, callback);
augmentedBrowser.storage.sync.set = (item: any, callback?: Function) => StorageSet(SYNC_STORAGE_KEY, item, callback);
augmentedBrowser.storage.sync.remove = (key: any, callback?: Function) => StorageRemove(SYNC_STORAGE_KEY, key, callback);
augmentedBrowser.storage.local = {};
augmentedBrowser.storage.local.get = (items?: any, callback?: Function) => StorageGet(LOCAL_STORAGE_KEY, items, callback);
augmentedBrowser.storage.local.set = (item: any, callback?: Function) => StorageSet(LOCAL_STORAGE_KEY, item, callback);
augmentedBrowser.storage.local.remove = (key: any, callback?: Function) => StorageRemove(LOCAL_STORAGE_KEY, key, callback);

//#region fake fetch
const oldFetch = window.fetch;

const interceptedUrls: RegExp[] = [
    /steamcommunity\.com\/id/,
    /steamcommunity\.com\/profiles\/\d+\/$/,
    /steamcommunity\.com\/profiles\/\d+\/ajaxgetbadgeinfo/,
    /steamcommunity\.com\/inventory\//,
    /store\.steampowered\.com\/steamaccount\/addfunds/,
];

const backendFetch = callable<[{url: string}], string>('BackendFetch');

type BackendResponse = {
    'ok': boolean,
    'status': number,
    'url': string,
    'headers': Record<string, string>,
    'body': string
};

window.fetch = async (url: string | URL | Request, params?: RequestInit): Promise<Response> => {
    for (const intercept of interceptedUrls) {
        if (url.toString().match(intercept)) {
            Logger.Debug(`intercepting ${url}`);
            if (params) {
                //TODO: Handle credentials params
                Logger.Warn('fetch params not supported', params);
            }
            const response = JSON.parse(await backendFetch({url: url.toString()})) as BackendResponse;
            
            let responseObject = new Response(response.body, {status: response.status, headers: response.headers});
            Object.defineProperty(responseObject, "url", { value: response.url });
            return responseObject;
        }
    }

    return oldFetch(url, params);
}
// #endregion

// augmentedBrowser.storage.sync.set = async function (item: { [key: string]: any }) {
//     let storedData = localStorage.getItem(STORAGE_KEY);
//     let parsedData: { [key: string]: any } = {};

//     try {
//         parsedData = storedData ? JSON.parse(storedData) : {};
//     } catch (e) {
//         Logger.Error('failed to parse JSON for steamdb-options');
//     }

//     let key = Object.keys(item)[0];
//     storageListeners.forEach(callback => {
//         callback({
//             [key]: {
//                 oldValue: parsedData[key],
//                 newValue: item[key]
//             }
//         });
//     });

//     Object.assign(parsedData, item);
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
// }

// augmentedBrowser.storage.sync.onChanged = {};
// let storageListeners: ((changes: { [key: string]: { oldValue: any; newValue: any; } }) => void)[] = [];
// augmentedBrowser.storage.sync.onChanged.addListener = function (callback: (changes: { [key: string]: { oldValue: any; newValue: any; } }) => void) {
//     storageListeners.push(callback);
// }
//#endregion

// //#region fake permissions
// augmentedBrowser.permissions = {};
// augmentedBrowser.permissions.request = function () {};
// augmentedBrowser.permissions.onAdded = {};
// augmentedBrowser.permissions.onAdded.addListener = function () {};
// augmentedBrowser.permissions.onRemoved = {};
// augmentedBrowser.permissions.onRemoved.addListener = function () {};
// augmentedBrowser.permissions.contains = function (_: any, callback: (result: boolean) => void) {
//     callback(true);
// };
// //#endregion

// // #region i18n Translation
// augmentedBrowser.i18n = {};
// const langPrefix = "steamDB_";
// let langKey = "";
// export async function getLang() {
//     let language = navigator.language.toLowerCase().split("-")[0];
//     const longLanguage = navigator.language.replaceAll('-', "_");
//     langKey = langPrefix + language;

//     // Make an exception for es-419
//     if (navigator.language === "es-419") {
//         language = 'es_419';
//         langKey = langPrefix + language;
//     }

//     if (localStorage.getItem(langKey + VERSION) === null) {
//         if (localStorage.getItem(langPrefix + longLanguage + VERSION) !== null) {
//             Logger.Log(`using "${longLanguage}" lang`);
//             langKey = langPrefix + longLanguage;
//             return;
//         }
//         Logger.Log(`getting "${language}" lang`);

//         let response = await fetch(CDN + `/_locales/${language}/messages.json`);

//         if (!response.ok) {
//             // Try full language key
//             Logger.Warn(`failed to fetch SteamDB lang file for "${language}". Trying "${longLanguage}"`);
//             langKey = langPrefix + longLanguage;

//             response = await fetch(CDN + `/_locales/${longLanguage}/messages.json`);

//             if (!response.ok) {
//                 Logger.Warn(`failed to fetch SteamDB lang file for "${language}". Falling back to EN.`);
//                 langKey = langPrefix + "en";
//                 response = await fetch(CDN + "/_locales/en/messages.json");
            
//             }
//         }
//         localStorage.setItem(langKey + VERSION, JSON.stringify(await response.json()));
//     } 

//     Logger.Log(`using "${language}" lang`);
// }

// /* example record
// {
//     "message": "$positive$ of the $total$ reviews are positive (all purchase types)",
//     "placeholders": {
//         "positive": {
//             "content": "$1",
//             "example": "123,456"
//         },
//         "total": {
//             "content": "$2",
//             "example": "456,789"
//         }
//     }
// }
// */
// augmentedBrowser.i18n.getMessage = function (messageKey: string, substitutions: string|string[]) {
//     // Ignore invalid message key
//     if (messageKey === '@@bidi_dir') {
//         return messageKey;
//     }

//     if (!Array.isArray(substitutions)) {
//         substitutions = [substitutions];
//     }
//     type LangType = Record<string, { message: string; placeholders?: Record<string, { content: string; }> }>|null;
//     let lang: LangType = JSON.parse(localStorage.getItem(langKey + VERSION) ?? '{}');
//     if (lang === null || Object.keys(lang).length === 0) {
//         Logger.Error('SteamDB lang file not loaded in.');
//         return messageKey;
//     }

//     const langObject = lang[messageKey];
//     if (langObject === undefined) {
//         Logger.Error(`Unknown message key: ${messageKey}`);
//         return messageKey;
//     }

//     let messageTemplate = langObject.message;
//     if (langObject.placeholders) {
//         Object.entries(langObject.placeholders).forEach(([key, value], index) => {
//             const regex = new RegExp(`\\$${key}\\$`, 'g');
//             messageTemplate = messageTemplate.replace(regex, substitutions[index] || value.content);
//         });
//     }

//     return messageTemplate;
// }
// augmentedBrowser.i18n.getUILanguage = function () {
//     return 'en-US';
// }
// // #endregion

//#region getResourceUrl
augmentedBrowser.runtime.getURL = function (res: string) {
    if (res.endsWith('.png') || res.endsWith('.svg')) {
        return getLoopbackCdn(res);
    }
    return getCdn(res);
}
//#endregion

// #region Background messaging
window.clients = {matchAll: () => [{url: 'html/offscreen_domparser.html'}]}
window.chrome.offscreen = {};
window.chrome.offscreen.closeDocument = () => {};

type MessageCallback = (message: any, sender: any, sendResponse: (response: any) => void) => any;

let messageListeners: MessageCallback[] = [];

augmentedBrowser.runtime.onMessage = {};
augmentedBrowser.runtime.onMessage.addListener = (callback: MessageCallback) => {
    messageListeners.push(callback);
};

augmentedBrowser.runtime.sendMessage = function (message: any, callback?: (response: any) => void): void {
    Logger.Debug('Sending message', message);
    messageListeners.forEach((listener) => {
        listener(message, {tab: {}}, (response: any) => {
            if (callback) {
                callback(response);
            }
        });
    });
}

//#endregion

//#region open newly created a tags in own way
let oldCreateElement = document.createElement.bind(document);

// TODO: maybe make this an option
const externalLinks = [
    // TODO: move steamdb to popuplink when it works again
    'steamdb.info',
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
];

const popupLinks = [
    'isthereanydeal.com',
    'howlongtobeat.com'
];

document.createElement = function (tagName: string, options?: ElementCreationOptions) {
    let tag: HTMLAnchorElement = oldCreateElement(tagName, options);

    if (tagName.toLowerCase() === "a") {
        var callback = function(mutationsList: MutationRecord[], observer: MutationObserver) {
            for(let mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'href') {
                    for (const link of externalLinks) {
                        if (tag.href.includes(link)) {
                            tag.href = "steam://openurl_external/" + tag.href;
                            break;
                        }
                    }

                    for (const link of popupLinks) {
                        if (tag.href.includes(link)) {
                            tag.addEventListener('click', (e) => {
                                if (e.ctrlKey) {
                                    return;
                                }

                                e.preventDefault();
                                
                                const event = new MouseEvent('click', { 
                                    bubbles: true,
                                    cancelable: true,
                                    view: window,
                                    ctrlKey: true,
                                });
                                tag.dispatchEvent(event);
                            });
                            break;
                        }
                    }

                    observer.disconnect();
                }
            }
        };

        var observer = new MutationObserver(callback);

        observer.observe(tag, { attributes: true });
    }

    return tag;
}
//#endregion