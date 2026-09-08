// letterpress-type-specimen — the three proof cards (构造要点 15). Each card is an independent SVG document
// delivered as a data:image/svg+xml URL to an <image>, i.e. rendered in SVG-as-image mode where external resources
// are blocked but <style>, <?xml-stylesheet?> and data: URIs still work.
import { MICRO_FONT_DATA_URI } from './letterpress-type-specimen-font';

const W = 116, H = 92;
const frame = `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="#fbf6ea" stroke="#c3ae8b" stroke-width="1"/>`;
const encode = (svg: string): string => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/**
 * Card 1 — concept:xml-stylesheet-pi. The document opens with an xml-stylesheet processing instruction pointing at a
 * data:text/css sheet that recolours the glyphs and the bottom bar to indigo. The elements themselves carry
 * fill="#b3271e"; if a viewer ignores the PI the card renders vermilion (which the caption explains).
 * The inner data URL is percent-encoded once here; the outer encodeURIComponent adds a second layer that the
 * image loader strips, leaving `%23` for the CSS data URL to decode into `#`.
 */
export const cardStylesheetPi = (): string => encode(
  `<?xml-stylesheet type="text/css" href="data:text/css,text%2Crect.bar%7Bfill%3A%2314577a%7D"?>` +
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` +
  frame +
  `<text x="58" y="56" text-anchor="middle" font-family="serif" font-size="46" fill="#b3271e">Hg</text>` +
  `<text x="58" y="74" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#b3271e">xml-stylesheet PI</text>` +
  `<rect class="bar" x="8" y="80" width="100" height="5" fill="#b3271e"/>` +
  `</svg>`);

/**
 * Card 2 — concept:svg-as-image-external-font-blocked. Its own <style> colours the glyphs (proving embedded
 * stylesheets work in image mode) and declares 'Specimen Roman' from a same-origin URL that exists on the server —
 * but SVG-as-image documents may not fetch external resources, so the face falls back to the generic serif.
 */
export const cardExternalFont = (): string => encode(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` +
  `<style>@font-face{font-family:'Specimen Roman';src:url(/letterpress-type-specimen/specimen-micro.woff2) format('woff2')}` +
  `text{fill:#1d7a4b;font-family:'Specimen Roman',serif}.cap{font-family:sans-serif;font-size:8px}</style>` +
  frame +
  `<text x="58" y="56" text-anchor="middle" font-size="46">Hg</text>` +
  `<text class="cap" x="58" y="74" text-anchor="middle">url(/…/specimen-micro.woff2)</text>` +
  `<rect x="8" y="80" width="100" height="5" fill="#1d7a4b"/>` +
  `</svg>`);

/**
 * Card 3 — css:font-face-data-uri inside the image document: the 2 KB "Handgloves" micro subset travels with the
 * card as a data URI, so the glyphs match the paper exactly.
 */
export const cardDataUriFont = (): string => encode(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` +
  `<style>@font-face{font-family:'Specimen Roman';src:url(${MICRO_FONT_DATA_URI}) format('woff2')}` +
  `text{fill:#1c2733;font-family:'Specimen Roman',serif}.cap{font-family:sans-serif;font-size:8px;fill:#5b5246}</style>` +
  frame +
  `<text x="58" y="56" text-anchor="middle" font-size="46">Hg</text>` +
  `<text class="cap" x="58" y="74" text-anchor="middle">@font-face data:font/woff2</text>` +
  `<rect x="8" y="80" width="100" height="5" fill="#1c2733"/>` +
  `</svg>`);
