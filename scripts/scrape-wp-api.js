/**
 * Orlando Spine Studio — WordPress REST API Scraper
 * Run in browser console on orlandospinestudio.com (VPN on)
 *
 * Pulls: posts, pages, media, categories, tags
 * Saves progress to localStorage, auto-downloads JSON when done.
 *
 * To reset: localStorage.removeItem('oss_api_scrape')
 */

(async function ossApiScrape() {
  const BASE = 'https://orlandospinestudio.com/wp-json/wp/v2';

  // ── helpers ──────────────────────────────────────────────────────────────

  function download(filename, obj) {
    var blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }

  function stripHtml(html) {
    if (!html) return '';
    var doc = new DOMParser().parseFromString(html, 'text/html');
    // Remove script/style noise
    doc.querySelectorAll('script, style, noscript').forEach(el => el.remove());
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function jitter(minMs, maxMs) {
    return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  }

  async function fetchAll(endpoint, params = {}) {
    var results = [];
    var page = 1;
    var totalPages = 1;

    while (page <= totalPages) {
      var qs = new URLSearchParams({ per_page: 100, page, ...params }).toString();
      var url = `${BASE}/${endpoint}?${qs}`;

      try {
        var res = await fetch(url);
        if (!res.ok) {
          console.warn(`[API] ${endpoint} page ${page} — HTTP ${res.status}`);
          break;
        }
        var data = await res.json();
        if (!Array.isArray(data) || data.length === 0) break;

        totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
        results = results.concat(data);
        console.log(`[API] ${endpoint} — page ${page}/${totalPages} (${results.length} items so far)`);
        page++;

        if (page <= totalPages) await delay(jitter(1500, 3000));
      } catch (err) {
        console.error(`[API] ${endpoint} page ${page} error:`, err);
        break;
      }
    }

    return results;
  }

  // ── parse content fields ──────────────────────────────────────────────────

  function parsePost(p) {
    return {
      id:            p.id,
      type:          p.type,
      slug:          p.slug,
      url:           p.link,
      status:        p.status,
      title:         p.title?.rendered || '',
      titleSeo:      p.meta?._seopress_titles_title || '',
      excerpt:       stripHtml(p.excerpt?.rendered || ''),
      content:       stripHtml(p.content?.rendered || ''),
      contentHtml:   p.content?.rendered || '',
      metaDesc:      p.meta?._seopress_titles_desc || '',
      datePublished: p.date || '',
      dateModified:  p.modified || '',
      featuredMedia: p.featured_media || 0,
      categories:    p.categories || [],
      tags:          p.tags || [],
      template:      p.template || '',
    };
  }

  function parseMedia(m) {
    var sizes = m.media_details?.sizes || {};
    return {
      id:        m.id,
      slug:      m.slug,
      url:       m.source_url,
      altText:   m.alt_text || '',
      caption:   stripHtml(m.caption?.rendered || ''),
      title:     m.title?.rendered || '',
      mimeType:  m.mime_type || '',
      mediaType: m.media_type || '',
      width:     m.media_details?.width || null,
      height:    m.media_details?.height || null,
      filesize:  m.media_details?.filesize || null,
      sizes: Object.fromEntries(
        Object.entries(sizes).map(([k, v]) => [k, {
          url: v.source_url, width: v.width, height: v.height
        }])
      ),
    };
  }

  function parseTaxonomy(t) {
    return {
      id:          t.id,
      name:        t.name,
      slug:        t.slug,
      count:       t.count,
      description: t.description || '',
    };
  }

  // ── fetch all sections (no localStorage — runs fast, ~2 min total) ─────────

  var result = { scrapedAt: new Date().toISOString() };

  console.log('[OSS API Scraper] Starting...');

  // ── posts ─────────────────────────────────────────────────────────────────

  console.log('[API] Fetching posts...');
  var rawPosts = await fetchAll('posts', { status: 'publish' });
  result.posts = rawPosts.map(parsePost);
  console.log(`[API] Posts done — ${result.posts.length} items`);
  await delay(jitter(2000, 4000));

  // ── pages ─────────────────────────────────────────────────────────────────

  console.log('[API] Fetching pages...');
  var rawPages = await fetchAll('pages', { status: 'publish' });
  result.pages = rawPages.map(parsePost);
  console.log(`[API] Pages done — ${result.pages.length} items`);
  await delay(jitter(2000, 4000));

  // ── media ─────────────────────────────────────────────────────────────────

  console.log('[API] Fetching media library...');
  var rawMedia = await fetchAll('media');
  result.media = rawMedia.map(parseMedia);
  console.log(`[API] Media done — ${result.media.length} items`);
  await delay(jitter(2000, 4000));

  // ── categories ────────────────────────────────────────────────────────────

  console.log('[API] Fetching categories...');
  var rawCats = await fetchAll('categories');
  result.categories = rawCats.map(parseTaxonomy);
  console.log(`[API] Categories done — ${result.categories.length} items`);
  await delay(jitter(1000, 2000));

  // ── tags ──────────────────────────────────────────────────────────────────

  console.log('[API] Fetching tags...');
  var rawTags = await fetchAll('tags');
  result.tags = rawTags.map(parseTaxonomy);
  console.log(`[API] Tags done — ${result.tags.length} items`);

  // ── resolve category/tag names on posts & pages ───────────────────────────

  var catMap = Object.fromEntries(result.categories.map(c => [c.id, c.name]));
  var tagMap  = Object.fromEntries(result.tags.map(t => [t.id, t.name]));

  [...(result.posts || []), ...(result.pages || [])].forEach(p => {
    p.categoryNames = (p.categories || []).map(id => catMap[id] || id);
    p.tagNames      = (p.tags || []).map(id => tagMap[id] || id);
  });

  // ── resolve featured media URLs ───────────────────────────────────────────

  var mediaMap = Object.fromEntries(result.media.map(m => [m.id, m.url]));

  [...(result.posts || []), ...(result.pages || [])].forEach(p => {
    if (p.featuredMedia && mediaMap[p.featuredMedia]) {
      p.featuredMediaUrl = mediaMap[p.featuredMedia];
    }
  });

  // ── summary ───────────────────────────────────────────────────────────────

  result.summary = {
    posts:      result.posts?.length || 0,
    pages:      result.pages?.length || 0,
    media:      result.media?.length || 0,
    categories: result.categories?.length || 0,
    tags:       result.tags?.length || 0,
  };

  console.log('[OSS API Scraper] Complete!', result.summary);

  // ── download ──────────────────────────────────────────────────────────────

  download('oss-wp-api-data.json', result);
  console.log('[OSS API Scraper] Downloaded oss-wp-api-data.json');

})();
