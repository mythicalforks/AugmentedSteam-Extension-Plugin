import { Millennium } from '@steambrew/client';
import { getHltbData } from './HtlbData';

declare const SteamUIStore: any;

function createInfoWithUrl(title: string, description: string, url: string) {
    const infoContainer = document.createElement('div');
    infoContainer.classList.add('_2ZcNQxY8YknnhNa4ZvIoU4', 'hltb-info');
    infoContainer.innerHTML = `
        <div class="_1vYL2q-91QLy-FBzntE7E5">${title}</div>
        <div class="_-9icu8LqT7inRSJISgnkh">
            <a class="_2j8Xh4pPOOgF4MF6FVUI28" href="steam://openurl_external/${url}">${description}</a>
        </div>
    `;
    return infoContainer;
}

function toHrs(minutes: number | null): string {
    if (minutes === null) {
        return '--';
    }
    return `${(minutes / 60).toFixed(1)} hrs`;
}

let mainDocument: Document;

let lastAppID = '';

async function addHltbData() {
    console.log('loop');
    const appIconElement = (await Millennium.findElement(mainDocument, '._3NBxSLAZLbbbnul8KfDFjw._2dzwXkCVAuZGFC-qKgo8XB'))[0] as HTMLImageElement;
    const infoButton = (await Millennium.findElement(mainDocument, '._3VQUewWB8g6Z5qB4C7dGFr ._3qDWQGB0rtwM3qpXTb11Q-.Focusable .zvLq1GUCH3yLuqv_TXBJ1'))[0].parentElement;
    const appId = appIconElement.src.match(/assets\/(\d+)/)[1];
    const appIdEqual = appId === lastAppID;
    lastAppID = appId;
    if (infoButton.getAttribute('hltb-click-listener') === 'true' || appIdEqual) {
        setTimeout(addHltbData, 100);
        return;
    }

    infoButton.setAttribute('hltb-click-listener', 'true');

    const addHltbDom = async () => {
        console.log('clicked');
        if (infoButton.getAttribute('hltb-injected') === 'true') {
            setTimeout(addHltbData, 100);
            return;
        }
        console.log('start injected');
        infoButton.setAttribute('hltb-injected', 'true');

        const infoContainer = (await Millennium.findElement(mainDocument, '._3cntzF30xAuwn1ARWJjvCb._1uS70KI6ZbUE94jUB27ioB'))[0];

        const appData = await getHltbData(appId);

        mainDocument.querySelectorAll('.hltb-info').forEach((element) => {
            element.remove();
        });

        if (appData === null) {
            return;
        }

        infoContainer.appendChild(createInfoWithUrl('Main Story:', toHrs(appData.story), appData.url));
        infoContainer.appendChild(createInfoWithUrl('Main + Extras:', toHrs(appData.extras), appData.url));
        infoContainer.appendChild(createInfoWithUrl('Completionist:', toHrs(appData.complete), appData.url));
    };

    infoButton.addEventListener('click', addHltbDom);
    infoButton.addEventListener('mouseenter', addHltbDom);

    // Is info element open
    if (mainDocument.querySelector('._3s6_6sN8LyrlTHc_z6VfNU')) {
        addHltbDom();
    }
    setTimeout(addHltbData, 100);
}

export function initHltbInjection() {
    mainDocument = SteamUIStore.WindowStore.SteamUIWindows[0].m_BrowserWindow;

    addHltbData();
}
