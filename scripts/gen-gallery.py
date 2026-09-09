#!/usr/bin/env python3
"""Deterministic gallery.html generator from catalog.json.

Usage:
    python3 scripts/gen-gallery.py          # write gallery.html
    python3 scripts/gen-gallery.py --check  # compare without writing (exit 1 on drift)
"""
import json, pathlib, sys, hashlib, textwrap

ROOT = pathlib.Path(__file__).resolve().parent.parent
CATALOG = ROOT / "catalog.json"
OUT = ROOT / "gallery.html"

def gradient_for(fam: str) -> str:
    h = 0
    for ch in fam:
        h = ((h << 5) - h + ord(ch)) & 0xFFFFFFFF
    palettes = [
        ("#1a5c4a", "#2d8a6e"), ("#1a4a6c", "#2d7aaa"), ("#5c1a4a", "#aa2d7a"),
        ("#4a3a1a", "#8a6a2d"), ("#1a3a5c", "#2d5caa"), ("#3a1a5c", "#6a2daa"),
        ("#1a5c5c", "#2daaaa"), ("#5c4a1a", "#aaaa2d"), ("#3a5c1a", "#6aaa2d"),
        ("#5c1a1a", "#aa2d2d"), ("#1a1a5c", "#2d2daa"), ("#4a1a3a", "#aa2d6a"),
    ]
    p = palettes[abs(h) % len(palettes)]
    return f"linear-gradient(135deg,{p[0]},{p[1]})"

def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")

