export const toastListeners = new Set();
export const toast = (msg) => toastListeners.forEach((l) => l(msg));
