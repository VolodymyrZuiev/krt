// 6 ЗБАЛАНСОВАНИХ ПОДІЙ КАТАЛОГУ
const eventsData = [
    {
        id: 1,
        title: "ЛЕКЦІЯ: ІСТОРІЯ ТА КУЛЬТУРА УРАЖЕНОГО ХАРКОВА",
        city: "Київ",
        category: "Лекція",
        dateStr: "15 ЖОВТНЯ, ВТ, 18:30",
        posterHorizontal: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200",
        posterVertical: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800",
        seatsLeft: 14,
        terms: "Безоплатна участь",
        isDonation: false,
        description: "Глибока дискусія про виклики збереження культурної спадщини Сходу України під час війни. Лектор — історик та боєць бригади «Хартія»."
    },
    {
        id: 2,
        title: "ТРЕНІНГ З ДОМЕДИЧНОЇ ДОПОМОГИ (MARCH)",
        city: "Львів",
        category: "Тренінг",
        dateStr: "18 ЖОВТНЯ, СБ, 11:00",
        posterHorizontal: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200",
        posterVertical: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
        seatsLeft: 5,
        terms: "Участь за донат на Банку Хабу",
        isDonation: true,
        description: "Практичне відпрацювання зупинки критичних кровотеч, використання турнікетів та відновлення дихальних шляхів за протоколом MARCH."
    },
    {
        id: 3,
        title: "ПСИХОЛОГІЧНА ЗУСТРІЧ ДЛЯ РОДИН ВІЙСЬКОВИХ",
        city: "Полтава",
        category: "Психологія",
        dateStr: "20 ЖОВТНЯ, ПН, 17:00",
        posterHorizontal: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200",
        posterVertical: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800",
        seatsLeft: 8,
        terms: "Безоплатна участь",
        isDonation: false,
        description: "Безпечний простір для підтримки, обміну досвідом та отримання фахових порад від військових психологів за стандартами НАТО."
    },
    {
        id: 4,
        title: "ПЕРЕГЛЯД СТРІЧКИ «ВАРТОВІ ХАРТІЇ» ТА ДИСКУСІЯ",
        city: "Дніпро",
        category: "Кіно",
        dateStr: "22 ЖОВТНЯ, СР, 19:00",
        posterHorizontal: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200",
        posterVertical: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",
        seatsLeft: 22,
        terms: "Участь за донат на Банку Хабу",
        isDonation: true,
        description: "Документальне кіно про шлях добровольчого формування до 2-го корпусу НГУ. Після перегляду — відкрита дискусія з творцями стрічки."
    },
    {
        id: 5,
        title: "ДИСКУСІЯ З МЕДІЙНИКАМИ: ІНФОРМАЦІЙНИЙ ФРОНТ",
        city: "Івано-Франківськ",
        category: "Дискусія",
        dateStr: "25 ЖОВТНЯ, СБ, 15:00",
        posterHorizontal: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200",
        posterVertical: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800",
        seatsLeft: 12,
        terms: "Безоплатна участь",
        isDonation: false,
        description: "Розмова з провідними воєнкорами та журналістами про протидію російським дезінформаційним операціям у сучасному просторі."
    },
    {
        id: 6,
        title: "ЛЕКЦІЯ: НОВЕ УКРАЇНСЬКЕ ВІЙСЬКО ТА ТЕХНОЛОГІЇ",
        city: "Київ",
        category: "Лекція",
        dateStr: "28 ЖОВТНЯ, ВТ, 18:00",
        posterHorizontal: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200",
        posterVertical: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
        seatsLeft: 19,
        terms: "Безоплатна участь",
        isDonation: false,
        description: "Презентація інновацій, безпілотних систем та сучасного управління в підрозділах 2-го корпусу НГУ «Хартія»."
    }
];

const locationsData = {
    kyiv: { name: "Київ", coords: [50.4385, 30.5180], addr: "вул. Шота Руставелі, 39/41" },
    poltava: { name: "Полтава", coords: [49.5896, 34.5512], addr: "вул. В’ячеслава Чорновола, 7Б" },
    lviv: { name: "Львів", coords: [49.8415, 24.0255], addr: "вул. Академіка Гнатюка, 17" },
    dnipro: { name: "Дніпро", coords: [48.4623, 35.0485], addr: "вул. Барикадна, 20" },
    if: { name: "Івано-Франківськ", coords: [48.9182, 24.7145], addr: "вул. Академіка Сахарова, 23" }
};

