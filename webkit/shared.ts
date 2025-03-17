import { callable } from '@steambrew/webkit';

export const VERSION = '4.2.1';
export let CDN: string;
const COMMIT_SHA = 'a9272e40f9a561cd756304f90b07858b6b2607ed';
export const LOOPBACK_CDN = `https://cdn.jsdelivr.net/gh/IsThereAnyDeal/AugmentedSteam@${COMMIT_SHA}/src`;
export const DEV = false;

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
    CDN = 'https://pseudo.millennium.app' + extensionFolder;
}

export const Logger = {
    Error: (...message: unknown[]) => {
        console.error('%c AugmentedSteam plugin ', 'background: red; color: white', ...message);
    },
    Log: (...message: unknown[]) => {
        console.log('%c AugmentedSteam plugin ', 'background: purple; color: white', ...message);
    },
    Debug: (...message: unknown[]) => {
        console.debug('%c AugmentedSteam plugin ', 'background: black; color: white', ...message);
    },
    Warn: (...message: unknown[]) => {
        console.warn('%c AugmentedSteam plugin ', 'background: orange; color: white', ...message);
    },
};

export function sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}
