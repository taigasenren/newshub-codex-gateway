import {fileURLToPath} from 'node:url';

// Render's native Node runtime can install and launch the pinned Codex CLI
// without a global installation or a paid container service.
process.env.NEWSHUB_BIND ||= '0.0.0.0';
process.env.NEWSHUB_CODEX_BIN ||= fileURLToPath(new URL('./node_modules/.bin/codex',import.meta.url));
await import('./server.mjs');
