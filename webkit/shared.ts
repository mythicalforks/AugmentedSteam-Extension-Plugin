import { callable, Millennium } from "@steambrew/webkit";

export const VERSION = "4.10";
export let CDN: string;
export let LOOPBACK_CDN: string = 'https://steamloopback.host/AugmentedSteam';
export let MANIFEST: object;
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

export async function initCdn() {
    const getPluginDir = callable('GetPluginDir') as () => Promise<string>;
    const envString = DEV ? 'dev' : 'prod';
    const extensionFolder = (await getPluginDir()).replace(/.*\\([^\\]+)\\([^\\]+)$/, '/$1/$2') + `/AugmentedSteam/dist/${envString}.chrome`;
    CDN = 'https://s.ytimg.com/millennium-virtual' + extensionFolder;
}

export async function initManifest() {
    MANIFEST = JSON.parse(await fetch(getCdn('manifest.json')).then(r => r.text()));
}

declare global{
    interface Window {
        chrome: any;
    }
}

export const Logger = {
    Error: (...message: string[]) => {
        console.error('%c AugmentedSteam plugin ', 'background: red; color: white', ...message);
    },
    Log: (...message: string[]) => {
        console.log('%c AugmentedSteam plugin ', 'background: purple; color: white', ...message);
    },
    Warn: (...message: string[]) => {
        console.warn('%c AugmentedSteam plugin ', 'background: orange; color: white', ...message);
    }
};