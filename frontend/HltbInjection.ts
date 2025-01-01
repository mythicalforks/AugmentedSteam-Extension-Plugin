import { Millennium } from '@steambrew/client';
import { getHltbData } from './HtlbData';

declare const SteamUIStore: any;

function createInfoWithUrl(title: string, description: string, url: string) {
    const infoItem = document.createElement('div');
    infoItem.classList.add('_2ZcNQxY8YknnhNa4ZvIoU4', 'hltb-info');
    infoItem.innerHTML = `
        <div class="_1vYL2q-91QLy-FBzntE7E5">${title}</div>
        <div class="_-9icu8LqT7inRSJISgnkh">
            <a class="_2j8Xh4pPOOgF4MF6FVUI28" href="steam://openurl_external/${url}">${description}</a>
        </div>
    `;
    return infoItem;
}

function toHrs(minutes: number | null): string {
    return minutes !== null ? `${(minutes / 60).toFixed(1)} hrs` : '--';
}

let mainDocument: Document;
let lastAppID = '';

async function findElement(selector: string): Promise<Element | null> {
    const elements = await Millennium.findElement(mainDocument, selector);
    return elements.length !== 0 ? elements[0] : null;
}

async function injectHltbData(appId: string): Promise<void> {
    mainDocument.querySelectorAll('.hltb-info').forEach((element) => element.remove());
    const infoContainer = await findElement('._3cntzF30xAuwn1ARWJjvCb._1uS70KI6ZbUE94jUB27ioB');
    if (!infoContainer) {
        console.error('[AugmentedSteam] Could not find info container.');
        return;
    }

    const appData = await getHltbData(appId);

    if (appData === null) {
        return;
    }

    infoContainer.appendChild(createInfoWithUrl('Main Story:', toHrs(appData.story), appData.url));
    infoContainer.appendChild(createInfoWithUrl('Main + Extras:', toHrs(appData.extras), appData.url));
    infoContainer.appendChild(createInfoWithUrl('Completionist:', toHrs(appData.complete), appData.url));
}

function attachListeners(appId: string, infoButton: HTMLElement) {
    const handleInteraction = async () => {
        if (infoButton.getAttribute('hltb-injected') === 'true') {
            return;
        }

        infoButton.setAttribute('hltb-injected', 'true');

        await injectHltbData(appId);
    };

    infoButton.addEventListener('click', handleInteraction);
    infoButton.addEventListener('mouseenter', handleInteraction);

    // Is info element open
    if (mainDocument.querySelector('._3s6_6sN8LyrlTHc_z6VfNU')) {
        handleInteraction();
    }
}

async function addHltbData() {
    const appIconElement = await findElement('._3NBxSLAZLbbbnul8KfDFjw._2dzwXkCVAuZGFC-qKgo8XB') as HTMLImageElement;
    const infoButton = (await findElement('._3VQUewWB8g6Z5qB4C7dGFr ._3qDWQGB0rtwM3qpXTb11Q-.Focusable .zvLq1GUCH3yLuqv_TXBJ1')).parentElement;

    if (!appIconElement || !infoButton) {
        setTimeout(addHltbData, 100);
        return;
    }

    const appId = appIconElement.src.match(/assets\/(\d+)/)?.[1];
    if (!appId) {
        console.error('[AugmentedSteam] Could not find app id');
        setTimeout(addHltbData, 100);
        return;
    }

    if (appId === lastAppID || infoButton.getAttribute('hltb-click-listener') === 'true') {
        setTimeout(addHltbData, 100);
        return;
    }

    lastAppID = appId;
    infoButton.setAttribute('hltb-click-listener', 'true');

    attachListeners(appId, infoButton);

    setTimeout(addHltbData, 100);
}

export function initHltbInjection() {
    mainDocument = SteamUIStore.WindowStore.SteamUIWindows[0].m_BrowserWindow.document;

    addHltbData();
}
