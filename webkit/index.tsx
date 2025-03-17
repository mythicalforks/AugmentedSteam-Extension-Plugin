import './browser';
// import { getLang } from './browser';
import { callable, Millennium } from '@steambrew/webkit';
import { retrieveUrlQuery } from './browser';
import { createFakeSteamHeader } from './header';
import { injectPreferences } from './preferences';
import { getNeededScripts } from './script-loading';
import { DEV, getCdn, initCdn, Logger, LOOPBACK_CDN, sleep } from './shared';

async function loadScript(src: string) {
    let content = await fetch(src).then(response => response.text());
    content = content
        .replaceAll('chrome', 'augmentedBrowser')
        .replaceAll('clients', 'augmentedBrowser.clients');
    content += '\n//# sourceURL=' + src;

    return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        // script.src = src;
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = content;
        script.setAttribute('original-src', src);

        script.onload = () => resolve();

        script.onerror = () => reject(new Error('Failed to load script'));

        document.head.appendChild(script);
        resolve();
    });
}

async function loadStyle(src: string) {
    let content = await fetch(src).then(response => response.text());
    content = content.replaceAll('chrome-extension://__MSG_@@extension_id__', LOOPBACK_CDN);

    return new Promise<void>((resolve, reject) => {
        const style = document.createElement('style');
        style.setAttribute('original-src', src);
        style.innerHTML = content;

        style.onload = () => resolve();

        style.onerror = () => reject(new Error('Failed to load style'));

        document.head.appendChild(style);
    });
}

async function loadJsScripts(scripts: string[]) {
    const promises = [];
    for (const script of scripts.filter(script => script.includes('.js'))) {
        promises.push(loadScript(getCdn(script)));
    }

    return Promise.all(promises);
}

function loadCssScripts(scripts: string[]) {
    const promises = [];
    for (const style of scripts.filter(script => script.includes('.css'))) {
        promises.push(loadStyle(getCdn(style)));
    }

    return Promise.all(promises);
}

const startTime = performance.now();

async function testPerformance() {
    await Millennium.findElement(document, '.es_highlighted_owned');

    Logger.Log(`Took Augmented Steam ${performance.now() - startTime}ms to load`);

    if (DEV) {
        // @ts-expect-error dev property
        window.reset = reset;

        const prevTime = localStorage.getItem('time') ?? 0;
        localStorage.setItem('time', (performance.now() - startTime + Number(prevTime)).toString());
        const prevCounter = localStorage.getItem('counter') ?? 0;
        localStorage.setItem('counter', (Number(prevCounter) + 1).toString());
        Logger.Log(`Avg: ${Number(localStorage.getItem('time')) / Number(localStorage.getItem('counter'))}`);
    }
}

function reset() {
    localStorage.removeItem('time');
    localStorage.removeItem('counter');
}

const setRetrieveUrlResponse = callable<[{ response: string }], void>('SetRetrieveUrlResponse');

async function retrieveUrl() {
    const queryParams = new URLSearchParams(window.location.search);
    const retrieveUrl = queryParams.get(retrieveUrlQuery);
    if (retrieveUrl === null) {
        return;
    }

    const wnd = window.open(retrieveUrl, undefined, 'width=0,height=1000000,left=0,top=0'); // We set height really high so for some reason the width becomes 0
    if (!wnd) {
        Logger.Error('failed to open new window');
        return;
    }

    let isLoaded = false;
    const startTime = Date.now();
    while (!isLoaded && Date.now() - startTime < 5000) {
        isLoaded = wnd.document.readyState === 'complete' && wnd.document.body.innerText !== '';

        await sleep(100);
    }

    const body = wnd.document.body.innerText;
    wnd.close();
    window.close();

    await setRetrieveUrlResponse({response: body});
}

export default async function WebkitMain() {
    const href = window.location.href;

    if (href.includes('isthereanydeal.com')) {
        await Millennium.findElement(document, '.error-message');
        // Page errored, do a force reload
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }

    if (href.includes(`${retrieveUrlQuery}=`)) {
        retrieveUrl();
        return;
    }


    if (!href.includes('https://store.steampowered.com') && !href.includes('https://steamcommunity.com')) {
        return;
    }

    testPerformance();

    // Log all await calls
    // const originalThen = Promise.prototype.then;

    // Promise.prototype.then = function (onFulfilled, onRejected) {
    //     const stack = new Error().stack;
    //     console.log("Await called:", stack);
    //     return originalThen.call(this, onFulfilled, onRejected);
    // };

    Logger.Log('plugin is running');

    await createFakeSteamHeader();

    await initCdn();

    const scripts = getNeededScripts();

    await Promise.all([
        loadCssScripts(scripts),
        loadScript(getCdn('js/background.js')),
        loadScript(getCdn('js/offscreen_domparser.js')),
    ]);

    await loadJsScripts(scripts);

    if (window.location.href.includes('https://store.steampowered.com/account')) {
        injectPreferences();
    }
}
