import { Millennium } from '@steambrew/client';
import { initHltbInjection } from './HltbInjection';

//#region Steamid
let steamID = -1;

async function getSteamId() {
    const loginUsers = await SteamClient.User.GetLoginUsers();

    return loginUsers[0].avatarUrl.match(/avatarcache\/(\d+)/)[1];
}

// @ts-expect-error Millennium.exposeObj is null in webkit
Millennium.exposeObj({
    getSteamId: () => steamID,
});
//#endregion

// Entry point on the front end of your plugin
export default async function PluginMain() {
    steamID = await getSteamId();

    initHltbInjection();
}
