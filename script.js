const lifeDesks = [
  { id: "markets", label: "国际主要股市与大宗商品", cadence: "每日/每周", scope: "国际主要股市与大宗商品市场的价格、行业和价值线索", topicIds: ["stocks", "commodities"] },
  { id: "ai", label: "人工智能动向", cadence: "每周", scope: "主要公司、新应用软件、应用方向与工具", topicIds: ["ai"] },
  { id: "scenery", label: "风景与文化景观", cadence: "每周", scope: "世界遗产、文化景观与可公开分享的风景信息", topicIds: ["scenery"] }
];

const publicPhotos = [
  { id: "naomaohu-light", title: "《天谕》", group: "2026年4月 · 新疆同日记录", label: "4月27日", image: "assets/xinjiang-2026-04-01.jpg", alt: "淖毛湖天光穿透云层与山脉的风景照", location: "中国新疆哈密伊吾县淖毛湖", description: "天光穿过厚云，落在山体与旷野之间，像在戈壁边缘打开一道安静的天幕。", detail: "淖毛湖位于伊吾县北部，周边兼具戈壁、能源基地与边塞地貌。这里的光线、风沙和辽阔感，很容易把时间拉长。", source: "伊吾县政府", sourceUrl: "https://www.xjyiwu.gov.cn/xjyiwu/c119597/zjyw.shtml" },
  { id: "hami-dance", title: "《维舞》", group: "2026年4月 · 新疆同日记录", label: "4月27日", image: "assets/xinjiang-2026-04-02.jpg", alt: "哈密市室内舞台上的新疆歌舞表演照片", location: "中国新疆哈密市", description: "舞台灯光、服饰与旋转动作把哈密的多民族文化气息一下子推到眼前，热烈又鲜明。", detail: "哈密是新疆东部门户，城市里的歌舞、饮食与日常表演常常把多民族交融的节奏直接表现出来。", source: "哈密市文博院", sourceUrl: "https://www.hami.gov.cn/hami/xhtml/mlhm/mlhm_hmswby.html" },
  { id: "naomaohu-solar", title: "《光热发电》", group: "2026年4月 · 新疆同日记录", label: "4月27日", image: "assets/xinjiang-2026-04-03.jpg", alt: "淖毛湖光热发电项目高塔与镜场照片", location: "中国新疆哈密伊吾县淖毛湖", description: "高塔直立在镜场之上，工业尺度和戈壁尺度叠在一起，像是把能源转型真正落到了地平线上。", detail: "新疆之行去哈密煤化工园区时，途径中国能建的光热发电项目。采用的是光热熔盐蓄热发电技术，可以看到聚光塔上明亮的白炽！", source: "伊吾县政府", sourceUrl: "https://www.xjyiwu.gov.cn/xjyiwu/c119597/zjyw.shtml" },
  { id: "fengxian-tea-chant", title: "《奉贤茶吟》", group: "2026年8月 · 奉贤", label: "8月", image: "assets/fengxian-tea-chant.jpg", alt: "上海奉贤农田河边的两层环形圈屋、草地与庭院灯", location: "中国上海奉贤", description: "上海奉贤的一片农田之中，小河边上一座两层环形圈屋，中央敞向天际的是一汪圆形鱼池，锦鲤在水中游弋……", detail: "", source: "公开相册", sourceUrl: "#photo-fengxian-tea-chant" }
];

const state = { data: null, filter: "all" };

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function hasSafeHttpUrl(value) {
  try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:"; } catch { return false; }
}

function latestItems(topicIds, maximum = 3) {
  if (!state.data?.topics) return [];
  const ids = new Set(topicIds);
  return state.data.topics.filter((topic) => ids.has(topic.id)).flatMap((topic) => topic.items.map((item) => ({ item, topic }))).filter(({ item }) => hasSafeHttpUrl(item.url)).sort((a, b) => new Date(b.item.publishedAt) - new Date(a.item.publishedAt)).slice(0, maximum);
}