let savedEventIds = JSON.parse(localStorage.getItem('khartiia_saved_events')) || [];
let currentSelectedEvent = null;
let map, mapMarkers = {};

document.addEventListener('DOMContentLoaded', () => {
    // TOUCHDESIGNER CANVAS З ВУЗЛОВИМИ З'ЄДНАННЯМИ
    initConnectedTouchDesignerCanvas();

    // MOBILE BURGER MENU
    const burgerBtn = document.getElementById('burgerBtn');
    const mainNav = document.getElementById('mainNav');
    if (burgerBtn && mainNav) {
        burgerBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => mainNav.classList.remove('active'));
        });
    }

    const eventsGrid = document.getElementById('eventsGrid');
    const filterCity = document.getElementById('filterCity');
    const filterCategory = document.getElementById('filterCategory');
    const filterSearch = document.getElementById('filterSearch');

    function renderEvents() {
        if (!eventsGrid) return;
        eventsGrid.innerHTML = '';

        const selectedCity = filterCity.value;
        const selectedCat = filterCategory.value;
        const searchQuery = filterSearch.value.toLowerCase();

        const filtered = eventsData.filter(ev => {
            const matchesCity = (selectedCity === 'all' || ev.city === selectedCity);
            const matchesCat = (selectedCat === 'all' || ev.category === selectedCat);
            const matchesSearch = ev.title.toLowerCase().includes(searchQuery);
            return matchesCity && matchesCat && matchesSearch;
        });

        if (filtered.length === 0) {
            eventsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: left; padding: 40px 0;">За вашим запитом подій не знайдено.</p>';
            return;
        }

        filtered.forEach(ev => {
            const isSaved = savedEventIds.includes(ev.id);
            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
                <div class="poster-wrapper-1200x640">
                    <img src="${ev.posterHorizontal}" class="event-poster-img" alt="${ev.title}">
                    <button class="btn-heart ${isSaved ? 'active' : ''}" data-id="${ev.id}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                    </button>
                </div>
                <div class="card-content">
                    <div class="card-meta">
                        <span class="badge-city">${ev.city.toUpperCase()}</span>
                        <span class="card-datetime">${ev.dateStr}</span>
                    </div>
                    <h3 class="card-event-title">${ev.title}</h3>
                    <div class="seats-counter">Залишилось місць: ${ev.seatsLeft}</div>
                    <button class="btn-register-card" data-open-event="${ev.id}">ЗАРЕЄСТРУВАТИСЯ</button>
                </div>
            `;
            eventsGrid.appendChild(card);
        });

        attachCardEvents();
    }

    function attachCardEvents() {
        document.querySelectorAll('.btn-heart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-id'));
                if (savedEventIds.includes(id)) {
                    savedEventIds = savedEventIds.filter(item => item !== id);
                } else {
                    savedEventIds.push(id);
                }
                localStorage.setItem('khartiia_saved_events', JSON.stringify(savedEventIds));
                renderEvents();
            });
        });

        document.querySelectorAll('[data-open-event]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-open-event'));
                openEventModal(id);
            });
        });
    }

    // КЛИКИ ПО ФИЛЬТРАМ В СЕКЦИЯХ
    document.querySelectorAll('[data-filter-cat]').forEach(link => {
        link.addEventListener('click', () => {
            const cat = link.getAttribute('data-filter-cat');
            if (filterCategory) {
                filterCategory.value = cat;
                renderEvents();
            }
        });
    });

    // МОДАЛКА ПОДІЇ
    const eventModal = document.getElementById('eventModal');
    function openEventModal(id) {
        const ev = eventsData.find(item => item.id === id);
        if (!ev) return;
        currentSelectedEvent = ev;

        document.getElementById('modalCity').innerText = ev.city.toUpperCase();
        document.getElementById('modalDateTime').innerText = ev.dateStr;
        document.getElementById('modalTitle').innerText = ev.title;
        document.getElementById('modalDescription').innerHTML = `<p>${ev.description}</p>`;
        document.getElementById('modalTerms').innerText = ev.terms;
        document.getElementById('modalSeats').innerText = `Залишилось місць: ${ev.seatsLeft}`;
        document.getElementById('modalPoster').src = ev.posterVertical;

        const donateBtn = document.getElementById('modalDonateBtn');
        donateBtn.style.display = ev.isDonation ? 'inline-block' : 'none';

        eventModal.classList.add('active');
    }

    document.getElementById('closeEventModal').addEventListener('click', () => {
        eventModal.classList.remove('active');
    });

    // МОДАЛКА КАБИНЕТА / АУТЕНТИФИКАЦИИ
    const cabinetModal = document.getElementById('cabinetModal');
    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabRegisterBtn = document.getElementById('tabRegisterBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const userSavedArea = document.getElementById('userSavedArea');

    document.getElementById('openCabinetBtn').addEventListener('click', () => {
        cabinetModal.classList.add('active');
    });

    document.getElementById('closeCabinetModal').addEventListener('click', () => {
        cabinetModal.classList.remove('active');
    });

    tabLoginBtn.addEventListener('click', () => {
        tabLoginBtn.classList.add('active');
        tabRegisterBtn.classList.remove('active');
        loginForm.style.display = 'flex';
        registerForm.style.display = 'none';
    });

    tabRegisterBtn.addEventListener('click', () => {
        tabRegisterBtn.classList.add('active');
        tabLoginBtn.classList.remove('active');
        registerForm.style.display = 'flex';
        loginForm.style.display = 'none';
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        alert(`Вітаємо, ${email}! Ви успішно увійшли.`);
        loginForm.style.display = 'none';
        document.querySelector('.sso-container').style.display = 'none';
        userSavedArea.style.display = 'block';
        renderCabinetSavedEvents();
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('regAccName').value;
        alert(`Дякуємо за реєстрацію, ${name}! Аккаунт створено.`);
        registerForm.style.display = 'none';
        document.querySelector('.sso-container').style.display = 'none';
        userSavedArea.style.display = 'block';
        renderCabinetSavedEvents();
    });

    document.getElementById('btnGoogleAuth').addEventListener('click', () => {
        alert("Google SSO Авторизація пройшла успішно!");
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        document.querySelector('.sso-container').style.display = 'none';
        userSavedArea.style.display = 'block';
        renderCabinetSavedEvents();
    });

    function renderCabinetSavedEvents() {
        const savedGrid = document.getElementById('savedEventsGrid');
        savedGrid.innerHTML = '';

        const savedList = eventsData.filter(ev => savedEventIds.includes(ev.id));
        if (savedList.length === 0) {
            savedGrid.innerHTML = '<p style="color:#C5C5C5; padding:20px 0;">У вас немає збережених подій.</p>';
            return;
        }

        savedList.forEach(ev => {
            const item = document.createElement('div');
            item.className = 'event-card';
            item.innerHTML = `
                <div class="card-content">
                    <span class="badge-city">${ev.city}</span>
                    <h4 class="card-event-title" style="font-size:16px; margin: 8px 0;">${ev.title}</h4>
                    <span class="card-datetime">${ev.dateStr}</span>
                </div>
            `;
            savedGrid.appendChild(item);
        });
    }

    filterCity.addEventListener('change', renderEvents);
    filterCategory.addEventListener('change', renderEvents);
    filterSearch.addEventListener('input', renderEvents);

    const regForm = document.getElementById('eventRegistrationForm');
    if (regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (currentSelectedEvent && currentSelectedEvent.seatsLeft > 0) {
                currentSelectedEvent.seatsLeft -= 1;
            }

            const btn = regForm.querySelector('.btn-submit-reg');
            btn.innerText = 'УСПІШНО ЗАРЕЄСТРОВАНО!';
            btn.style.backgroundColor = '#FFFFFF';
            btn.style.color = '#000000';
            btn.disabled = true;

            setTimeout(() => {
                eventModal.classList.remove('active');
                regForm.reset();
                btn.innerText = 'ПІДТВЕРДИТИ РЕЄСТРАЦІЮ';
                btn.style.backgroundColor = 'var(--color-accent)';
                btn.disabled = false;
                renderEvents();
            }, 1800);
        });
    }

    document.getElementById('btnAddToCalendar').addEventListener('click', () => {
        if (!currentSelectedEvent) return;
        const title = encodeURIComponent(currentSelectedEvent.title);
        const details = encodeURIComponent(currentSelectedEvent.description);
        const location = encodeURIComponent(currentSelectedEvent.city);
        const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
        window.open(googleCalUrl, '_blank');
    });

    function initMap() {
        if (!document.getElementById('map')) return;

        map = L.map('map', { zoomControl: false }).setView([49.0, 31.0], 6);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 18,
            subdomains: 'abcd'
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        Object.keys(locationsData).forEach(key => {
            const loc = locationsData[key];
            const customIcon = L.divIcon({
                className: 'custom-map-pin',
                html: `<div style="background:#B5D553; width:14px; height:14px; border:2px solid #000; box-shadow:0 0 10px #B5D553;"></div>`,
                iconSize: [14, 14]
            });

            const marker = L.marker(loc.coords, { icon: customIcon }).addTo(map);
            marker.bindPopup(`<strong style="color:#000;">ХАРТІЯ-ХАБ ${loc.name.toUpperCase()}</strong><br><span style="color:#333;">${loc.addr}</span>`);
            mapMarkers[key] = marker;
        });

        document.querySelectorAll('.loc-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.loc-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                const cityKey = card.getAttribute('data-city');
                const loc = locationsData[cityKey];
                if (loc && map) {
                    map.flyTo(loc.coords, 13, { duration: 1.2 });
                    mapMarkers[cityKey].openPopup();
                }
            });
        });
    }

    renderEvents();
    initMap();
});

// TOUCHDESIGNER CANVAS WITH NODE CONNECTIONS
function initConnectedTouchDesignerCanvas() {
    const canvas = document.getElementById('touchCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // ЗМЕНШЕНО КІЛЬКІСТЬ ДО 32 ЧИСТИХ ВУЗЛІВ
    const elements = [];
    const count = 32;

    for (let i = 0; i < count; i++) {
        elements.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 8 + 6,
            speedX: (Math.random() - 0.5) * 0.6,
            speedY: (Math.random() - 0.5) * 0.6,
            opacity: Math.random() * 0.6 + 0.2,
            fadeSpeed: Math.random() * 0.008 + 0.003,
            fadeIn: Math.random() > 0.5,
            coordLat: (48.000 + Math.random() * 3.5).toFixed(4),
            coordLng: (30.000 + Math.random() * 6.5).toFixed(4)
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // З'ЄДНАННЯ ЛІНІЯМИ СУСІДНІХ ЕЛЕМЕНТІВ (МЕРЕЖЕВИЙ ЕФЕКТ TOUCHDESIGNER)
        for (let a = 0; a < elements.length; a++) {
            for (let b = a + 1; b < elements.length; b++) {
                let dx = elements[a].x - elements[b].x;
                let dy = elements[a].y - elements[b].y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 140) {
                    let lineOpacity = (1 - dist / 140) * Math.min(elements[a].opacity, elements[b].opacity) * 0.35;
                    ctx.strokeStyle = `rgba(181, 213, 83, ${lineOpacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(elements[a].x + elements[a].size / 2, elements[a].y + elements[a].size / 2);
                    ctx.lineTo(elements[b].x + elements[b].size / 2, elements[b].y + elements[b].size / 2);
                    ctx.stroke();
                }
            }
        }

        elements.forEach(el => {
            el.x += el.speedX;
            el.y += el.speedY;

            if (el.x < 0) el.x = width;
            if (el.x > width) el.x = 0;
            if (el.y < 0) el.y = height;
            if (el.y > height) el.y = 0;

            if (el.fadeIn) {
                el.opacity += el.fadeSpeed;
                if (el.opacity >= 0.7) el.fadeIn = false;
            } else {
                el.opacity -= el.fadeSpeed;
                if (el.opacity <= 0.05) {
                    el.fadeIn = true;
                    el.coordLat = (48.000 + Math.random() * 3.5).toFixed(4);
                    el.coordLng = (30.000 + Math.random() * 6.5).toFixed(4);
                }
            }

            // РАМКА ВУЗЛА
            ctx.strokeStyle = `rgba(181, 213, 83, ${el.opacity})`;
            ctx.lineWidth = 1.2;
            ctx.strokeRect(el.x, el.y, el.size, el.size);

            // МІКРО-ТЕКСТ КООРДИНАТ
            ctx.fillStyle = `rgba(181, 213, 83, ${el.opacity * 0.8})`;
            ctx.font = '9px "Inter Tight", sans-serif';
            ctx.fillText(`${el.coordLat}°N ${el.coordLng}°E`, el.x + el.size + 6, el.y + 7);
        });

        requestAnimationFrame(animate);
    }

    animate();
}