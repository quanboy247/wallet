import * as Sentry from '@sentry/react';
import { getStoredState } from 'redux-persist';

import { logger } from '@shared/logger';
import {
  CONTENT_SCRIPT_PORT,
  LegacyMessageFromContentScript,
  MESSAGE_SOURCE,
} from '@shared/message-types';
import { RouteUrls } from '@shared/route-urls';
import { persistConfig } from '@shared/storage';
import { initSentry } from '@shared/utils/analytics';
import { warnUsersAboutDevToolsDangers } from '@shared/utils/dev-tools-warning-log';

import { RootState } from '@app/store';

import { backupOldWalletSalt } from './backup-old-wallet-salt';
import { initContextMenuActions } from './init-context-menus';
import {
  handleLegacyExternalMethodFormat,
  isLegacyMessage,
} from './legacy-external-message-handler';
import { internalBackgroundMessageHandler } from './message-handler';

// void addRefererHeaderRequestListener();
initSentry();
initContextMenuActions();
backupOldWalletSalt();
warnUsersAboutDevToolsDangers();

const IS_TEST_ENV = process.env.TEST_ENV === 'true';

chrome.runtime.onInstalled.addListener(details => {
  Sentry.wrap(async () => {
    if (details.reason === 'install' && !IS_TEST_ENV) {
      await chrome.tabs.create({
        url: chrome.runtime.getURL(`index.html#${RouteUrls.Onboarding}`),
      });
    }
  });
});

//
// Listen for connection to the content-script - port for two-way communication
chrome.runtime.onConnect.addListener(port =>
  Sentry.wrap(() => {
    if (port.name !== CONTENT_SCRIPT_PORT) return;

    port.onMessage.addListener((message: LegacyMessageFromContentScript, port) => {
      if (!port.sender?.tab?.id)
        return logger.error('Message reached background script without a corresponding tab');

      // Chromium/Firefox discrepancy
      const originUrl = port.sender?.origin ?? port.sender?.url;

      if (!originUrl)
        return logger.error('Message reached background script without a corresponding origin');

      console.log(message);

      if (isLegacyMessage(message)) {
        void handleLegacyExternalMethodFormat(message, port);
        return;
      }

      if (message.method === 'currentNetwork') {
        void rpcRequestHandler(message, port);
      }

      return;

      // TODO:
      // Here we'll handle all messages using the rpc style comm method
      // For now all messages are handled as legacy format
    });
  })
);
export async function rpcRequestHandler(message: any, port: chrome.runtime.Port) {
  const { method, id } = message;

  const state = (await getStoredState(persistConfig)) as RootState;

  console.log({ state });

  switch (method) {
    case 'currentNetwork': {
      console.log({ tabId: port.sender?.tab?.id });
      chrome.tabs.sendMessage(port.sender?.tab?.id, {
        source: MESSAGE_SOURCE,
        id,
        network: state.networks.currentNetworkId,
      });
      return;
    }
  }
}

//
// Events from the extension frames script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) =>
  Sentry.wrap(() => {
    void internalBackgroundMessageHandler(message, sender, sendResponse);
    // Listener fn must return `true` to indicate the response will be async
    return true;
  })
);

if (IS_TEST_ENV) {
  // Expose a helper function to open a new tab with the wallet from tests
  (window as any).openOptionsPage = (page: string) => chrome.runtime.getURL(`index.html#${page}`);
}
