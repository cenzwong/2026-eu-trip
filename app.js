let tripData = {};

async function init() {
    try {
        const response = await fetch('trip_data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        tripData = await response.json();
    } catch (e) {
        console.error("Could not load trip data", e);
        // Fallback or alert
        const msg = "Error loading trip data. Please ensure you are running this on a local server (e.g., 'python3 -m http.server').\n\nDetails: " + e.message;
        alert(msg);
        return;
    }

    document.getElementById('trip-title').innerText = tripData.info.title;
    document.getElementById('trip-dates').innerText = tripData.info.dates;

    document.getElementById('flight-container').innerHTML = tripData.info.flights.map(f => `
        <div class="bg-white/10 border border-white/20 p-3.5 rounded-2xl flex justify-between items-center backdrop-blur-sm shadow-sm">
            <div class="flex flex-col">
                <span class="text-[9px] font-black text-indigo-200 uppercase tracking-widest">${f.id}</span>
                <span class="font-bold text-sm tracking-tight">${f.route}</span>
            </div>
            <div class="text-right">
                <span class="block text-xs font-bold">${f.time}</span>
                <span class="text-[9px] text-indigo-300 font-bold">REF: ${f.ref}</span>
            </div>
        </div>
    `).join('');

    const nav = document.getElementById('day-nav');
    nav.innerHTML = tripData.days.map(d => `
        <button id="nav-day-${d.dayNum}" onclick="renderDay(${d.dayNum})" class="flex-shrink-0 w-16 h-20 bg-white rounded-[1.25rem] flex flex-col items-center justify-center shadow-sm border border-slate-100 transition-all duration-300">
            <span class="text-[10px] font-bold text-slate-400 uppercase mb-0.5">${d.date.split(' ')[0]}</span>
            <span class="text-xl font-black text-slate-700 leading-none">${d.date.split(' ')[1]}</span>
        </button>
    `).join('');

    renderAll();
    renderLibraryItems('all');
    if (window.lucide) {
        lucide.createIcons();
    }
}

function switchView(view) {
    const planBtn = document.getElementById('nav-plan');
    const discoverBtn = document.getElementById('nav-discover');
    const planView = document.getElementById('itinerary-view');
    const discoverView = document.getElementById('discovery-view');
    const header = document.getElementById('main-header');
    const icon = document.getElementById('header-icon');

    if (view === 'itinerary') {
        planView.classList.remove('hidden');
        discoverView.classList.add('hidden');
        planBtn.classList.add('text-indigo-600');
        planBtn.classList.remove('text-slate-400');
        discoverBtn.classList.add('text-slate-400');
        discoverBtn.classList.remove('text-indigo-600');
        header.classList.remove('h-24', 'pt-8');
        header.classList.add('pt-14');
        icon.setAttribute('data-lucide', 'plane');
    } else {
        planView.classList.add('hidden');
        discoverView.classList.remove('hidden');
        planBtn.classList.add('text-slate-400');
        planBtn.classList.remove('text-indigo-600');
        discoverBtn.classList.add('text-indigo-600');
        discoverBtn.classList.remove('text-slate-400');
        header.classList.add('h-24', 'pt-8');
        header.classList.remove('pt-14');
        icon.setAttribute('data-lucide', 'book-open');
    }
    if (window.lucide) {
        lucide.createIcons();
    }
    window.scrollTo(0,0);
}

function renderActivity(item) {
    return `
        <div class="relative pl-14">
            <div class="absolute left-0 top-0 w-11 h-11 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 z-10 shadow-sm">
                <i data-lucide="${item.icon}" class="w-5 h-5"></i>
            </div>
            <div class="bg-white rounded-3xl p-1">
                <div class="flex items-center gap-2">
                    <span class="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">${item.time}</span>
                    <div class="flex flex-col">
                        <h4 class="font-bold text-slate-800 text-sm leading-tight">${item.titleEn}</h4>
                        <span class="text-[11px] font-bold text-slate-400">${item.titleZh}</span>
                    </div>
                    ${item.libraryId ? `
                        <button onclick="openDetail('${item.libraryId}')" class="ml-auto bg-indigo-100 text-indigo-700 text-[9px] font-black px-2 py-1 rounded-md uppercase flex items-center gap-1">
                            <i data-lucide="info" class="w-2.5 h-2.5"></i> Detail
                        </button>
                    ` : ''}
                </div>
                <p class="text-[13px] text-slate-500 mt-2 leading-relaxed font-medium">${item.desc}</p>
                ${item.map ? `
                    <a href="${item.map}" target="_blank" class="inline-flex items-center gap-2 mt-4 text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2.5 rounded-xl border border-indigo-100">
                        <i data-lucide="map-pin" class="w-3.5 h-3.5"></i> OPEN IN GOOGLE MAPS
                    </a>
                ` : ''}
            </div>
        </div>
    `;
}

function openDetail(id) {
    const data = tripData.library[id];
    const content = document.getElementById('modal-content');

    // Construct Google AI Search URL based on title
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(data.titleEn + ' ' + data.titleZh + ' 廣東話介紹')}&udm=50`;

    content.innerHTML = `
        <div class="flex items-center gap-4 mb-6">
            <div class="bg-indigo-600 text-white p-4 rounded-3xl">
                <i data-lucide="${getIconByCategory(data.category)}" class="w-8 h-8"></i>
            </div>
            <div>
                <h2 class="text-2xl font-black text-slate-800 leading-tight">${data.titleEn}</h2>
                <h3 class="text-indigo-600 font-bold">${data.titleZh}</h3>
            </div>
        </div>
        <div class="space-y-4">
            <div class="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <p class="text-[14px] text-slate-600 leading-relaxed font-medium">${data.desc}</p>
            </div>
            <div class="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 flex gap-4 items-start">
                <span class="text-2xl">💡</span>
                <p class="text-[14px] text-indigo-700 font-black italic">「${data.slang}」</p>
            </div>

            <!-- AI SEARCH LINK -->
            <a href="${searchUrl}" target="_blank" class="ai-search-btn w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-black text-sm shadow-lg mt-4">
                <i data-lucide="sparkles" class="w-4 h-4"></i>
                Google AI 廣東話介紹
                <i data-lucide="external-link" class="w-3.5 h-3.5 opacity-70"></i>
            </a>
        </div>
    `;
    document.getElementById('detail-modal').classList.remove('hidden');
    if (window.lucide) {
        lucide.createIcons();
    }
}

function closeModal() {
    document.getElementById('detail-modal').classList.add('hidden');
}

function filterLibrary(cat) {
    document.querySelectorAll('#discovery-view button').forEach(b => b.classList.remove('category-tab-active', 'bg-white', 'text-slate-500'));
    document.getElementById(`tab-${cat}`).classList.add('category-tab-active');
    renderLibraryItems(cat);
}

function renderLibraryItems(cat) {
    const grid = document.getElementById('library-grid');
    const items = Object.values(tripData.library).filter(i => cat === 'all' || i.category === cat);

    grid.innerHTML = items.map(item => `
        <div onclick="openDetail('${item.id}')" class="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm active:scale-95 transition-all">
            <div class="flex justify-between items-start mb-3">
                <div class="bg-slate-50 p-3 rounded-2xl">
                    <i data-lucide="${getIconByCategory(item.category)}" class="w-5 h-5 text-indigo-600"></i>
                </div>
                <span class="text-[9px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-1 rounded-md">${item.category}</span>
            </div>
            <h4 class="font-black text-slate-800 text-lg leading-tight">${item.titleEn}</h4>
            <p class="text-indigo-600 font-bold text-sm">${item.titleZh}</p>
            <p class="text-[11px] text-slate-400 mt-2 line-clamp-2">${item.desc}</p>
        </div>
    `).join('');
    if (window.lucide) {
        lucide.createIcons();
    }
}

function getIconByCategory(cat) {
    switch(cat) {
        case 'food': return 'utensils-cross-hairs';
        case 'sight': return 'map-pin';
        case 'art': return 'palette';
        default: return 'info';
    }
}

function renderDay(num) {
    const day = tripData.days.find(d => d.dayNum === num);
    document.querySelectorAll('#day-nav button').forEach(b => b.classList.remove('day-tab-active'));
    document.getElementById(`nav-day-${num}`).classList.add('day-tab-active');
    document.getElementById(`nav-day-${num}`).scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    document.getElementById('view-label-en').innerText = `Day ${day.dayNum}: ${day.cityEn}`;
    document.getElementById('view-label-zh').innerText = `${day.cityZh} · ${day.date}`;
    const list = document.getElementById('itinerary-list');
    list.innerHTML = `
        <div class="animate-in fade-in slide-in-from-bottom-6 duration-500 timeline-line relative">
            <div class="mb-10 px-2">
                <p class="text-[13px] text-slate-500 font-bold italic border-l-4 border-indigo-200 pl-4 py-1">「${day.summary}」</p>
            </div>
            <div class="space-y-14">
                ${day.items.map(item => renderActivity(item)).join('')}
            </div>
        </div>
    `;
    if (window.lucide) {
        lucide.createIcons();
    }
    window.scrollTo({ top: 250, behavior: 'smooth' });
}

function renderAll() {
    document.querySelectorAll('#day-nav button').forEach(b => b.classList.remove('day-tab-active'));
    document.getElementById('view-label-en').innerText = "Full Trip Plan";
    document.getElementById('view-label-zh').innerText = "完整行程總覽";
    const list = document.getElementById('itinerary-list');
    list.innerHTML = tripData.days.map(day => `
        <div class="mb-20">
            <div class="flex items-center gap-3 mb-10 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div class="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl uppercase">Day ${day.dayNum}</div>
                <div class="flex flex-col">
                    <span class="text-sm font-black text-slate-800">${day.cityEn} / ${day.cityZh}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${day.date}</span>
                </div>
            </div>
            <div class="space-y-14 timeline-line relative">
                ${day.items.map(item => renderActivity(item)).join('')}
            </div>
        </div>
    `).join('');
    if (window.lucide) {
        lucide.createIcons();
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showBooking() {
    const modal = document.createElement('div');
    modal.className = "fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md";
    modal.innerHTML = `
        <div class="bg-white rounded-[2.5rem] w-full max-w-xs p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 class="text-xl font-black text-slate-800 mb-1 text-center">Booking Ref.</h3>
            <div class="bg-indigo-50 p-8 rounded-[2rem] text-center my-8 border border-indigo-100">
                <span class="text-4xl font-black text-indigo-600 tracking-[0.2em] uppercase">ZZNC65</span>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="w-full py-4.5 bg-slate-900 text-white rounded-2xl font-bold">CLOSE / 關閉</button>
        </div>
    `;
    document.body.appendChild(modal);
}

window.onload = init;
