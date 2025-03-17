export interface MessageCallback {
  (message: unknown, sender: unknown, sendResponse: (response?: unknown) => void): void | boolean | Promise<unknown>;
}

declare global {
  interface Window {
    augmentedBrowser: AugmentedBrowser;
  }
}

type storageGet = (items?: string | string[] | Record<string, unknown>, callback?: Function) => Promise<Record<string, unknown>>;

type storageSet = (item: Record<string, unknown>, callback?: Function) => Promise<void>;

type storageRemove = (key: string | string[], callback?: Function) => Promise<void>;

export interface AugmentedBrowser {
  runtime: {
    getManifest: () => { version: string };
    id: string;
    onInstalled: {
      addListener: (callback: () => void) => void;
    };
    onStartup: {
      addListener: (callback: () => void) => void;
    };
    getURL: (resource: string) => string;
    onMessage: {
      addListener: (callback: MessageCallback) => void;
    };
    sendMessage: (message: unknown, callback?: (response: unknown) => void) => void;
  };
  contextMenus: {
    onClicked: {
      addListener: () => void;
      hasListener: () => boolean;
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
    matchAll: () => unknown;
  };
  offscreen: {
    closeDocument: () => unknown;
  };
}
