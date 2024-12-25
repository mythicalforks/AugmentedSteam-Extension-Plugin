import './browser';
// import { getLang } from './browser';
import { getNeededScripts } from './script-loading';
import { getCdn, initCdn, initManifest, Logger, LOOPBACK_CDN } from "./shared";
import { createFakeHeader } from './header';

async function loadScript(src: string) {
    return new Promise<void>((resolve, reject) => {
        var script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', src);

        script.addEventListener('load', () => {
            resolve();
        });

        script.addEventListener('error', () => {
            reject(new Error('Failed to load script'));
        });

        document.head.appendChild(script);
    });
}

function loadScriptWithContent(scriptString: string) {
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.innerHTML = scriptString;

    document.head.appendChild(script);
}

async function loadStyle(src: string) {
    let content = await fetch(src).then(response => response.text());
    // url(https://s.ytimg.com/millennium-virtual/plugins/AugmentedSteam-plugin/AugmentedSteam/dist/dev.chrome/img/steamdb_store.png)
    content = content.replaceAll('chrome-extension://__MSG_@@extension_id__', LOOPBACK_CDN);

    return new Promise<void>((resolve, reject) => {
        var style = document.createElement('style');
        style.setAttribute('type', 'text/css');
        style.setAttribute('original-src', src);
        style.innerHTML = content;

        style.addEventListener('load', () => {
            resolve();
        }); 

        style.addEventListener('error', () => {
            reject(new Error('Failed to load style'));
        });

        document.head.appendChild(style);
    });
}

async function loadPageSpecificScripts() {
    let scripts = getNeededScripts();

    for (const script of scripts.filter(script => script.includes(".js"))) {
        loadScript(getCdn(script));
    }

    for (const style of scripts.filter(script => script.includes(".css"))) {
        loadStyle(getCdn(style));
    }
}



export default async function WebkitMain () {
    const href = window.location.href;

    if (!href.includes("https://store.steampowered.com") && !href.includes("https://steamcommunity.com")) {
        return;
    }

    // Log all await calls
    // const originalThen = Promise.prototype.then;

    // Promise.prototype.then = function (onFulfilled, onRejected) {
    //     const stack = new Error().stack;
    //     console.log("Await called:", stack);
    //     return originalThen.call(this, onFulfilled, onRejected);
    // };

    createFakeHeader();
    
    Logger.Log("plugin is running");
    await initCdn();
    await initManifest();

    const fakeHeader = document.createElement('div');
    fakeHeader.id = 'global_header';
    document.body.appendChild(fakeHeader);

    await loadScript(getCdn('js/background.js'));

    loadPageSpecificScripts();
}