def generate() -> str:
    catalog = json.loads(CATALOG.read_text())

    # Discover which scenes have rendered PNGs
    out_dir = ROOT / "out"
    has_png = set()
    if out_dir.is_dir():
        for f in out_dir.iterdir():
            if f.suffix == ".png" and f.name.endswith("-transparent.png"):
                sid = f.name.removesuffix("-transparent.png")
                has_png.add(sid)

    # Determine family order (first-seen)
    families = []
    seen = set()
    for s in catalog:
        if s["family"] not in seen:
            seen.add(s["family"])
            families.append(s["family"])

    catalog_js = json.dumps(catalog, ensure_ascii=False, indent=0)

    has_png_js = " ".join(sorted(has_png))

    # Build category nav and card sections
    catnav_links = []
    card_sections = []
    for fam in families:
        fid = "cat-" + "".join(
            c if c.isalnum() or c == "-" else "-" for c in fam
        ).strip("-").lower()
        group = [s for s in catalog if s["family"] == fam]
        n = len(group)
        catnav_links.append(
            f'<a href="#{esc(fid)}" data-family="{esc(fam)}">{esc(fam)} <span>{n}</span></a>'
        )

        section_html = textwrap.dedent(f"""\
        <section class="cat" id="{esc(fid)}">
          <h2>{esc(fam)} <span style="color:var(--muted);font-weight:400;font-size:.8em">({n})</span></h2>
        </section>""")

        cards_html = []
        for s in group:
            sid = s["id"]
            shot_inner = f'<div class="placeholder" style="background:{gradient_for(fam)}">{esc(sid)}</div>'
            if sid in has_png:
                shot_inner = (
                    f'<img src="out/{esc(sid)}-transparent.png" '
                    f'alt="{esc(s["use"])} rendered preview" '
                    f'loading="lazy" decoding="async" onerror="this.style.display=\'none\'">'
                    + shot_inner
                )
            tags = "".join(f"<span>{esc(t)}</span>" for t in s["tags"][:4])
            cx = "exp" if s["complexity"] == "expert" else "adv"
            png_link = (
                f'<a href="out/{esc(sid)}-transparent.png">Rendered PNG</a>'
                if sid in has_png else ""
            )
            card = textwrap.dedent(f"""\
            <article class="card" data-search="{esc(' '.join([s['use'], s['question'], s['family']] + s['tags']))}" data-family="{esc(fam)}">
              <a class="shot" href="/?scene={esc(sid)}" aria-label="Open {esc(s['use'])}">{shot_inner}</a>
              <div class="body">
                <h3>{esc(s['use'])}</h3>
                <p class="desc">{esc(s['question'])}</p>
                <div class="meta"><span class="badge family">{esc(fam)}</span><span class="badge {cx}">{s['complexity']}</span></div>
                <div class="tags">{tags}</div>
                <div class="links">
                  <a href="/?scene={esc(sid)}">Open scene</a>
                  {png_link}
                </div>
              </div>
            </article>""")
            cards_html.append(card)

        card_sections.append(section_html + "\n" + "\n".join(cards_html))

    catnav_html = "\n".join(catnav_links)
    cards_html_all = "\n".join(card_sections)

    return textwrap.dedent(f"""\
    <!doctype html>
    <html lang="en">
    <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SVG Studio — Gallery</title>
    <link rel="icon" href="data:,">
    <script>
    (function () {{
      var s = null;
      try {{ s = localStorage.getItem('gallery-theme'); }} catch (e) {{}}
      var d = s ? s === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches;
      document.documentElement.dataset.theme = d ? 'dark' : 'light';
    }})();
    </script>
    <style>
    :root {{
      --bg: #fbfaf8; --panel: #fff; --panel-hover: #f5f3ef; --ink: #16181d;
      --muted: #5f6570; --line: #e3e1dc; --accent: #2a7a68; --accent-dim: #5aa892;
      --tag-bg: #eef6f3; --tag-fg: #2a7a68; --shot: #f0ede8;
      --badge-adv: #e8f5e9; --badge-adv-fg: #2e7d32;
      --badge-exp: #fce4ec; --badge-exp-fg: #c62828;
      --card-shadow: 0 1px 3px rgba(0,0,0,.06);
      --flash-color: rgba(42,122,104,.12);
    }}
    [data-theme="dark"] {{
      --bg: #0f1114; --panel: #161a1f; --panel-hover: #1c2128; --ink: #e6e9ec;
      --muted: #8b95a5; --line: #2a2f37; --accent: #5ec4a8; --accent-dim: #3d8a72;
      --tag-bg: #1a2a25; --tag-fg: #5ec4a8; --shot: #1a1e24;
      --badge-adv: #1b3a20; --badge-adv-fg: #81c784;
      --badge-exp: #3a1c1f; --badge-exp-fg: #ef9a9a;
      --card-shadow: 0 1px 3px rgba(0,0,0,.3);
      --flash-color: rgba(94,196,168,.1);
    }}
    * {{ box-sizing: border-box; margin: 0; }}
    body {{ font: 15px/1.55 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg); color: var(--ink); }}

    header {{ position: sticky; top: 0; z-index: 10; background: var(--bg);
      border-bottom: 1px solid var(--line); padding: .75rem 1.25rem;
      display: flex; gap: .75rem; flex-wrap: wrap; align-items: center; }}
    header h1 {{ font-size: 1.05rem; margin: 0 auto 0 0; white-space: nowrap; letter-spacing: .02em; }}
    #q {{ flex: 1 1 200px; max-width: 380px; padding: .4rem .7rem;
      border: 1px solid var(--line); border-radius: .5rem;
      background: var(--panel); color: var(--ink); font: inherit; }}
    #q::placeholder {{ color: var(--muted); }}
    #count {{ min-width: 5rem; text-align: right; color: var(--muted); font-size: .85rem; }}
    #toggle {{ border: 1px solid var(--line); background: var(--panel);
      color: var(--ink); border-radius: .5rem; padding: .4rem .65rem; cursor: pointer;
      font: inherit; font-size: .85rem; line-height: 1; }}
    #toggle:hover {{ background: var(--panel-hover); }}
    :focus-visible {{ outline: 3px solid var(--accent); outline-offset: 2px; }}
    label.sr {{ position: absolute; width: 1px; height: 1px; overflow: hidden;
      clip: rect(0 0 0 0); white-space: nowrap; }}

    nav.cats {{ display: flex; gap: .45rem; flex-wrap: wrap; padding: .65rem 1.25rem;
      border-bottom: 1px solid var(--line); }}
    nav.cats a {{ text-decoration: none; color: var(--ink); font-size: .82rem;
      border: 1px solid var(--line); background: var(--panel);
      padding: .28rem .65rem; border-radius: 2rem; white-space: nowrap;
      transition: border-color .15s, color .15s; }}
    nav.cats a:hover, nav.cats a.active {{ border-color: var(--accent); color: var(--accent); }}
    nav.cats a span {{ color: var(--muted); font-size: .8em; margin-left: .25rem; }}

    main {{ display: grid; gap: 1rem; padding: 1rem 1.25rem 3rem;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
      max-width: 1600px; }}
    section.cat {{ grid-column: 1 / -1; margin: .8rem 0 .1rem;
      scroll-margin-top: 5rem; padding: .3rem 0; }}
    section.cat h2 {{ font-size: .92rem; color: var(--muted); font-weight: 600;
      letter-spacing: .04em; text-transform: uppercase; }}
    section.cat.flash {{ animation: flash 1.2s ease-out; }}
    @keyframes flash {{ 0% {{ background: var(--flash-color); }} 100% {{ background: none; }} }}

    article.card {{ border: 1px solid var(--line); border-radius: .75rem;
      background: var(--panel); overflow: hidden; display: flex;
      flex-direction: column; box-shadow: var(--card-shadow);
      transition: box-shadow .15s, border-color .15s; }}
    article.card:hover {{ box-shadow: 0 4px 12px rgba(0,0,0,.1); border-color: var(--accent-dim); }}
    article.card .shot {{ position: relative; height: 180px; overflow: hidden;
      display: flex; align-items: center; justify-content: center; }}
    article.card .shot img {{ width: 100%; height: 100%; object-fit: cover; display: block;
      position: relative; z-index: 1; }}
    article.card .shot .placeholder {{ position: absolute; inset: 0; display: flex;
      align-items: center; justify-content: center;
      font-size: .75rem; font-weight: 600; letter-spacing: .14em;
      text-transform: uppercase; color: rgba(255,255,255,.7); z-index: 0;
      text-shadow: 0 1px 4px rgba(0,0,0,.4); }}
    article.card .body {{ padding: .65rem .85rem .8rem; display: grid; gap: .25rem; flex: 1; }}
    article.card h3 {{ font-size: .95rem; margin: 0; font-weight: 600; }}
    article.card .desc {{ margin: 0; color: var(--muted); font-size: .82rem;
      line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2;
      -webkit-box-orient: vertical; overflow: hidden; }}
    article.card .meta {{ display: flex; gap: .4rem; flex-wrap: wrap; margin-top: .2rem; }}
    article.card .badge {{ font-size: .7rem; padding: .15rem .45rem; border-radius: 999px;
      font-weight: 600; letter-spacing: .03em; }}
    .badge.family {{ background: var(--tag-bg); color: var(--tag-fg); }}
    .badge.adv {{ background: var(--badge-adv); color: var(--badge-adv-fg); }}
    .badge.exp {{ background: var(--badge-exp); color: var(--badge-exp-fg); }}
    article.card .tags {{ display: flex; gap: .3rem; flex-wrap: wrap; margin-top: .15rem; }}
    article.card .tags span {{ font-size: .68rem; color: var(--muted);
      background: var(--shot); padding: .1rem .35rem; border-radius: .25rem; }}
    article.card .links {{ display: flex; gap: .6rem; margin-top: .35rem; padding-top: .35rem;
      border-top: 1px solid var(--line); }}
    article.card .links a {{ color: var(--accent); font-size: .78rem; text-decoration: none;
      font-weight: 500; }}
    article.card .links a:hover {{ text-decoration: underline; }}

    #empty {{ display: none; grid-column: 1 / -1; padding: 2rem; color: var(--muted);
      text-align: center; font-size: .95rem; }}

    @media (max-width: 640px) {{
      header {{ padding: .6rem .8rem; }}
      nav.cats {{ padding: .5rem .8rem; }}
      main {{ padding: .8rem; gap: .75rem; }}
      article.card .shot {{ height: 140px; }}
    }}
    </style>
    </head>
    <body>
    <header>
      <h1>SVG Studio</h1>
      <label class="sr" for="q">Search demos</label>
      <input id="q" type="search" placeholder="Search title, description, tags\u2026" autocomplete="off">
      <output id="count" aria-live="polite"></output>
      <button id="toggle" type="button" aria-label="Toggle theme">&#9790;</button>
    </header>
    <nav class="cats" aria-label="Categories" id="catnav">
    {catnav_html}
    </nav>
    <main id="grid">
    {cards_html_all}
    <p id="empty">No matching demos.</p>
    </main>
    <script>
    var CATALOG = {catalog_js};

    var HAS_PNG = {{}};
    '{has_png_js}'.split(' ').forEach(function(k){{ if(k) HAS_PNG[k]=true; }});

    var grid = document.getElementById('grid');
    var q = document.getElementById('q');
    var countEl = document.getElementById('count');
    var empty = document.getElementById('empty');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('article.card'));
    var sections = Array.prototype.slice.call(grid.querySelectorAll('section.cat'));

    document.getElementById('toggle').addEventListener('click', function() {{
      var r = document.documentElement;
      var dark = r.dataset.theme !== 'dark';
      r.dataset.theme = dark ? 'dark' : 'light';
      this.innerHTML = dark ? '&#9789;' : '&#9790;';
      try {{ localStorage.setItem('gallery-theme', dark ? 'dark' : 'light'); }} catch(e) {{}}
    }});
    var isDark = document.documentElement.dataset.theme === 'dark';
    document.getElementById('toggle').innerHTML = isDark ? '&#9789;' : '&#9790;';

    function apply() {{
      var term = q.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function(c) {{
        var hit = !term || (c.dataset.search || '').toLowerCase().indexOf(term) >= 0;
        c.style.display = hit ? '' : 'none';
        if (hit) shown++;
      }});
      sections.forEach(function(s) {{
        var fid = s.id;
        var any = cards.some(function(c) {{
          return c.style.display !== 'none' && c.closest('section.cat') === s;
        }});
        s.style.display = any ? '' : 'none';
      }});
      countEl.textContent = shown + ' / ' + cards.length;
      empty.style.display = shown ? 'none' : '';
    }}
    q.addEventListener('input', apply);
    apply();

    var catnav = document.getElementById('catnav');
    catnav.querySelectorAll('a[href^="#cat-"]').forEach(function(a) {{
      a.addEventListener('click', function() {{
        catnav.querySelectorAll('a').forEach(function(x){{ x.classList.remove('active'); }});
        a.classList.add('active');
        var sec = document.querySelector(a.getAttribute('href'));
        if (sec) {{ sec.classList.remove('flash'); void sec.offsetWidth; sec.classList.add('flash'); }}
      }});
    }});
    </script>
    </body>
    </html>
    """)


def main():
    check = "--check" in sys.argv
    html = generate()
    if check:
        existing = OUT.read_text() if OUT.exists() else ""
        if html != existing:
            print(f"gallery.html is stale (drift detected). Run: python3 scripts/gen-gallery.py", file=sys.stderr)
            sys.exit(1)
        print("gallery.html is up to date.")
    else:
        OUT.write_text(html)
        print(f"Wrote {OUT} ({len(html)} bytes, {html.count('article class=')} cards)")


if __name__ == "__main__":
    main()
