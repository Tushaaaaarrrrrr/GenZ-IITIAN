import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {PostHogProvider} from '@posthog/react';
import posthog from 'posthog-js';

import {hydratePublic} from './public/entry-client';
import './index.css';

const posthogKey = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    defaults: '2026-05-30',
  });
}

const initial = document.getElementById('public-data');
if (initial?.textContent) {
  hydratePublic(JSON.parse(initial.textContent));
} else {
const {default:App} = await import('./App.tsx');
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <App />
    </PostHogProvider>
  </StrictMode>,
);

}
