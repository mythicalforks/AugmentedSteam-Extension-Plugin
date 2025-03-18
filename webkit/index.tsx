/* eslint-disable no-duplicate-imports */
import { callable, Millennium } from '@steambrew/webkit';
import './browser';
import { retrieveUrlQuery } from './browser';
import { createFakeSteamHeader } from './header';
import { injectPreferences } from './preferences';
import { getNeededScripts } from './script-loading';
import { DEV, getCdn, initCdn, Logger, LOOPBACK_CDN, sleep } from './shared';

async function loadScript(src: string): Promise<void> {
  let content = await fetch(src).then(async response => response.text());
  content = content
    .replaceAll('chrome', 'augmentedBrowser')
    .replaceAll('clients', 'augmentedBrowser.clients');
  content += `\n//# sourceURL=${src}`;

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    // script.src = src;
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = content;
    script.setAttribute('original-src', src);

    script.onload = (): void => {
      resolve();
    };

    script.onerror = (): void => {
      reject(new Error('Failed to load script'));
    };

    document.head.appendChild(script);
    resolve();
  });
}

async function loadStyle(src: string): Promise<void> {
  let content = await fetch(src).then(async response => response.text());
  content = content.replaceAll('chrome-extension://__MSG_@@extension_id__', LOOPBACK_CDN);

  return new Promise<void>((resolve, reject) => {
    const style = document.createElement('style');
    style.setAttribute('original-src', src);
    style.innerHTML = content;

    style.onload = (): void => {
      resolve();
    };

    style.onerror = (): void => {
      reject(new Error('Failed to load style'));
    };

    document.head.appendChild(style);
  });
}

async function loadJsScripts(scripts: string[]): Promise<void[]> {
  const promises = [];
  const filteredScripts = scripts.filter(script => script.includes('.js'));

  for (const script of filteredScripts) {
    promises.push(loadScript(getCdn(script)));
  }

  return Promise.all(promises);
}

async function loadCssScripts(scripts: string[]): Promise<void[]> {
  const promises = [];
  const filteredStyles = scripts.filter(script => script.includes('.css'));

  for (const style of filteredStyles) {
    promises.push(loadStyle(getCdn(style)));
  }

  return Promise.all(promises);
}

const startTime = performance.now();

async function testPerformance(): Promise<void> {
  await Millennium.findElement(document, '.es_highlighted_owned');

  Logger.log(`Took Augmented Steam ${performance.now() - startTime}ms to load`);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (DEV) {
    // @ts-expect-error dev property
    window.reset = reset;

    const prevTime = localStorage.getItem('time') ?? 0;
    localStorage.setItem('time', (performance.now() - startTime + Number(prevTime)).toString());
    const prevCounter = localStorage.getItem('counter') ?? 0;
    localStorage.setItem('counter', (Number(prevCounter) + 1).toString());
    Logger.log(`Avg: ${Number(localStorage.getItem('time')) / Number(localStorage.getItem('counter'))}`);
  }
}

function reset(): void {
  localStorage.removeItem('time');
  localStorage.removeItem('counter');
}

const setRetrieveUrlResponse = callable<[{ response: string; }], void>('SetRetrieveUrlResponse');

async function retrieveUrl(): Promise<void> {
  const queryParams = new URLSearchParams(window.location.search);
  const url = queryParams.get(retrieveUrlQuery);
  if (url === null) {
    return;
  }

  const wnd = window.open(url, undefined, 'width=0,height=1000000,left=0,top=0'); // We set height really high so for some reason the width becomes 0
  if (!wnd) {
    Logger.error('failed to open new window');

    return;
  }

  let isLoaded = false;
  const timeoutTime = Date.now();
  while (!isLoaded && Date.now() - timeoutTime < 5000) {
    isLoaded = wnd.document.readyState === 'complete' && wnd.document.body.innerText !== '';

    // eslint-disable-next-line no-await-in-loop
    await sleep(100);
  }

  const body = wnd.document.body.innerText;
  wnd.close();
  window.close();

  await setRetrieveUrlResponse({ response: body });
}

export default async function WebkitMain(): Promise<void> {
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

  Logger.log('plugin is running');

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
