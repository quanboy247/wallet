export const initialParams = new URLSearchParams(window.location.href.split('?')[1]);

export const flow = initialParams.get('flow');
export const origin = initialParams.get('origin');
