/**
 Extensions that read or write to web pages utilize a content script. The content script
 contains JavaScript that executes in the contexts of a page that has been loaded into
 the browser. Content scripts read and modify the DOM of web pages the browser visits.
 https://developer.chrome.com/docs/extensions/mv3/architecture-overview/#contentScripts
 */
import {
  AuthenticationRequestEvent,
  DomEventName,
  ProfileUpdateRequestEvent,
  SignatureRequestEvent,
  TransactionRequestEvent,
} from '@shared/inpage-types';
import {
  CONTENT_SCRIPT_PORT,
  ExternalMethods,
  LegacyMessageFromContentScript,
  LegacyMessageToContentScript,
  MESSAGE_SOURCE,
} from '@shared/message-types';
import { RouteUrls } from '@shared/route-urls';
import { getEventSourceWindow } from '@shared/utils/get-event-source-window';

// Legacy messaging to work with older versions of Connect
window.addEventListener('message', event => {
  const { data } = event;
  if (data.source === 'blockstack-app') {
    const { method } = data;
    if (method === 'getURL') {
      const url = chrome.runtime.getURL('index.html');
      const source = getEventSourceWindow(event);
      source?.postMessage(
        {
          url,
          method: 'getURLResponse',
          source: 'blockstack-extension',
        },
        event.origin
      );
      return;
    }
  }
});

// Connection to background script - fires onConnect event in background script
// and establishes two-way communication
const backgroundPort = chrome.runtime.connect({ name: CONTENT_SCRIPT_PORT });

// Sends message to background script that an event has fired
function sendMessageToBackground(message: any) {
  backgroundPort.postMessage(message);
}

// Receives message from background script to execute in browser
chrome.runtime.onMessage.addListener((message: LegacyMessageToContentScript) => {
  if (message.source === MESSAGE_SOURCE) {
    // Forward to web app (browser)
    window.postMessage(message, window.location.origin);
  }
});

interface LegacyForwardDomEventToBackgroundArgs {
  payload: string;
  method: LegacyMessageFromContentScript['method'];
  urlParam: string;
  path: RouteUrls;
}

function legacyForwardDomEventToBackground({
  payload,
  method,
}: LegacyForwardDomEventToBackgroundArgs) {
  sendMessageToBackground({
    method,
    payload,
    source: MESSAGE_SOURCE,
  });
}

// Listen for a CustomEvent (auth request) coming from the web app
document.addEventListener(DomEventName.authenticationRequest, ((
  event: AuthenticationRequestEvent
) => {
  legacyForwardDomEventToBackground({
    path: RouteUrls.Onboarding,
    payload: event.detail.authenticationRequest,
    urlParam: 'authRequest',
    method: ExternalMethods.authenticationRequest,
  });
}) as EventListener);

// Listen for a CustomEvent (transaction request) coming from the web app
document.addEventListener(DomEventName.transactionRequest, ((event: TransactionRequestEvent) => {
  legacyForwardDomEventToBackground({
    path: RouteUrls.TransactionRequest,
    payload: event.detail.transactionRequest,
    urlParam: 'request',
    method: ExternalMethods.transactionRequest,
  });
}) as EventListener);

// Listen for a CustomEvent (signature request) coming from the web app
document.addEventListener(DomEventName.signatureRequest, ((event: SignatureRequestEvent) => {
  legacyForwardDomEventToBackground({
    path: RouteUrls.SignatureRequest,
    payload: event.detail.signatureRequest,
    urlParam: 'request',
    method: ExternalMethods.signatureRequest,
  });
}) as EventListener);

// Listen for a CustomEvent (structured data signature request) coming from the web app
document.addEventListener(DomEventName.structuredDataSignatureRequest, ((
  event: SignatureRequestEvent
) => {
  legacyForwardDomEventToBackground({
    path: RouteUrls.SignatureRequest,
    payload: event.detail.signatureRequest,
    urlParam: 'request',
    method: ExternalMethods.structuredDataSignatureRequest,
  });
}) as EventListener);

// Listen for a CustomEvent (profile update request) coming from the web app
document.addEventListener(DomEventName.profileUpdateRequest, ((
  event: ProfileUpdateRequestEvent
) => {
  legacyForwardDomEventToBackground({
    path: RouteUrls.ProfileUpdateRequest,
    payload: event.detail.profileUpdateRequest,
    urlParam: 'request',
    method: ExternalMethods.profileUpdateRequest,
  });
}) as EventListener);

// RPC Request API
interface ForwardDomEventToBackgroundArgs {
  method: string;
  params: any[];
  id: string;
}
function forwardDomEventToBackground({ params, method, id }: ForwardDomEventToBackgroundArgs) {
  sendMessageToBackground({
    source: MESSAGE_SOURCE,
    method,
    params,
    id,
  });
}
document.addEventListener(DomEventName.request, (event: any) => {
  // console.log('rpc event', event.detail);
  forwardDomEventToBackground({
    params: event.detail.params,
    method: event.detail.method,
    id: event.detail.id,
  });
});

// Inject inpage script (Stacks Provider)
const inpage = document.createElement('script');
inpage.src = chrome.runtime.getURL('inpage.js');
inpage.id = 'stacks-wallet-provider';
document.body.appendChild(inpage);
