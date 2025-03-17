/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// TODO: use steam-types
import { Millennium } from '@steambrew/client';
import { initHltbInjection } from './HltbInjection';

// #region Steamid
let steamID = '-1';

async function getSteamId(): Promise<string> {
  const loginUsers = await SteamClient.User.GetLoginUsers();

  return loginUsers[0].avatarUrl.match(/avatarcache\/(\d+)/)[1];
}

if (Millennium.exposeObj) {
  Millennium.exposeObj({
    getSteamId: () => steamID,
  });
}
// #endregion

// Entry point on the front end of your plugin
export default async function PluginMain(): Promise<void> {
  steamID = await getSteamId();

  initHltbInjection();
}