function renderNewsItem(item, heading = "h4") {
  const sourceLink = hasSafeHttpUrl(item.url) ? `<a class="focus-source-link" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">查看原文 <span aria-hidden="true">↗</span></a>` : `<span class="focus-source-link is-muted">等待可靠来源更新</span>`;
  return `<article class="focus-item"><span class="tag">${escapeHtml(item.kind || "新闻")}</span><${heading}>${escapeHtml(item.title)}</${heading}><p>${escapeHtml(item.summary)}</p><div class="focus-item-footer"><span class="focus-item-meta">${escapeHtml(item.source || "来源待确认")} · ${escapeHtml(item.publishedAt || "日期待确认")}</span>${sourceLink}</div></article>`;
}

function renderDesk() {
  const update = document.getElementById("focus-updated");
  if (update) update.textContent = state.data ? `最后成功更新 · ${new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "short", day: "numeric" }).format(new Date(state.data.updatedAt))}` : "暂时无法载入更新";
  const filters = document.getElementById("intel-filter-bar");
  if (filters) filters.innerHTML = [{ id: "all", label: "全部信息" }, ...lifeDesks.map((desk) => ({ id: desk.id, label: desk.label }))].map((filter) => `<button class="intel-filter" type="button" data-intel-filter="${filter.id}" aria-pressed="${state.filter === filter.id}">${filter.label}</button>`).join("");
  const signals = document.getElementById("intel-weekly-signals");
  if (signals) signals.innerHTML = `<div class="intel-signals-heading"><p class="section-kicker">WEEKLY SIGNALS</p><h3>本周三条信号</h3></div><div class="intel-signal-grid">${latestItems(lifeDesks.flatMap((desk) => desk.topicIds)).map(({ item, topic }) => `<article class="intel-signal-card"><p class="focus-topic-label">${escapeHtml(topic.name)}</p>${renderNewsItem(item)}</article>`).join("") || "<p>正在汇总可靠来源。</p>"}</div>`;
  const live = document.getElementById("intel-live-briefs");
  if (live) live.innerHTML = lifeDesks.filter((desk) => state.filter === "all" || state.filter === desk.id).map((desk) => {
    const topics = state.data?.topics?.filter((topic) => desk.topicIds.includes(topic.id)) || [];
    return `<article class="intel-card intel-live-card" id="${desk.id}"><div class="intel-topline"><span class="tag">${desk.cadence}</span><span class="tag">自动更新</span></div><h3>${desk.label}</h3><p>${desk.scope}</p><div class="intel-topic-briefs">${topics.map((topic) => `<section class="intel-topic-brief"><p class="focus-topic-label">${escapeHtml(topic.name)}</p><div class="focus-items">${topic.items.slice(0, 3).map((item) => renderNewsItem(item)).join("")}</div></section>`).join("")}</div></article>`;
  }).join("");
  const directory = document.getElementById("global-resource-directory");
  if (directory && state.data?.topics) directory.innerHTML = `<div class="global-resource-heading"><p class="section-kicker">GLOBAL DIRECTORY</p><h3>全球信息资源调度台</h3><p>人工智能、国际股市、大宗商品与风景文化的权威来源</p></div><div class="global-resource-grid">${state.data.topics.map((topic) => `<article class="global-resource-card"><p class="focus-topic-label">${escapeHtml(topic.name)}</p><div class="global-resource-links">${topic.sources.filter((source) => hasSafeHttpUrl(source.url)).map((source) => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.name)} <span aria-hidden="true">↗</span></a>`).join("")}</div></article>`).join("")}</div>`;
}

function renderFramework() {
  const container = document.getElementById("framework-overview");
  if (!container) return;
  const sections = [
    { id: "framework-capital", kicker: "01 · CAPITAL TRENDS", title: "资本趋势", copy: "国际主要股市与大宗商品市场的阶段信息。", topicIds: ["stocks", "commodities"] },
    { id: "framework-scenery", kicker: "02 · SCENERY & CULTURE", title: "风景与文化", copy: "公开的风景照片，以及信息台中的文化与景观更新。", topicIds: ["scenery"] },
    { id: "framework-ai", kicker: "03 · AI TRENDS", title: "人工智能动向", copy: "主要公司、基础模型、新应用与行业工具。", topicIds: ["ai"] }
  ];
  container.innerHTML = sections.map((section) => {
    const items = latestItems(section.topicIds);
    const photos = section.id === "framework-scenery" ? `<div class="framework-overview-photos">${publicPhotos.slice(0, 3).map((photo) => `<figure><img src="${photo.image}" alt="${escapeHtml(photo.alt)}"><figcaption>${photo.title}</figcaption></figure>`).join("")}</div>` : "";
    return `<section class="framework-overview-section" id="${section.id}"><div class="framework-overview-heading"><div><p class="section-kicker">${section.kicker}</p><h2>${section.title}</h2><p>${section.copy}</p></div><a href="${section.id === "framework-scenery" ? "memories.html" : "intelligence.html"}">查看更多 <span aria-hidden="true">→</span></a></div>${photos}<div class="framework-overview-news-grid">${items.map(({ item, topic }) => `<div class="framework-overview-news"><p class="focus-topic-label">${escapeHtml(topic.name)}</p>${renderNewsItem(item, "h3")}</div>`).join("") || "<p>正在汇总可靠来源。</p>"}</div></section>`;
  }).join("");
}

function renderGallery() {
  const container = document.getElementById("public-gallery");
  if (!container) return;
  const groups = publicPhotos.reduce((all, photo) => { (all[photo.group] ||= []).push(photo); return all; }, {});
  const cards = publicPhotos.map((photo) => `<article class="photo-card" id="photo-${photo.id}"><button class="photo-zoom-trigger" type="button" data-full-image="${photo.image}" data-full-alt="${escapeHtml(photo.alt)}"><img src="${photo.image}" alt="${escapeHtml(photo.alt)}"></button><div class="photo-card-copy"><h3>${photo.title}</h3></div></article>`).join("");
  const fragments = Object.entries(groups).map(([label, photos]) => `<article class="fragment-day-card"><div class="calendar-entry-topline"><p class="memory-label">${label}</p><span class="calendar-entry-badge">${photos[0].label}</span></div><details class="calendar-entry-details"><summary>查看当天说明</summary><div class="fragment-day-list">${photos.map((photo) => `<details class="fragment-entry"><summary>${photo.title}</summary><div class="fragment-entry-body"><p class="photo-location">${photo.location}</p><p>${photo.description}</p>${photo.detail ? `<p>${photo.detail}</p>` : ""}<a class="fragment-link" href="${photo.sourceUrl}" target="_blank" rel="noreferrer">${photo.source}</a></div></details>`).join("")}</div></details></article>`).join("");
  container.innerHTML = `<article class="gallery-card gallery-card-feature"><h3>风景相册</h3><p>展示可以公开分享的山川、街景、建筑与旅途光影。</p><div class="photo-gallery">${cards}</div></article><article class="gallery-card gallery-card-feature"><h3>时间碎片</h3><p>记录适合对外分享的短句、见闻和途中片段。</p><div class="fragment-list">${fragments}</div></article>`;
}

function setupLightbox() {
  const lightbox = document.getElementById("lightbox");
  const image = document.getElementById("lightbox-image");
  if (!lightbox || !image) return;
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(".photo-zoom-trigger");
    if (trigger) { image.src = trigger.dataset.fullImage || ""; image.alt = trigger.dataset.fullAlt || ""; lightbox.hidden = false; return; }
    if (event.target === lightbox || event.target.closest(".lightbox-close")) { lightbox.hidden = true; image.src = ""; }
  });
}

document.addEventListener("click", (event) => { const filter = event.target.closest("[data-intel-filter]"); if (!filter) return; state.filter = filter.dataset.intelFilter || "all"; renderDesk(); });

async function loadData() {
  try { const response = await fetch("data/weekly-intelligence.json"); if (!response.ok) throw new Error("load failed"); state.data = await response.json(); } catch { state.data = null; }
  renderDesk(); renderFramework(); renderGallery(); setupLightbox();
}

loadData();
