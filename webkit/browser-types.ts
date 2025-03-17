export type MessageCallback = (message: unknown, sender: unknown, sendResponse: (response?: unknown) => void) => void | boolean | Promise<unknown>;

declare global {
  interface Window {
    augmentedBrowser: AugmentedBrowser;
  }
}

type storageGet = (items?: string | string[] | Record<string, unknown>, callback?: (result: Record<string, unknown>) => void) => Promise<Record<string, unknown>>;

type storageSet = (item: Record<string, unknown>, callback?: () => void) => Promise<void>;

type storageRemove = (key: string | string[], callback?: () => void) => Promise<void>;

export interface AugmentedBrowser {
  runtime: {
    getManifest(): { version: string; };
    getURL(resource: string): string;
    sendMessage(message: unknown, callback?: (response: unknown) => void): void;

    id: string;
    onInstalled: {
      addListener(callback: () => void): void;
    };
    onStartup: {
      addListener(callback: () => void): void;
    };
    onMessage: {
      addListener(callback: MessageCallback): void;
    };
  };
  contextMenus: {
    onClicked: {
      addListener(): void;
      hasListener(): boolean;
    };
  };
  storage: {
    sync: {
      get: storageGet;
      set: storageSet;
      remove: storageRemove;
    };
    local: {
      get: storageGet;
      set: storageSet;
      remove: storageRemove;
    };
  };
  clients: {
    matchAll(): { url: string; }[];
  };
  offscreen: {
    closeDocument(): void;
  };
}
