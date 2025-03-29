import { Millennium } from '@steambrew/client';
import { initHltbInjection } from './HltbInjection';

// #region Steamid
let steamID = '-1';

async function getSteamId(): Promise<string> {
  const loginUsers = await SteamClient.User.GetLoginUsers();

  const match = loginUsers[0]?.avatarUrl.match(/avatarcache\/(\d+)/);
  if (!match) {
    throw new Error('Failed to match avatar URL');
  }

  return match[1] ?? '';
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
