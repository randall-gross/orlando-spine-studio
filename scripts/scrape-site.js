/**
 * Orlando Spine Studio — Browser Console Scraper
 *
 * Paste this entire script into the browser console while on
 * https://orlandospinestudio.com (with VPN active).
 *
 * What it does:
 *  - Fetches every page in URLS with a randomised 2–4s delay
 *  - Extracts: title, meta description, h1, body content, images, PDFs, videos
 *  - Saves progress to localStorage after every page (resume-safe)
 *  - Auto-downloads results.json when complete
 *
 * To resume after an interruption: just paste the script again —
 * it will skip already-scraped pages and continue from where it left off.
 *
 * To reset and start fresh: run  localStorage.removeItem('oss_scrape')  first.
 */

(async function () {

  /* ── URL LIST (158 pages from sitemap) ──────────────────────────── */

  const SKIP = new Set([
    'https://orlandospinestudio.com/test-reviews/',
    'https://orlandospinestudio.com/thank-you/',
    'https://orlandospinestudio.com/thank-you-contact-us/',
  ]);

  const URLS = [
    // Core pages
    'https://orlandospinestudio.com/',
    'https://orlandospinestudio.com/meet-our-team/',
    'https://orlandospinestudio.com/services/',
    'https://orlandospinestudio.com/conditions-treated/',
    'https://orlandospinestudio.com/contact/',
    'https://orlandospinestudio.com/appointments/',
    'https://orlandospinestudio.com/new-patients/',
    'https://orlandospinestudio.com/patient-forms/',
    'https://orlandospinestudio.com/insurances/',
    'https://orlandospinestudio.com/paitent-reviews/',
    'https://orlandospinestudio.com/clinic-tour/',
    'https://orlandospinestudio.com/digital-media/',
    'https://orlandospinestudio.com/auto-personal-injury/',

    // Service pages
    'https://orlandospinestudio.com/shockwave-therapy/',
    'https://orlandospinestudio.com/spinal-decompression/',
    'https://orlandospinestudio.com/lightforce-xli-laser/',
    'https://orlandospinestudio.com/digital-x-rays/',
    'https://orlandospinestudio.com/orlando-massage-therapy/',
    'https://orlandospinestudio.com/sciatica-treatment/',
    'https://orlandospinestudio.com/scoliosis-treatment/',
    'https://orlandospinestudio.com/degenerative-disk-disease-treatment/',
    'https://orlandospinestudio.com/arthritis-treatment-services/',
    'https://orlandospinestudio.com/carpal-tunnel-syndrome-treatment/',
    'https://orlandospinestudio.com/tmj-treatment-services/',

    // Condition pages (19)
    'https://orlandospinestudio.com/conditions-treated-arthritis/',
    'https://orlandospinestudio.com/conditions-treated-auto-injuries/',
    'https://orlandospinestudio.com/conditions-treated-back-pain/',
    'https://orlandospinestudio.com/conditions-treated-carpal-tunnel-syndrome/',
    'https://orlandospinestudio.com/conditions-treated-degenerative-disc-disease/',
    'https://orlandospinestudio.com/conditions-treated-headaches-migraines/',
    'https://orlandospinestudio.com/conditions-treated-knee-pain/',
    'https://orlandospinestudio.com/conditions-treated-neck-pain/',
    'https://orlandospinestudio.com/conditions-treated-neuropathy/',
    'https://orlandospinestudio.com/conditions-treated-personal-injury/',
    'https://orlandospinestudio.com/conditions-treated-pinched-nerve/',
    'https://orlandospinestudio.com/conditions-treated-sciatica/',
    'https://orlandospinestudio.com/conditions-treated-shoulder-pain/',
    'https://orlandospinestudio.com/conditions-treated-sports-injury/',
    'https://orlandospinestudio.com/conditions-treated-scoliosis/',
    'https://orlandospinestudio.com/conditions-treated-tmj/',
    'https://orlandospinestudio.com/conditions-treated-vertigo/',
    'https://orlandospinestudio.com/conditions-treated-whiplash/',
    'https://orlandospinestudio.com/conditions-treated-work-injuries/',

    // Local SEO — specialty/doctor pages
    'https://orlandospinestudio.com/orlando-back-pain-doctor/',
    'https://orlandospinestudio.com/orlando-back-pain-specialist/',
    'https://orlandospinestudio.com/orlando-neuropathy-doctor/',
    'https://orlandospinestudio.com/what-kind-of-doctor-treats-neuropathy-in-feet/',
    'https://orlandospinestudio.com/orlando-neck-ache-doctor/',
    'https://orlandospinestudio.com/orlando-sports-injury-chiropractor/',
    'https://orlandospinestudio.com/orlando-chiropractic-care-for-sports-injuries/',
    'https://orlandospinestudio.com/orlando-chiropractor-for-athletes/',
    'https://orlandospinestudio.com/orlando-knee-sports-injury-chiropractor/',
    'https://orlandospinestudio.com/orlando-concussion-chiropractor/',
    'https://orlandospinestudio.com/concussion-chiropractor-orlando/',
    'https://orlandospinestudio.com/orlando-chiropractor-for-degenerative-disc-disease/',
    'https://orlandospinestudio.com/orlando-digital-x-ray-services/',
    'https://orlandospinestudio.com/best-orlando-chiropractor/',
    'https://orlandospinestudio.com/orlando-spine-studio/',
    'https://orlandospinestudio.com/orlando-laser-muscle-therapy/',
    'https://orlandospinestudio.com/orlando-chiropractic-massage-therapy/',

    // Neighbourhood pages
    'https://orlandospinestudio.com/university-acres-chiropractor/',
    'https://orlandospinestudio.com/university-acres-back-pain-doctor/',
    'https://orlandospinestudio.com/university-acres-chiropractic-massage-therapy/',
    'https://orlandospinestudio.com/summer-woods-chiropractor/',
    'https://orlandospinestudio.com/summer-woods-chiropractic-massage-therapy/',
    'https://orlandospinestudio.com/summer-woods-digital-x-ray-services/',
    'https://orlandospinestudio.com/cambridge-circle-chiropractor/',
    'https://orlandospinestudio.com/riversbend-chiropractor/',
    'https://orlandospinestudio.com/regency-park-orlando-fl/',
    'https://orlandospinestudio.com/casselberry-orlando-fl/',
    'https://orlandospinestudio.com/baldwin-park-orlando-fl/',
    'https://orlandospinestudio.com/aloma-orlando-fl/',
    'https://orlandospinestudio.com/oviedo-orlando-fl/',
    'https://orlandospinestudio.com/winter-park-orlando-fl/',
    'https://orlandospinestudio.com/chuluota-orlando-fl/',
    'https://orlandospinestudio.com/university-estates-orlando-fl/',
    'https://orlandospinestudio.com/goldenrod-orlando-fl/',
    'https://orlandospinestudio.com/alafaya-orlando-fl/',
    'https://orlandospinestudio.com/azalea-park-orlando-fl/',

    // Landmark SEO pages
    'https://orlandospinestudio.com/harry-p-leu-gardens/',
    'https://orlandospinestudio.com/the-charles-hosmer-morse-museum-of-american-art/',
    'https://orlandospinestudio.com/lake-howell/',
    'https://orlandospinestudio.com/trotwood-park/',
    'https://orlandospinestudio.com/florida-trail-panorama-trailhead/',
    'https://orlandospinestudio.com/econlockhatchee-sandhills-conservation-area/',
    'https://orlandospinestudio.com/beltway-commerce-center/',
    'https://orlandospinestudio.com/mead-botanical-gardens/',
    'https://orlandospinestudio.com/orlando-executive-airport/',
    'https://orlandospinestudio.com/red-bug-lake-park/',
    'https://orlandospinestudio.com/blanchard-park/',
    'https://orlandospinestudio.com/orlando-science-center/',

    // Blog posts — auto injury cluster
    'https://orlandospinestudio.com/why-floridas-14-day-rule-matters-for-your-auto-injury-treatment/',
    'https://orlandospinestudio.com/physical-therapy-after-a-car-accident-in-orlando/',
    'https://orlandospinestudio.com/massage-therapy-for-auto-injuries-in-orlando/',
    'https://orlandospinestudio.com/chiropractic-adjustment-after-a-car-accident-in-orlando/',
    'https://orlandospinestudio.com/neck-pain-after-a-car-accident-orlando-chiropractors-can-help/',
    'https://orlandospinestudio.com/struggling-with-pain-after-a-car-wreck-get-the-best-chiropractic-care-in-orlando/',
    'https://orlandospinestudio.com/chiropractic-treatment-for-dizziness-vertigo-after-an-auto-accident-in-orlando/',
    'https://orlandospinestudio.com/headaches-after-a-car-accident-get-relief-at-our-orlando-chiropractic-clinic/',
    'https://orlandospinestudio.com/how-chiropractic-care-helps-whiplash-recovery-in-orlando-fl/',
    'https://orlandospinestudio.com/dont-ignore-back-pain-after-a-car-crash-orlando-chiropractic-solutions/',
    'https://orlandospinestudio.com/why-orlando-auto-injury-victims-need-a-chiropractor-right-away/',
    'https://orlandospinestudio.com/expert-chiropractic-care-for-auto-accident-injuries-in-orlando-fl/',

    // Blog posts — arthritis cluster
    'https://orlandospinestudio.com/how-regular-chiropractic-visits-may-slow-arthritis-progression/',
    'https://orlandospinestudio.com/arthritis-pain-relief-through-chiropractic-care-in-orlando/',
    'https://orlandospinestudio.com/holistic-arthritis-management-in-orlando-how-chiropractic-fits-into-a-comprehensive-plan/',
    'https://orlandospinestudio.com/can-chiropractic-adjustments-ease-arthritis-symptoms-a-guide-for-orlando-residents-2/',
    'https://orlandospinestudio.com/how-regular-chiropractic-visits-in-orlando-may-slow-arthritis-progression/',
    'https://orlandospinestudio.com/creating-a-personalized-arthritis-care-plan-in-orlando/',
    'https://orlandospinestudio.com/can-chiropractic-care-relieve-arthritis-pain-a-scientific-look/',
    'https://orlandospinestudio.com/chiropractic-care-for-arthritis-in-orlando-how-it-works-and-what-to-expect-2/',

    // Blog posts — knee pain cluster
    'https://orlandospinestudio.com/common-causes-of-knee-pain-that-chiropractors-treat-in-orlando/',
    'https://orlandospinestudio.com/how-chiropractic-care-can-help-relieve-knee-pain-in-orlando/',
    'https://orlandospinestudio.com/sports-related-knee-injuries/',
    'https://orlandospinestudio.com/chiropractor-help-avoid-knee-surgery/',

    // Blog posts — sciatica cluster
    'https://orlandospinestudio.com/effective-sciatica-relief-in-orlando-physical-therapy-and-chiropractic-solutions-2/',
    'https://orlandospinestudio.com/sciatica-relief-in-orlando-the-role-of-physical-therapy-and-chiropractic-care-2/',
    'https://orlandospinestudio.com/natural-sciatica-pain-relief-how-chiropractic-care-in-orlando-offers-long-term-solutions-2/',
    'https://orlandospinestudio.com/effective-sciatica-relief-in-orlando-physical-therapy-and-chiropractic-solutions/',
    'https://orlandospinestudio.com/sciatica-relief-in-orlando-the-role-of-physical-therapy-and-chiropractic-care/',
    'https://orlandospinestudio.com/natural-sciatica-pain-relief-how-chiropractic-care-in-orlando-offers-long-term-solutions/',
    'https://orlandospinestudio.com/sciatica-relief-in-orlando-effective-chiropractic-treatments-for-pinched-nerves-and-leg-pain/',

    // Blog posts — back pain cluster
    'https://orlandospinestudio.com/comprehensive-guide-to-back-pain-relief-in-orlando-fl/',
    'https://orlandospinestudio.com/back-pain-and-the-florida-heat-tips-for-relief-in-orlandos-climate/',
    'https://orlandospinestudio.com/finding-the-right-back-pain-specialist-in-orlando-a-locals-guide/',
    'https://orlandospinestudio.com/affordable-back-pain-treatment-options-in-orlando-a-budget-friendly-guide/',
    'https://orlandospinestudio.com/back-pain-from-desk-jobs-ergonomic-tips-for-orlando-professionals/',
    'https://orlandospinestudio.com/back-pain-after-car-accidents-in-orlando-a-chiropractic-approach-to-whiplash-and-injury-recovery/',
    'https://orlandospinestudio.com/improving-posture-to-prevent-back-pain-chiropractic-tips-and-exercises-for-orlando-residents/',
    'https://orlandospinestudio.com/sports-related-back-injuries-in-orlando-chiropractic-care-for-athletes-and-active-individuals/',
    'https://orlandospinestudio.com/theme-park-back-preventing-and-treating-back-pain-from-orlando-attractions/',
    'https://orlandospinestudio.com/back-pain-and-pregnancy-in-orlando-safe-and-gentle-chiropractic-care-for-expectant-mothers/',

    // Blog posts — general / PT cluster
    'https://orlandospinestudio.com/orlandos-best-physical-therapy-studio-for-back-neck-pain-because-you-deserve-to-feel-good/',
    'https://orlandospinestudio.com/orlandos-best-physical-therapy-studio-for-back-neck-pain-because-you-deserve-to-feel-good-again/',
    'https://orlandospinestudio.com/womens-health-and-chiropractic-care-in-orlando-fl-2/',
    'https://orlandospinestudio.com/womens-health-and-chiropractic-care-in-orlando-fl/',
    'https://orlandospinestudio.com/manual-therapy-vs-dry-needling-in-orlando-whats-the-difference-2/',
    'https://orlandospinestudio.com/manual-therapy-vs-dry-needling-in-orlando-whats-the-difference/',
    'https://orlandospinestudio.com/how-orlando-physical-therapy-and-chiropractic-clinics-treat-back-pain-effectively-2/',
    'https://orlandospinestudio.com/how-orlando-physical-therapy-and-chiropractic-clinics-treat-back-pain-effectively/',
    'https://orlandospinestudio.com/affordable-physical-therapy-and-chiropractic-care-in-orlando-how-to-get-treated-without-breaking-the-bank/',
    'https://orlandospinestudio.com/sports-physical-therapy-and-chiropractic-care-in-orlando-a-winning-combo-for-athletes-2/',
    'https://orlandospinestudio.com/sports-physical-therapy-and-chiropractic-care-in-orlando-a-winning-combo-for-athletes/',
    'https://orlandospinestudio.com/top-5-benefits-of-combining-physical-therapy-and-chiropractic-care-in-orlando-2/',
    'https://orlandospinestudio.com/top-5-benefits-of-combining-physical-therapy-and-chiropractic-care-in-orlando/',

    // Blog posts — spine health cluster
    'https://orlandospinestudio.com/integrating-advanced-spine-treatment-technologies-in-orlando/',
    'https://orlandospinestudio.com/tips-for-incorporating-stress-relief-techniques-into-your-spine-health-program-in-orlando/',
    'https://orlandospinestudio.com/the-benefits-of-adding-a-spinal-care-routine-to-your-orlando-lifestyle/',
    'https://orlandospinestudio.com/choosing-the-right-orthopedic-support-for-spinal-health-in-orlando/',
    'https://orlandospinestudio.com/spine-safety-101-tips-for-maintaining-a-healthy-back-in-orlando/',
    'https://orlandospinestudio.com/navigating-orlandos-health-regulations-for-spinal-treatment-centers/',
    'https://orlandospinestudio.com/the-role-of-physical-therapy-in-enhancing-spine-health-in-orlando/',
    'https://orlandospinestudio.com/designing-accessible-spinal-health-programs-for-orlando-residents/',
  ].filter(url => !SKIP.has(url));

  /* ── HELPERS ────────────────────────────────────────────────────── */

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const jitter = () => 2000 + Math.random() * 2000; // 2–4 s

  function extractContent(doc, url) {
    // Try selectors from most to least specific
    const selectors = [
      '.elementor-widget-container',
      '.entry-content',
      '.post-content',
      'article',
      'main',
      '#content',
    ];
    let contentEl = null;
    for (const sel of selectors) {
      const el = doc.querySelector(sel);
      if (el && el.innerText && el.innerText.trim().length > 200) {
        contentEl = el;
        break;
      }
    }

    // Clean up nav/footer noise from content element
    const clone = contentEl ? contentEl.cloneNode(true) : doc.body.cloneNode(true);
    ['nav','footer','header','.wp-block-navigation','.site-footer',
     '.site-header','.elementor-location-header','.elementor-location-footer',
     '#wpadminbar','.cookie-notice'].forEach(sel => {
      clone.querySelectorAll(sel).forEach(n => n.remove());
    });

    const text = clone.innerText
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();

    // Images
    const images = [...doc.querySelectorAll('img')]
      .filter(img => !img.src.includes('data:') && img.width > 50)
      .map(img => ({
        src: img.src,
        alt: img.alt || '',
        width: img.naturalWidth || img.width,
      }))
      .filter((img, i, arr) => arr.findIndex(x => x.src === img.src) === i); // dedup

    // PDFs
    const pdfs = [...doc.querySelectorAll('a[href$=".pdf"]')]
      .map(a => ({ href: a.href, text: a.textContent.trim() }));

    // Videos (YouTube iframes + video tags)
    const videos = [
      ...[...doc.querySelectorAll('iframe[src*="youtube"], iframe[src*="youtu.be"]')]
        .map(f => ({ type: 'youtube', src: f.src })),
      ...[...doc.querySelectorAll('video source, video[src]')]
        .map(v => ({ type: 'video', src: v.src || v.getAttribute('src') })),
    ];

    const title       = doc.title || '';
    const metaDesc    = doc.querySelector('meta[name="description"]')?.content || '';
    const h1          = doc.querySelector('h1')?.innerText?.trim() || '';
    const h2s         = [...doc.querySelectorAll('h2')].map(h => h.innerText.trim()).filter(Boolean);
    const canonical   = doc.querySelector('link[rel="canonical"]')?.href || url;

    return { url, canonical, title, metaDesc, h1, h2s, text, images, pdfs, videos };
  }

  /* ── RESUME STATE ────────────────────────────────────────────── */

  const STORAGE_KEY = 'oss_scrape';
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const results = saved.results || [];
  const done    = new Set((results).map(r => r.url));

  const todo = URLS.filter(u => !done.has(u));
  const total = URLS.length;

  console.log(`%c OSS Scraper`, 'font-size:16px;font-weight:bold;color:#0d9488');
  console.log(`Already scraped: ${results.length} / ${total}`);
  console.log(`Remaining:       ${todo.length}`);
  console.log(`Estimated time:  ~${Math.ceil(todo.length * 3 / 60)} minutes`);
  console.log('─────────────────────────────────────────────');

  /* ── SCRAPE LOOP ─────────────────────────────────────────────── */

  const parser = new DOMParser();

  for (let i = 0; i < todo.length; i++) {
    const url = todo[i];
    const num = results.length + 1;
    console.log(`[${num}/${total}] ${url}`);

    try {
      const res  = await fetch(url, { credentials: 'omit' });
      const html = await res.text();
      const doc  = parser.parseFromString(html, 'text/html');
      const data = extractContent(doc, url);
      results.push(data);

      // Save progress to localStorage after every page
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ results, updatedAt: new Date().toISOString() }));

      console.log(`  ✓ "${data.title}" — ${data.text.length} chars, ${data.images.length} images`);
    } catch (err) {
      console.warn(`  ✗ Failed: ${err.message}`);
      results.push({ url, error: err.message });
    }

    if (i < todo.length - 1) {
      const wait = jitter();
      console.log(`  ⏳ Waiting ${(wait/1000).toFixed(1)}s...`);
      await sleep(wait);
    }
  }

  /* ── DOWNLOAD ────────────────────────────────────────────────── */

  console.log('%c ✓ Scrape complete!', 'color:#0d9488;font-weight:bold;font-size:14px');
  console.log(`Total pages: ${results.length}`);

  const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = 'oss-site-content.json';
  a.click();

  console.log('📁 oss-site-content.json downloaded.');
  console.log('You can also access results via: JSON.parse(localStorage.getItem("oss_scrape")).results');

})();
