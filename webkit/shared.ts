import { callable } from "@steambrew/webkit";

export const VERSION = "4.2.1";
export let CDN: string;
export let LOOPBACK_CDN: string = 'https://steamloopback.host/AugmentedSteam';
export const DEV = true;

export function getCdn(path: string) {
    if (path.startsWith('/')) {
        return `${CDN}${path}`;
    }

    return `${CDN}/${path}`;
}

export function getLoopbackCdn(path: string) {
    if (path.startsWith('/')) {
        return `${LOOPBACK_CDN}${path}`;
    }

    return `${LOOPBACK_CDN}/${path}`;
}

const PLUGIN_DIR_STORAGE = 'augmented_plugin_dir';
const getPluginDir = callable<[], string>('GetPluginDir');

export async function initCdn() {
    let pluginDir = sessionStorage.getItem(PLUGIN_DIR_STORAGE);
    if (pluginDir === null) {
        pluginDir = await getPluginDir();
        sessionStorage.setItem(PLUGIN_DIR_STORAGE, pluginDir);
    }
    const envString = DEV ? 'dev' : 'prod';
    const extensionFolder = pluginDir.replace(/.*\\([^\\]+)\\([^\\]+)$/, '/$1/$2') + `/AugmentedSteam/dist/${envString}.chrome`;
    CDN = 'https://s.ytimg.com/millennium-virtual' + extensionFolder;
}

declare global{
    interface Window {
        augmentedBrowser: any;
        /** @deprecated Use `augmentedBrowser` instead when possible. */
        chrome: any;
        clients: {matchAll: () => any[]};
    }
}

export const Logger = {
    Error: (...message: any[]) => {
        console.error('%c AugmentedSteam plugin ', 'background: red; color: white', ...message);
    },
    Log: (...message: any[]) => {
        console.log('%c AugmentedSteam plugin ', 'background: purple; color: white', ...message);
    },
    Debug: (...message: any[]) => {
        console.debug('%c AugmentedSteam plugin ', 'background: black; color: white', ...message);
    },
    Warn: (...message: any[]) => {
        console.warn('%c AugmentedSteam plugin ', 'background: orange; color: white', ...message);
    }
};