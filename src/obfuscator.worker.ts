import { obfuscate } from './prometheus-bundle.js';

self.onmessage = (e) => {
  const { code, config } = e.data;
  try {
    const result = obfuscate(code, config);
    self.postMessage({ success: true, result });
  } catch (error: any) {
    self.postMessage({ success: false, error: error.message || String(error) });
  }
};
