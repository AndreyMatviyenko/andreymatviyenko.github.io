import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const output = path.resolve(process.argv[2] || "_site");
const prefix = (process.env.ELEVENTY_PATH_PREFIX || "").replace(/^\/+|\/+$/g, "");
const basePath = prefix ? `/${prefix}/` : "/";
const origin = process.env.SITE_URL || "https://andreymatviyenko.github.io";
const pages = ["", "en/", "front-end/", "en/front-end/"];
const documents = new Map();
const { gameEnabled } = JSON.parse(await readFile(new URL("../src/_data/site.json", import.meta.url), "utf8"));

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (file.endsWith(".html")) documents.set(file, await readFile(file, "utf8"));
  }
}
await walk(output);
assert.equal(documents.size, 7, "Four profiles, two compatibility redirects, and 404 are required");
assert.ok(![...documents.keys()].some((file) => path.relative(output, file).startsWith(`uk${path.sep}`)), "The /uk/ routes must not be generated");

for (const route of pages) {
  const html = documents.get(path.join(output, route, "index.html"));
  assert.ok(html, `Missing profile: ${route}`);
  const lang = route.startsWith("en/") ? "en" : "uk";
  assert.ok(html.includes(`<html lang="${lang}">`), `Wrong language: ${route}`);
  const profile = route.includes("front-end") ? "frontend" : "deftech";
  assert.ok(html.includes(`class="profile-${profile}"`), `Wrong theme: ${route}`);
  assert.ok(html.indexOf('class="profile-switch ') > html.indexOf('<footer class="site-footer '), "The profile switch must follow the footer in reading order");
  const resumeFile = profile === "frontend" ? "Andrey_Matviyenko_Resume_SE.pdf" : "Andrey_Matviyenko_Resume_Embedded_UAV_Engineer.pdf";
  const resumePath = `${basePath}assets/resume/${resumeFile}`;
  const resumeLinks = [...html.matchAll(/class="[^"]*\b(?:nav-resume|resume-link)\b[^"]*" href="([^"]+)"/g)];
  assert.equal(resumeLinks.length, 3, `Navigation, intro, and experience resume links are required: ${route}`);
  for (const [, resumeUrl] of resumeLinks) {
    assert.equal(resumeUrl, resumePath, `Wrong resume for ${route}`);
  }
  assert.ok(html.includes(`rel="canonical" href="${new URL(`${basePath}${route}`, origin).href}"`), `Wrong canonical: ${route}`);
  assert.equal((html.match(/class="project(?: [^"]*)?"/g) || []).length, profile === "frontend" ? 0 : 6, `Wrong standalone project selection: ${route}`);
  if (profile === "frontend") {
    assert.equal((html.match(/class="experience-entry /g) || []).length, 7, "The merged section must retain the complete work history");
    assert.equal((html.match(/class="work-project-link /g) || []).length, 5, "Commercial projects must appear within their employers’ entries");
  }
  for (const id of ["about", "experience", "work", "contact"]) assert.ok(html.includes(`id="${id}"`));
  const profileSuffix = profile === "frontend" ? "front-end/" : "";
  const alternatePath = `${basePath}${lang === "uk" ? "en/" : ""}${profileSuffix}`;
  assert.ok(html.includes(`rel="alternate" hreflang="${lang === "uk" ? "en" : "uk"}" href="${new URL(alternatePath, origin).href}"`), `Wrong language alternate: ${route}`);
  assert.ok(html.includes(`rel="alternate" hreflang="x-default" href="${new URL(`${basePath}${profileSuffix}`, origin).href}"`), `Default language must be Ukrainian: ${route}`);
  const switches = [...html.matchAll(/<nav class="(languages|profile-switch)[^"]*"[^>]*>([\s\S]*?)<\/nav>/g)];
  assert.equal(switches.length, 2, "Both language and profile switches are required");
  for (const [, kind, nav] of switches) {
    assert.equal((nav.match(/aria-current="page"/g) || []).length, 1);
    const expectedPaths = kind === "languages"
      ? [`${basePath}${profileSuffix}`, `${basePath}en/${profileSuffix}`]
      : [`${basePath}${lang === "en" ? "en/" : ""}`, `${basePath}${lang === "en" ? "en/" : ""}front-end/`];
    assert.deepEqual([...nav.matchAll(/href="([^"]+)"/g)].map((match) => match[1]), expectedPaths, `Wrong ${kind} destinations: ${route}`);
    assert.ok(nav.includes(`href="${basePath}${route}" aria-current="page"`), `Wrong current ${kind} route: ${route}`);
  }
  const scripts = [...html.matchAll(/<script\b([^>]*)><\/script>/g)];
  if (gameEnabled) {
    assert.equal(scripts.length, 1, "Only the small game launcher is loaded with the portfolio");
    assert.ok(scripts[0][1].includes(`type="module" src="${basePath}assets/game/launch.js"`));
    assert.ok(/data-game-launch[^>]*hidden/.test(html), "The game launcher stays hidden without JavaScript");
    assert.ok(html.includes('data-game-state="closed"'), "The game must not start automatically");
  } else {
    assert.equal(scripts.length, 0, "No game scripts should load while the game is disabled");
    assert.ok(!html.includes("data-game-launch"), "The disabled game must not have a launcher");
    assert.ok(!html.includes("data-flight-game"), "The disabled game must not render its dialog");
  }
  if (profile === "deftech") {
    const ids = [...html.matchAll(/<article id="([^"]+)" class="project(?: [^"]*)?">/g)].map((m) => m[1]);
    assert.deepEqual(ids, ["fpv-bomber", "fpv-7", "drone-detector", "seo-dashboard", "moon-lamp", "coming-soon"]);
    assert.ok(html.includes("https://github.com/AndreyMatviyenko/esp32-seo-dashboard"));
    assert.equal((html.match(/class="photo-note"/g) || []).length, 0, "Projects without photos have text-only cards");
  }
  assert.ok(!/<(?:img|link)[^>]+(?:src|href)="https?:\/\/[^\"]+"[^>]*(?:stylesheet)?/.test(
    html.replace(/<link[^>]+rel="(?:canonical|alternate)"[^>]*>/g, "")), "No remote render dependencies");
}

const root = documents.get(path.join(output, "index.html"));
assert.ok(!root.includes('http-equiv="refresh"'), "Root must render Ukrainian DefTech directly");
for (const route of ["contact", "chat"]) {
  const redirect = documents.get(path.join(output, `${route}.html`));
  assert.ok(redirect.includes(`http-equiv="refresh" content="0; url=${basePath}#contact"`), `Wrong legacy contact target: ${route}`);
}

let linkCount = 0;
for (const [file, html] of documents) {
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `Exactly one h1 required: ${file}`);
  for (const [anchor] of html.matchAll(/<a\b[^>]*>/g)) {
    if (!/\bhref="https?:\/\//.test(anchor)) continue;
    assert.ok(/\btarget="_blank"/.test(anchor), `External link must open a new tab: ${anchor} in ${file}`);
    assert.ok(/\brel="[^\"]*\bnoopener\b/.test(anchor), `External link must use noopener: ${anchor} in ${file}`);
  }
  for (const [, raw] of html.matchAll(/\b(?:href|src)="([^"]*)"/g)) {
    assert.ok(raw, `Empty link in ${file}`);
    if (/^(?:https?:|mailto:|data:)/.test(raw)) continue;
    const url = new URL(raw.replaceAll("&amp;", "&"), `https://local.test${basePath}${path.relative(output, file).split(path.sep).join("/")}`);
    assert.ok(url.pathname.startsWith(basePath), `Link escapes deployment prefix: ${raw} in ${file}`);
    const relative = decodeURIComponent(url.pathname.slice(basePath.length));
    let target = path.resolve(output, relative);
    assert.ok(target === output || target.startsWith(output + path.sep), "Link escapes output directory");
    const info = await stat(target).catch(() => null);
    assert.ok(info, `Broken link ${raw} in ${file}`);
    if (info.isDirectory()) target = path.join(target, "index.html");
    assert.ok(await stat(target).catch(() => null), `Missing index: ${raw}`);
    if (url.hash) {
      const targetHtml = documents.get(target);
      assert.ok(targetHtml?.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `Missing anchor ${raw}`);
    }
    linkCount++;
  }
}

const sitemap = await readFile(path.join(output, "sitemap.xml"), "utf8");
const css = await readFile(path.join(output, "assets/site.css"), "utf8");
for (const file of ["launch.js", "game.js", "engine.js", "draw.js", "records.js"]) {
  assert.ok(await stat(path.join(output, "assets/game", file)).catch(() => null), `Missing game module: ${file}`);
}
assert.ok(css.includes("tailwindcss v4"), "Production CSS must be compiled by Tailwind 4");
assert.ok(!css.includes('@import "tailwindcss"'), "Uncompiled Tailwind source must not be published");
for (const route of pages) assert.ok(sitemap.includes(`<loc>${new URL(`${basePath}${route}`, origin).href}</loc>`));
assert.equal((sitemap.match(/<loc>/g) || []).length, pages.length, "Only the four current profile routes belong in the sitemap");
const backup = await readFile("backups/portfolio-pre-11ty-3c335fe.tar.gz");
assert.equal(createHash("sha256").update(backup).digest("hex"), "3fdfe4ce0127f5e0d38e847028ecad10df3efa08896f30bf9fcd305eb405e477", "Original backup changed");
for (const excluded of ["legacy", "backups", "package.json", ".github"]) {
  assert.ok(!(await stat(path.join(output, excluded)).catch(() => null)), `${excluded} must not be published`);
}
console.log(`Verified ${documents.size} HTML pages and ${linkCount} local links; prefix ${basePath}; backup checksum OK.`);
