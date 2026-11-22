// React 18 pipeable SSR can insert NUL at multibyte chunk boundaries.
// Keep async/Suspense rendering and reject immediately on every render error.
import { renderToReadableStream } from 'react-dom/server.browser';
import { text } from 'node:stream/consumers';

export function renderToHtml(app) {
  return new Promise((resolve, reject) => {
    renderToReadableStream(app, { onError: reject })
      .then(async (stream) => {
        await stream.allReady;
        return text(stream);
      })
      .then(resolve, reject);
  });
}
