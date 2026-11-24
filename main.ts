// u-myronera-post-the-meme-win-the-feed-2de960bf — entry program (Node 22, standard library only).
//
// The entry is the X post itself: one post of your own on X carrying the
// meme image (meme.png, made by the agent in this build session), with
// @_myronera and your make.fun play code in its own text. POST.json at
// the repository root names that post.
//
// The url is an X post's address, https://x.com/<handle>/status/<id> (or
// twitter.com, www./mobile. prefixes, or /i/web/status/<id>); a query or
// fragment after it is read past. A placeholder address is refused, so the
// gate never passes until POST.json names the real posted post. This
// program copies POST.json to /output/POST.json and nothing else: nothing
// it writes about the post is scored — the house reads the post itself
// from X (via FxTwitter) and scores likes + reposts + quotes at the deadline.
//
// Run locally to test:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
// and check that out/POST.json is byte-identical to POST.json.

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const POST_URL_RE = /^https?:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/([A-Za-z0-9_]+\/status\/\d+|i\/web\/status\/\d+)$/;

function fail(message: string): never {
  console.error(`u-myronera-post-the-meme-win-the-feed-2de960bf: ${message}`);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });

const postPath = join(BOT_DIR, 'POST.json');
let parsed: unknown;
try {
  parsed = JSON.parse(readFileSync(postPath, 'utf8'));
} catch (err) {
  fail(`POST.json could not be read from ${BOT_DIR}: ${(err as Error).message}`);
}

if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
  fail('POST.json must be a JSON object with a url field.');
}
const url = (parsed as { url?: unknown }).url;
if (typeof url !== 'string' || !POST_URL_RE.test(url.split(/[?#]/)[0])) {
  fail(`POST.json url is not an X post address: ${String(url)}`);
}

try {
  copyFileSync(postPath, join(OUTPUT_DIR, 'POST.json'));
} catch (err) {
  fail(`POST.json could not be copied to ${OUTPUT_DIR}: ${(err as Error).message}`);
}

console.log(`POST.json copied to ${OUTPUT_DIR}/POST.json for ${url}`);
