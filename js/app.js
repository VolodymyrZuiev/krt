(() => {
    const D = window.SITE_DATA;
    const page = document.body.dataset.page;
    const isHome = page === 'home';
    const HOME_EVENTS_LIMIT = 9;
    const EVENTS_PAGE_SIZE = 9;
    const STORAGE_SAVED = 'khartiia_saved_events';
    const STORAGE_USER = 'khartiia_user';

    /* ---------- UTILS ---------- */

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

    const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);

    const homeLink = (hash) => (isHome ? hash : `index.html${hash}`);
    const eventUrl = (ev) => `event.html?id=${encodeURIComponent(ev.id)}`;
    const materialUrl = (m) => `material.html?id=${encodeURIComponent(m.id)}`;

    const fmtDay = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long' });
    const fmtWeekday = new Intl.DateTimeFormat('uk-UA', { weekday: 'short' });
    const fmtTime = new Intl.DateTimeFormat('uk-UA', { hour: '2-digit', minute: '2-digit' });
    const fmtFull = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });

    const formatEventDate = (ev) => {
        const d = new Date(ev.start);
        return `${fmtDay.format(d)}, ${fmtWeekday.format(d)}, ${fmtTime.format(d)}`;
    };
    const formatEventTimeRange = (ev) => {
        const range = fmtTime.format(new Date(ev.start));
        return ev.end ? `${range}–${fmtTime.format(new Date(ev.end))}` : range;
    };

    const upcomingEvents = () => {
        const now = Date.now();
        return D.events
            .filter((ev) => new Date(ev.end || ev.start).getTime() >= now)
            .sort((a, b) => new Date(a.start) - new Date(b.start));
    };

    const categoryLabel = (value) => D.categories.find((c) => c.value === value)?.label ?? value;
    const materialTypeLabel = (value) => D.materialTypes.find((t) => t.value === value)?.label ?? value;

    const icon = {
        instagram: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
        facebook: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
        tiktok: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>',
        youtube: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>',
        user: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        close: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>',
        heart: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
        calendar: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
        search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
        arrow: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
        chevronLeft: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>',
        chevronRight: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>',
        phone: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
        share: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'
    };

    const squares = (corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right']) =>
        corners.map((c) => `<span class="tactical-square ${c}" aria-hidden="true"></span>`).join('');

    /* ---------- SAVED EVENTS / USER ---------- */

    const readJSON = (key, fallback) => {
        try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
    };
    let savedIds = readJSON(STORAGE_SAVED, []).map(String);
    const isSaved = (id) => savedIds.includes(String(id));
    const toggleSaved = (id) => {
        id = String(id);
        savedIds = isSaved(id) ? savedIds.filter((x) => x !== id) : [...savedIds, id];
        localStorage.setItem(STORAGE_SAVED, JSON.stringify(savedIds));
        return isSaved(id);
    };

    /* ---------- TOAST ---------- */

    let toastTimer;
    const toast = (message) => {
        const el = $('#toast');
        if (!el) return;
        el.textContent = message;
        el.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2800);
    };

    /* ---------- LAYOUT: HEADER / FOOTER ---------- */

    const navItems = [
        { label: 'Події', href: isHome ? '#events' : 'events.html', key: 'events' },
        { label: 'Про хаб', href: homeLink('#about'), key: 'about' },
        { label: 'Проєкти', href: homeLink('#projects'), key: 'projects' },
        { label: 'Матеріали', href: 'materials.html', key: 'materials' },
        { label: 'Партнери', href: homeLink('#partners'), key: 'partners' },
        { label: 'Звітність', href: homeLink('#reports'), key: 'reports' },
        { label: 'Контакти', href: homeLink('#contacts'), key: 'contacts' }
    ];

    const activeNav = { events: 'events', event: 'events', materials: 'materials', material: 'materials' }[page];

    const socialsHtml = () => D.links.socials.map((s) => `
        <a href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.name)}">${icon[s.name.toLowerCase()] ?? ''}</a>
    `).join('');

    function renderHeader() {
        const mount = $('#site-header');
        if (!mount) return;
        mount.outerHTML = `
        <header class="site-header" id="siteHeader">
            <div class="header-inner">
                <a href="${isHome ? '#hero' : 'index.html'}" class="logo-link" aria-label="Хартія-Хаб — на головну">
                    <img src="img/hublogo.svg" alt="Хартія-Хаб" class="site-logo" width="220" height="85">
                </a>

                <nav class="main-nav" id="mainNav" aria-label="Головне меню">
                    ${navItems.map((n) => `
                        <a href="${n.href}" class="nav-link${activeNav === n.key ? ' is-active' : ''}"${activeNav === n.key ? ' aria-current="page"' : ''}>${n.label}</a>
                    `).join('')}
                    <a href="${esc(D.links.donate)}" target="_blank" rel="noopener" class="btn btn--primary btn--lg nav-donate">Задонатити</a>
                    <div class="socials socials--menu">${socialsHtml()}</div>
                </nav>

                <div class="header-right">
                    <div class="socials socials--header">${socialsHtml()}</div>
                    <a href="${esc(D.links.donate)}" target="_blank" rel="noopener" class="btn btn--primary btn--sm">Задонатити</a>
                    <button type="button" class="btn btn--ghost btn--sm btn-cabinet" data-open-cabinet aria-haspopup="dialog">
                        ${icon.user}<span>Кабінет</span>
                    </button>
                    <button type="button" class="burger-menu" id="burgerBtn" aria-label="Відкрити меню" aria-expanded="false" aria-controls="mainNav">
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </div>
        </header>`;
    }

    function renderFooter() {
        const mount = $('#site-footer');
        if (!mount) return;
        mount.outerHTML = `
        <footer class="site-footer">
            <div class="footer-container">
                <div class="footer-brand">
                    <img src="img/hublogo.svg" alt="Хартія-Хаб" class="footer-logo" width="220" height="85">
                    <p class="footer-copy">Просвітницький центр, що обʼєднує суспільство і військо.</p>
                    <div class="socials">${socialsHtml()}</div>
                </div>

                <nav class="footer-nav" aria-label="Навігація в підвалі">
                    ${navItems.map((n) => `<a href="${n.href}">${n.label}</a>`).join('')}
                </nav>

                <div class="footer-nav">
                    <a href="${esc(D.links.volunteerForm)}" target="_blank" rel="noopener">Стати волонтером</a>
                    <a href="${esc(D.links.donate)}" target="_blank" rel="noopener">Задонатити</a>
                    <a href="${esc(D.links.linktree)}" target="_blank" rel="noopener">Linktree Хабу</a>
                    <a href="${esc(D.links.khartiia)}" target="_blank" rel="noopener">khartiia.org</a>
                </div>
            </div>

            <div class="footer-bottom">
                <span>© ${new Date().getFullYear()} Хартія-Хаб</span>
                <a href="privacy.html" class="btn btn--ghost btn--sm">Політика конфіденційності</a>
            </div>
        </footer>
        <div class="toast" id="toast" role="status" aria-live="polite"></div>`;
    }

    function initMobileNav() {
        const burger = $('#burgerBtn');
        const nav = $('#mainNav');
        if (!burger || !nav) return;

        const setOpen = (open) => {
            nav.classList.toggle('active', open);
            burger.classList.toggle('active', open);
            burger.setAttribute('aria-expanded', String(open));
            burger.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
            document.documentElement.classList.toggle('nav-open', open);
        };

        burger.addEventListener('click', () => setOpen(!nav.classList.contains('active')));
        $$('.nav-link', nav).forEach((link) => link.addEventListener('click', () => setOpen(false)));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && nav.classList.contains('active')) { setOpen(false); burger.focus(); }
        });
        document.addEventListener('click', (e) => {
            if (nav.classList.contains('active') && !nav.contains(e.target) && !burger.contains(e.target)) setOpen(false);
        });
        window.matchMedia('(min-width: 1201px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
    }

    function initHeaderScrollState() {
        const header = $('#siteHeader');
        if (!header) return;
        const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
        update();
        window.addEventListener('scroll', update, { passive: true });
    }

    /* ---------- MODALS (native <dialog>) ---------- */

    const modal = {
        open(dialog) {
            if (!dialog || dialog.open) return;
            dialog.showModal();
            document.documentElement.classList.add('modal-open');
        },
        close(dialog) {
            if (!dialog?.open) return;
            dialog.classList.add('is-closing');
            const finish = () => {
                dialog.classList.remove('is-closing');
                dialog.close();
            };
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) finish();
            else setTimeout(finish, 180);
        },
        bind(dialog) {
            dialog.addEventListener('cancel', (e) => { e.preventDefault(); modal.close(dialog); });
            dialog.addEventListener('close', () => {
                if (!$$('dialog[open]').length) document.documentElement.classList.remove('modal-open');
            });
            // Клік по підкладці (поза вмістом діалогу) закриває вікно
            dialog.addEventListener('mousedown', (e) => { dialog._downOnBackdrop = e.target === dialog; });
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog && dialog._downOnBackdrop) modal.close(dialog);
            });
            $$('[data-close-modal]', dialog).forEach((btn) => btn.addEventListener('click', () => modal.close(dialog)));
        }
    };

    const modalHead = (titleId, title, subtitleId = '') => `
        <div class="modal__head">
            <div>
                <h2 class="modal__title" id="${titleId}">${title}</h2>
                ${subtitleId ? `<p class="modal__subtitle" id="${subtitleId}"></p>` : ''}
            </div>
            <button type="button" class="modal__close" data-close-modal aria-label="Закрити вікно">${icon.close}</button>
        </div>`;

    function renderModals() {
        document.body.insertAdjacentHTML('beforeend', `
        <dialog class="modal" id="registerModal" aria-labelledby="registerModalTitle">
            ${modalHead('registerModalTitle', 'Реєстрація на подію', 'registerModalEvent')}
            <div class="modal__body">
                <form class="form" id="registerForm" novalidate>
                    <div class="form-group">
                        <label for="regName">Імʼя та прізвище <span aria-hidden="true">*</span></label>
                        <input class="input" type="text" id="regName" name="name" required autocomplete="name" placeholder="Тарас Шевченко">
                        <span class="field-error" id="regNameError"></span>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="regPhone">Телефон <span aria-hidden="true">*</span></label>
                            <input class="input" type="tel" id="regPhone" name="phone" required autocomplete="tel" inputmode="tel" placeholder="+380 00 000 00 00" pattern="\\+?[0-9\\s\\(\\)\\-]{10,}">
                            <span class="field-error" id="regPhoneError"></span>
                        </div>
                        <div class="form-group">
                            <label for="regTelegram">Telegram</label>
                            <input class="input" type="text" id="regTelegram" name="telegram" placeholder="@username" autocomplete="off">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="regSource">Звідки дізналися про подію?</label>
                        <div class="select-wrapper">
                            <select class="input" id="regSource" name="source">
                                <option value="">Оберіть варіант</option>
                                <option value="Instagram">Instagram Хабу</option>
                                <option value="Telegram">Telegram-канал</option>
                                <option value="Друзі">Від друзів / знайомих</option>
                                <option value="Інше">Інше</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="regQuestion">Запитання до спікера</label>
                        <textarea class="input" id="regQuestion" name="question" rows="3" placeholder="Необовʼязково"></textarea>
                    </div>
                    <label class="checkbox">
                        <input type="checkbox" id="regConsent" required>
                        <span>Погоджуюсь з <a href="privacy.html" target="_blank">політикою конфіденційності</a> та обробкою персональних даних</span>
                    </label>
                    <span class="field-error" id="regConsentError"></span>
                    <p class="form-note">Точну адресу події надішлемо після підтвердження реєстрації.</p>
                    <button type="submit" class="btn btn--primary btn--block">Підтвердити реєстрацію</button>
                </form>

                <div class="modal-success" id="registerSuccess" hidden>
                    <p class="plate-system"><span class="plate-item">Вас зареєстровано</span></p>
                    <p>Ми звʼяжемося з вами напередодні події та надішлемо адресу.</p>
                    <div class="btn-row">
                        <a href="#" target="_blank" rel="noopener" class="btn btn--ghost" id="registerCalendarBtn">${icon.calendar}Додати в Google Календар</a>
                        <button type="button" class="btn btn--primary" data-close-modal>Готово</button>
                    </div>
                </div>
            </div>
        </dialog>

        <dialog class="modal" id="cabinetModal" aria-labelledby="cabinetModalTitle">
            ${modalHead('cabinetModalTitle', 'Особистий кабінет')}
            <div class="modal__body">
                <div id="cabinetGuest">
                    <div class="tabs" role="tablist" aria-label="Вхід або реєстрація">
                        <button type="button" class="tab is-active" role="tab" id="tabLogin" aria-selected="true" aria-controls="loginForm">Вхід</button>
                        <button type="button" class="tab" role="tab" id="tabSignup" aria-selected="false" aria-controls="signupForm" tabindex="-1">Створити акаунт</button>
                    </div>

                    <button type="button" class="btn btn--light btn--block" id="btnGoogleAuth">
                        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                        Увійти через Google
                    </button>
                    <div class="divider"><span>або через email</span></div>

                    <form class="form" id="loginForm" role="tabpanel" aria-labelledby="tabLogin" novalidate>
                        <div class="form-group">
                            <label for="loginEmail">Email <span aria-hidden="true">*</span></label>
                            <input class="input" type="email" id="loginEmail" required autocomplete="email" placeholder="user@domain.com">
                            <span class="field-error"></span>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">Пароль <span aria-hidden="true">*</span></label>
                            <input class="input" type="password" id="loginPassword" required autocomplete="current-password" minlength="8" placeholder="Мінімум 8 символів">
                            <span class="field-error"></span>
                        </div>
                        <button type="submit" class="btn btn--primary btn--block">Увійти</button>
                    </form>

                    <form class="form" id="signupForm" role="tabpanel" aria-labelledby="tabSignup" novalidate hidden>
                        <div class="form-group">
                            <label for="signupName">Імʼя та прізвище <span aria-hidden="true">*</span></label>
                            <input class="input" type="text" id="signupName" required autocomplete="name" placeholder="Олександр Коваль">
                            <span class="field-error"></span>
                        </div>
                        <div class="form-group">
                            <label for="signupEmail">Email <span aria-hidden="true">*</span></label>
                            <input class="input" type="email" id="signupEmail" required autocomplete="email" placeholder="user@domain.com">
                            <span class="field-error"></span>
                        </div>
                        <div class="form-group">
                            <label for="signupPassword">Пароль <span aria-hidden="true">*</span></label>
                            <input class="input" type="password" id="signupPassword" required autocomplete="new-password" minlength="8" placeholder="Мінімум 8 символів">
                            <span class="field-error"></span>
                        </div>
                        <button type="submit" class="btn btn--primary btn--block">Створити акаунт</button>
                    </form>
                </div>

                <div id="cabinetUser" hidden>
                    <p class="cabinet-greeting">Вітаємо, <strong id="cabinetUserName"></strong></p>
                    <h3 class="cabinet-subtitle">Збережені події</h3>
                    <div class="saved-list" id="savedEventsList"></div>
                    <button type="button" class="btn btn--ghost btn--block" id="btnLogout">Вийти з кабінету</button>
                </div>
            </div>
        </dialog>`);

        $$('dialog.modal').forEach(modal.bind);
    }

    /* ---------- FORM VALIDATION ---------- */

    const validationMessage = (input) => {
        const v = input.validity;
        if (v.valueMissing) return input.type === 'checkbox' ? 'Потрібна ваша згода' : 'Заповніть це поле';
        if (v.typeMismatch && input.type === 'email') return 'Введіть коректний email';
        if (v.patternMismatch && input.type === 'tel') return 'Введіть номер у форматі +380 00 000 00 00';
        if (v.tooShort) return `Мінімум ${input.minLength} символів`;
        return '';
    };

    const errorSlot = (input) =>
        (input.id && document.getElementById(`${input.id}Error`)) ||
        input.closest('.form-group')?.querySelector('.field-error');

    const showFieldState = (input) => {
        const msg = validationMessage(input);
        const slot = errorSlot(input);
        input.setAttribute('aria-invalid', msg ? 'true' : 'false');
        if (slot) {
            slot.textContent = msg;
            if (!slot.id) slot.id = `${input.id}Error`;
            input.setAttribute('aria-describedby', slot.id);
        }
        return !msg;
    };

    const validateForm = (form) => {
        const fields = $$('input, select, textarea', form).filter((el) => el.willValidate);
        const results = fields.map(showFieldState);
        const firstInvalid = fields[results.indexOf(false)];
        firstInvalid?.focus();
        return !firstInvalid;
    };

    const liveValidate = (form) => {
        form.addEventListener('input', (e) => {
            if (e.target.getAttribute('aria-invalid') === 'true') showFieldState(e.target);
        });
        form.addEventListener('change', (e) => {
            if (e.target.getAttribute('aria-invalid') === 'true') showFieldState(e.target);
        });
    };

    const clearFormState = (form) => {
        form.reset();
        $$('[aria-invalid]', form).forEach((el) => el.removeAttribute('aria-invalid'));
        $$('.field-error', form).forEach((el) => { el.textContent = ''; });
    };

    /* ---------- REGISTRATION ---------- */

    const googleCalendarUrl = (ev) => {
        const toGcal = (iso) => iso.replace(/[-:]/g, '').slice(0, 13) + '00';
        const dates = `${toGcal(ev.start)}/${toGcal(ev.end || ev.start)}`;
        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: ev.title,
            dates,
            details: `${ev.description.join('\n\n')}\n\n${location.origin}${location.pathname.replace(/[^/]*$/, '')}${eventUrl(ev)}`,
            location: `Хартія-Хаб, ${ev.city}`,
            ctz: 'Europe/Kyiv'
        });
        return `https://calendar.google.com/calendar/render?${params}`;
    };

    let registerEvent = null;

    function openRegistration(eventId) {
        const ev = D.events.find((e) => e.id === eventId);
        const dialog = $('#registerModal');
        if (!ev || !dialog) return;
        registerEvent = ev;

        const form = $('#registerForm');
        clearFormState(form);
        form.hidden = false;
        $('#registerSuccess').hidden = true;
        $('#registerModalEvent').textContent = `${ev.title} · ${ev.city}, ${formatEventDate(ev)}`;

        modal.open(dialog);
        $('#regName').focus();
    }

    function initRegistration() {
        const form = $('#registerForm');
        if (!form) return;
        liveValidate(form);
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!validateForm(form)) return;
            // TODO: відправка заявки в CRM, коли буде бекенд
            form.hidden = true;
            const success = $('#registerSuccess');
            success.hidden = false;
            $('#registerCalendarBtn').href = googleCalendarUrl(registerEvent);
            $('[data-close-modal].btn', success).focus();
        });
    }

    /* ---------- CABINET ---------- */

    function initCabinet() {
        const dialog = $('#cabinetModal');
        if (!dialog) return;

        const tabs = { login: $('#tabLogin'), signup: $('#tabSignup') };
        const forms = { login: $('#loginForm'), signup: $('#signupForm') };

        const selectTab = (key, focus = false) => {
            Object.entries(tabs).forEach(([k, tab]) => {
                const active = k === key;
                tab.classList.toggle('is-active', active);
                tab.setAttribute('aria-selected', String(active));
                tab.tabIndex = active ? 0 : -1;
                forms[k].hidden = !active;
            });
            if (focus) tabs[key].focus();
        };

        tabs.login.addEventListener('click', () => selectTab('login'));
        tabs.signup.addEventListener('click', () => selectTab('signup'));
        $('.tabs', dialog).addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                selectTab(tabs.login.classList.contains('is-active') ? 'signup' : 'login', true);
            }
        });

        const render = () => {
            const user = readJSON(STORAGE_USER, null);
            $('#cabinetGuest').hidden = !!user;
            $('#cabinetUser').hidden = !user;
            if (user) {
                $('#cabinetUserName').textContent = user.name;
                renderSavedList();
            }
        };

        const login = (name) => {
            localStorage.setItem(STORAGE_USER, JSON.stringify({ name }));
            Object.values(forms).forEach(clearFormState);
            render();
            toast('Ви увійшли в кабінет');
        };

        Object.values(forms).forEach(liveValidate);
        forms.login.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateForm(forms.login)) login($('#loginEmail').value.trim());
        });
        forms.signup.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateForm(forms.signup)) login($('#signupName').value.trim());
        });
        $('#btnGoogleAuth').addEventListener('click', () => login('користувач Google'));
        $('#btnLogout').addEventListener('click', () => {
            localStorage.removeItem(STORAGE_USER);
            selectTab('login');
            render();
            tabs.login.focus();
        });

        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-open-cabinet]')) {
                render();
                modal.open(dialog);
            }
        });
    }

    function renderSavedList() {
        const list = $('#savedEventsList');
        if (!list) return;
        const saved = D.events.filter((ev) => isSaved(ev.id));
        list.innerHTML = saved.length
            ? saved.map((ev) => `
                <a class="saved-item" href="${eventUrl(ev)}">
                    <span class="badge">${esc(ev.city)}</span>
                    <span class="saved-item__title">${esc(ev.title)}</span>
                    <span class="saved-item__date">${esc(formatEventDate(ev))}</span>
                </a>`).join('')
            : '<p class="empty-note">Ви ще не зберегли жодної події. Натисніть ♡ на картці події, щоб додати її сюди.</p>';
    }

    /* ---------- EVENT CARDS ---------- */

    const posterVariant = {
        'Лекція': 'accent', 'Тренінг': 'green', 'Психологія': 'gray', 'Кіно': 'black',
        'Дискусія': 'green', 'Зустріч': 'accent', 'Культура': 'gray'
    };

    const posterHtml = (ev, orientation, alt = '') => {
        const src = ev.poster?.[orientation];
        if (src) {
            const [w, h] = orientation === 'v' ? [960, 1200] : [1200, 640];
            return `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" width="${w}" height="${h}">`;
        }
        return `
            <div class="poster-ph poster-ph--${posterVariant[ev.category] || 'black'} poster-ph--${orientation}"${alt ? ` role="img" aria-label="${esc(alt)}"` : ''}>
                <span class="poster-ph__tag">Хартія-Хаб · ${esc(ev.city)}</span>
                <span class="poster-ph__title">${esc(ev.category)}</span>
            </div>`;
    };

    const heartButton = (ev) => {
        const saved = isSaved(ev.id);
        return `<button type="button" class="btn-heart${saved ? ' active' : ''}" data-save-event="${esc(ev.id)}"
                    aria-pressed="${saved}" aria-label="${saved ? 'Прибрати зі збережених' : 'Зберегти подію'}">${icon.heart}</button>`;
    };

    const eventCard = (ev) => `
        <article class="event-card">
            <a href="${eventUrl(ev)}" class="event-card__media" tabindex="-1" aria-hidden="true">
                ${posterHtml(ev, 'h')}
            </a>
            ${heartButton(ev)}
            <div class="event-card__body">
                <div class="card-meta">
                    <span class="badge">${esc(ev.city)}</span>
                    <time class="card-datetime" datetime="${esc(ev.start)}">${esc(formatEventDate(ev))}</time>
                </div>
                <h3 class="event-card__title"><a href="${eventUrl(ev)}">${esc(ev.title)}</a></h3>
                <p class="event-card__terms">${esc(ev.terms)}</p>
                <div class="event-card__actions">
                    <button type="button" class="btn btn--primary" data-register="${esc(ev.id)}" aria-haspopup="dialog">Зареєструватися</button>
                    <a href="${eventUrl(ev)}" class="btn btn--ghost">Детальніше</a>
                </div>
            </div>
        </article>`;

    function initGlobalEventActions() {
        document.addEventListener('click', (e) => {
            const reg = e.target.closest('[data-register]');
            if (reg) { openRegistration(reg.dataset.register); return; }

            const heart = e.target.closest('[data-save-event]');
            if (heart) {
                const saved = toggleSaved(heart.dataset.saveEvent);
                $$(`[data-save-event="${CSS.escape(heart.dataset.saveEvent)}"]`).forEach((btn) => {
                    btn.classList.toggle('active', saved);
                    btn.setAttribute('aria-pressed', String(saved));
                    btn.setAttribute('aria-label', saved ? 'Прибрати зі збережених' : 'Зберегти подію');
                    const text = btn.querySelector('[data-save-label]');
                    if (text) text.textContent = saved ? 'Збережено' : 'Зберегти';
                });
                toast(saved ? 'Подію збережено в кабінеті' : 'Подію прибрано зі збережених');
            }
        });
    }

    /* ---------- EVENT FILTERS ---------- */

    function initEventFilters({ limit, pageSize, syncUrl }) {
        const grid = $('#eventsGrid');
        if (!grid) return null;

        const city = $('#filterCity');
        const cat = $('#filterCategory');
        const search = $('#filterSearch');
        const reset = $('#filterReset');
        const counter = $('#eventsCount');
        const allBtn = $('#allEventsBtn');
        const moreBtn = $('#loadMoreBtn');

        city.innerHTML = `<option value="all">Усі міста</option>${D.cities.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}`;
        cat.innerHTML = `<option value="all">Усі категорії</option>${D.categories.map((c) => `<option value="${esc(c.value)}">${esc(c.label)}</option>`).join('')}`;

        if (syncUrl) {
            const q = new URLSearchParams(location.search);
            if (q.get('city') && D.cities.includes(q.get('city'))) city.value = q.get('city');
            if (q.get('category') && D.categories.some((c) => c.value === q.get('category'))) cat.value = q.get('category');
            if (q.get('q')) search.value = q.get('q');
        }

        let visible = pageSize || limit;

        const filtered = () => {
            const query = search.value.trim().toLowerCase();
            return upcomingEvents().filter((ev) =>
                (city.value === 'all' || ev.city === city.value) &&
                (cat.value === 'all' || ev.category === cat.value) &&
                (!query || `${ev.title} ${ev.description.join(' ')} ${ev.city}`.toLowerCase().includes(query))
            );
        };

        const filterParams = () => {
            const p = new URLSearchParams();
            if (city.value !== 'all') p.set('city', city.value);
            if (cat.value !== 'all') p.set('category', cat.value);
            if (search.value.trim()) p.set('q', search.value.trim());
            return p;
        };

        const render = () => {
            const list = filtered();
            const shown = list.slice(0, visible);
            const hasFilters = city.value !== 'all' || cat.value !== 'all' || search.value.trim();

            grid.innerHTML = shown.length
                ? shown.map(eventCard).join('')
                : `<div class="empty-state">
                        <p>За вашим запитом подій не знайдено.</p>
                        ${hasFilters ? '<button type="button" class="btn btn--ghost" data-filter-reset>Скинути фільтри</button>' : ''}
                   </div>`;

            reset.hidden = !hasFilters;
            if (counter) counter.textContent = list.length ? `Знайдено подій: ${list.length}` : '';

            if (allBtn) {
                const p = filterParams().toString();
                allBtn.href = `events.html${p ? `?${p}` : ''}`;
                allBtn.querySelector('[data-count]').textContent = `(${list.length})`;
            }
            if (moreBtn) moreBtn.hidden = list.length <= visible;
            if (syncUrl) {
                const p = filterParams().toString();
                history.replaceState(null, '', `${location.pathname}${p ? `?${p}` : ''}`);
            }
        };

        const onChange = () => { visible = pageSize || limit; render(); };
        let searchTimer;
        city.addEventListener('change', onChange);
        cat.addEventListener('change', onChange);
        search.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(onChange, 150); });
        $('#filterForm')?.addEventListener('submit', (e) => e.preventDefault());

        const resetAll = () => {
            city.value = 'all'; cat.value = 'all'; search.value = '';
            onChange();
            search.focus();
        };
        reset.addEventListener('click', resetAll);
        grid.addEventListener('click', (e) => { if (e.target.closest('[data-filter-reset]')) resetAll(); });

        moreBtn?.addEventListener('click', () => {
            const firstNew = visible;
            visible += pageSize;
            render();
            grid.children[firstNew]?.querySelector('.event-card__title a')?.focus();
        });

        render();

        return {
            setCategory(value) { cat.value = value; city.value = 'all'; search.value = ''; onChange(); }
        };
    }

    /* ---------- PAGES ---------- */

    function initHome() {
        const filters = initEventFilters({ limit: HOME_EVENTS_LIMIT, syncUrl: false });

        $$('[data-filter-cat]').forEach((link) => link.addEventListener('click', () => {
            filters?.setCategory(link.dataset.filterCat);
        }));

        const lectureCount = upcomingEvents().filter((ev) => ev.category === 'Лекція').length;
        $$('[data-lecture-count]').forEach((el) => { el.textContent = lectureCount ? ` (${lectureCount})` : ''; });

        renderProjects();
        renderMaterialsPreview();
        renderPartners();
        renderReports();
        renderContacts();
        initHeroVideo();
    }

    function renderProjects() {
        const grid = $('#projectsGrid');
        if (!grid) return;
        grid.innerHTML = D.projects.map((p, i) => `
            <article class="project-card">
                <span class="project-card__num">${String(i + 1).padStart(2, '0')}</span>
                <h3 class="project-card__title">${esc(p.title)}</h3>
                <p class="project-card__text">${p.description ? esc(p.description) : 'Опис проєкту зʼявиться найближчим часом.'}</p>
                ${p.note ? `<span class="badge badge--outline">${esc(p.note)}</span>` : ''}
            </article>`).join('');
    }

    const materialCard = (m) => `
        <article class="material-card">
            <a href="${materialUrl(m)}" class="material-card__media" tabindex="-1" aria-hidden="true">
                <img src="${esc(m.cover)}" alt="" loading="lazy">
            </a>
            <div class="material-card__body">
                <div class="card-meta">
                    <span class="badge">${esc(materialTypeLabel(m.type))}</span>
                    <time class="card-datetime" datetime="${esc(m.date)}">${esc(fmtFull.format(new Date(m.date)))}</time>
                </div>
                <h3 class="material-card__title"><a href="${materialUrl(m)}">${esc(m.title)}</a></h3>
                <p class="material-card__lead">${esc(m.lead)}</p>
            </div>
        </article>`;

    const sortedMaterials = () => [...D.materials].sort((a, b) => new Date(b.date) - new Date(a.date));

    function renderMaterialsPreview() {
        const grid = $('#materialsPreview');
        if (!grid) return;
        const list = sortedMaterials().slice(0, 3);
        grid.innerHTML = list.length ? list.map(materialCard).join('') : '<div class="empty-state"><p>Матеріали зʼявляться найближчим часом.</p></div>';
    }

    function renderPartners() {
        const grid = $('#partnersGrid');
        if (!grid) return;
        grid.innerHTML = D.partners.length
            ? D.partners.map((p) => `
                <a class="partner-logo" href="${esc(p.url || '#')}" target="_blank" rel="noopener" title="${esc(p.name)}">
                    <img src="${esc(p.logo)}" alt="${esc(p.name)}" loading="lazy">
                </a>`).join('')
            : `<div class="empty-state empty-state--wide">
                    <p>Логотипи донорів та організацій-партнерів зʼявляться тут найближчим часом.</p>
               </div>`;
    }

    function renderReports() {
        const list = $('#reportsList');
        if (!list) return;
        list.innerHTML = D.reports.length
            ? D.reports.map((r) => `
                <a class="report-row" href="${esc(r.file)}" target="_blank" rel="noopener">
                    <span class="report-row__year">${esc(r.year)}</span>
                    <span class="report-row__title">${esc(r.title)}</span>
                    <span class="report-row__action">Завантажити ${icon.arrow}</span>
                </a>`).join('')
            : `<div class="empty-state empty-state--wide">
                    <p>Річні звіти про діяльність та використання донатів буде опубліковано в цьому розділі.</p>
               </div>`;
    }

    function renderContacts() {
        const grid = $('#contactsGrid');
        if (!grid) return;
        const instagram = D.links.socials.find((s) => s.name === 'Instagram')?.url;
        grid.innerHTML = D.contacts.map((c) => `
            <article class="contact-card">
                <h3 class="contact-card__city">${esc(c.city)}</h3>
                <p class="contact-card__role">${esc(c.role)}</p>
                ${c.phone
                    ? `<a class="btn btn--primary btn--block" href="tel:${esc(c.phone.replace(/[^+\d]/g, ''))}">${icon.phone}${esc(c.phone)}</a>`
                    : `<p class="contact-card__pending">Робочий номер зʼявиться найближчим часом</p>
                       <a class="btn btn--ghost btn--block" href="${esc(instagram)}" target="_blank" rel="noopener">Написати в Instagram</a>`}
            </article>`).join('');
    }

    function initHeroVideo() {
        const video = $('.bg-video');
        if (!video) return;
        const start = parseFloat(video.dataset.start) || 0;
        const end = parseFloat(video.dataset.end) || 0;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

        if (start || end) {
            video.addEventListener('loadedmetadata', () => { video.currentTime = start; }, { once: true });
            video.addEventListener('timeupdate', () => {
                if (end && video.currentTime >= end) video.currentTime = start;
            });
        }
        const applyMotionPref = () => (reduced.matches ? video.pause() : video.play().catch(() => {}));
        reduced.addEventListener('change', applyMotionPref);
        if (reduced.matches) video.pause();
    }

    function initEventsPage() {
        initEventFilters({ pageSize: EVENTS_PAGE_SIZE, syncUrl: true });
    }

    function notFound(mount, title, backHref, backLabel) {
        document.title = `${title} — Хартія-Хаб`;
        mount.innerHTML = `
            <div class="empty-state empty-state--page">
                <h1 class="section-title">${title}</h1>
                <p>Можливо, сторінку було видалено або посилання застаріло.</p>
                <a href="${backHref}" class="btn btn--primary">${backLabel}</a>
            </div>`;
    }

    function initEventPage() {
        const mount = $('#eventPage');
        const id = new URLSearchParams(location.search).get('id');
        const ev = D.events.find((e) => e.id === id);
        if (!ev) { notFound(mount, 'Подію не знайдено', 'events.html', 'До всіх подій'); return; }

        const isPast = new Date(ev.end || ev.start).getTime() < Date.now();
        document.title = `${ev.title} — Хартія-Хаб`;
        $('meta[name="description"]')?.setAttribute('content', ev.description[0]);

        const saved = isSaved(ev.id);
        mount.innerHTML = `
            <nav class="breadcrumbs" aria-label="Навігаційний ланцюжок">
                <a href="index.html">Головна</a><span aria-hidden="true">/</span>
                <a href="events.html">Події</a><span aria-hidden="true">/</span>
                <span aria-current="page">${esc(ev.title)}</span>
            </nav>

            <div class="detail-layout">
                <div class="detail-poster">
                    <div class="poster-4-5">
                        ${squares()}
                        ${posterHtml(ev, 'v', `Афіша: ${ev.title}`)}
                    </div>
                </div>

                <div class="detail-content">
                    <div class="card-meta card-meta--start">
                        <span class="badge">${esc(ev.city)}</span>
                        <span class="badge badge--outline">${esc(categoryLabel(ev.category))}</span>
                    </div>
                    <h1 class="detail-title">${esc(ev.title)}</h1>

                    <dl class="detail-facts">
                        <div><dt>Дата</dt><dd>${esc(fmtFull.format(new Date(ev.start)))}, ${esc(fmtWeekday.format(new Date(ev.start)))}</dd></div>
                        <div><dt>Час</dt><dd>${esc(formatEventTimeRange(ev))}</dd></div>
                        <div><dt>Місто</dt><dd>${esc(ev.city)}</dd></div>
                        <div><dt>Формат</dt><dd>${esc(ev.format)}</dd></div>
                        <div><dt>Участь</dt><dd>${esc(ev.terms)}</dd></div>
                        ${ev.speaker ? `<div><dt>Спікер</dt><dd>${esc(ev.speaker)}</dd></div>` : ''}
                    </dl>

                    <div class="btn-row">
                        ${isPast
                            ? '<span class="badge badge--outline">Подія вже відбулася</span>'
                            : `<button type="button" class="btn btn--primary" data-register="${esc(ev.id)}" aria-haspopup="dialog">Зареєструватися</button>`}
                        ${ev.isDonation ? `<a href="${esc(D.links.donate)}" target="_blank" rel="noopener" class="btn btn--ghost">Донат на банку</a>` : ''}
                    </div>
                    <div class="btn-row btn-row--secondary">
                        <a href="${esc(googleCalendarUrl(ev))}" target="_blank" rel="noopener" class="btn-link">${icon.calendar}Додати в календар</a>
                        <button type="button" class="btn-link" data-save-event="${esc(ev.id)}" aria-pressed="${saved}">${icon.heart}<span data-save-label>${saved ? 'Збережено' : 'Зберегти'}</span></button>
                        <button type="button" class="btn-link" id="copyLinkBtn">${icon.share}Скопіювати посилання</button>
                    </div>

                    <section class="detail-section">
                        <h2 class="detail-section__title">Опис</h2>
                        ${ev.description.map((p) => `<p>${esc(p)}</p>`).join('')}
                    </section>

                    ${ev.program?.length ? `
                    <section class="detail-section">
                        <h2 class="detail-section__title">Програма</h2>
                        <ul class="detail-list">${ev.program.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
                    </section>` : ''}

                    <section class="detail-section">
                        <h2 class="detail-section__title">Додаткова інформація</h2>
                        <p>Участь — за попередньою реєстрацією. Точну адресу місця проведення надішлемо після підтвердження реєстрації.</p>
                    </section>
                </div>
            </div>`;

        $('#copyLinkBtn').addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(location.href);
                toast('Посилання скопійовано');
            } catch {
                toast('Не вдалося скопіювати посилання');
            }
        });

        const related = upcomingEvents().filter((e) => e.id !== ev.id);
        const sameCity = related.filter((e) => e.city === ev.city);
        const picks = [...sameCity, ...related.filter((e) => e.city !== ev.city)].slice(0, 3);
        const relatedGrid = $('#relatedEvents');
        if (relatedGrid) {
            relatedGrid.innerHTML = picks.map(eventCard).join('');
            $('#relatedSection').hidden = !picks.length;
        }
    }

    function initMaterialsPage() {
        const grid = $('#materialsGrid');
        const chips = $('#materialFilters');
        if (!grid) return;

        const types = [{ value: 'all', label: 'Усі' }, ...D.materialTypes];
        let current = new URLSearchParams(location.search).get('type') || 'all';
        if (!types.some((t) => t.value === current)) current = 'all';

        const render = () => {
            chips.innerHTML = types.map((t) => `
                <button type="button" class="chip${t.value === current ? ' is-active' : ''}" data-type="${t.value}" aria-pressed="${t.value === current}">${esc(t.label)}</button>
            `).join('');
            const list = sortedMaterials().filter((m) => current === 'all' || m.type === current);
            grid.innerHTML = list.length
                ? list.map(materialCard).join('')
                : '<div class="empty-state"><p>У цій категорії поки немає матеріалів.</p></div>';
        };

        chips.addEventListener('click', (e) => {
            const chip = e.target.closest('[data-type]');
            if (!chip) return;
            current = chip.dataset.type;
            const p = current === 'all' ? '' : `?type=${current}`;
            history.replaceState(null, '', `${location.pathname}${p}`);
            render();
            $(`[data-type="${current}"]`, chips)?.focus();
        });

        render();
    }

    function initMaterialPage() {
        const mount = $('#materialPage');
        const id = new URLSearchParams(location.search).get('id');
        const m = D.materials.find((x) => x.id === id);
        if (!m) { notFound(mount, 'Матеріал не знайдено', 'materials.html', 'До всіх матеріалів'); return; }

        document.title = `${m.title} — Хартія-Хаб`;
        $('meta[name="description"]')?.setAttribute('content', m.lead);

        mount.innerHTML = `
            <nav class="breadcrumbs" aria-label="Навігаційний ланцюжок">
                <a href="index.html">Головна</a><span aria-hidden="true">/</span>
                <a href="materials.html">Матеріали</a><span aria-hidden="true">/</span>
                <span aria-current="page">${esc(m.title)}</span>
            </nav>

            <article class="article">
                <header class="article__head">
                    <div class="card-meta card-meta--start">
                        <span class="badge">${esc(materialTypeLabel(m.type))}</span>
                        <time class="card-datetime" datetime="${esc(m.date)}">${esc(fmtFull.format(new Date(m.date)))}</time>
                    </div>
                    <h1 class="detail-title">${esc(m.title)}</h1>
                    <p class="article__lead">${esc(m.lead)}</p>
                </header>

                <div class="article__body">
                    ${m.body.map((p) => `<p>${esc(p)}</p>`).join('')}
                    ${m.links?.length ? `<p class="article__links">${m.links.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('')}</p>` : ''}
                </div>

                ${m.gallery?.length ? `
                <section class="article__gallery" aria-labelledby="galleryTitle">
                    <h2 class="detail-section__title" id="galleryTitle">Фотогалерея</h2>
                    <div class="gallery-grid">
                        ${m.gallery.map((src, i) => `
                            <button type="button" class="gallery-item" data-gallery-index="${i}" aria-label="Відкрити фото ${i + 1} з ${m.gallery.length}">
                                <img src="${esc(src)}" alt="" loading="lazy">
                            </button>`).join('')}
                    </div>
                </section>` : ''}
            </article>`;

        if (m.gallery?.length) initLightbox(m.gallery, m.title);
    }

    function initLightbox(images, title) {
        document.body.insertAdjacentHTML('beforeend', `
            <dialog class="modal modal--lightbox" id="lightbox" aria-label="Фотогалерея: ${esc(title)}">
                <div class="lightbox__bar">
                    <span class="lightbox__counter" id="lightboxCounter" aria-live="polite"></span>
                    <button type="button" class="modal__close" data-close-modal aria-label="Закрити галерею">${icon.close}</button>
                </div>
                <div class="lightbox__stage">
                    <button type="button" class="lightbox__nav lightbox__nav--prev" aria-label="Попереднє фото">${icon.chevronLeft}</button>
                    <img id="lightboxImg" alt="">
                    <button type="button" class="lightbox__nav lightbox__nav--next" aria-label="Наступне фото">${icon.chevronRight}</button>
                </div>
            </dialog>`);

        const dialog = $('#lightbox');
        modal.bind(dialog);
        const img = $('#lightboxImg');
        let index = 0;

        const show = (i) => {
            index = (i + images.length) % images.length;
            img.src = images[index];
            img.alt = `${title} — фото ${index + 1}`;
            $('#lightboxCounter').textContent = `${index + 1} / ${images.length}`;
        };

        $('.lightbox__nav--prev', dialog).addEventListener('click', () => show(index - 1));
        $('.lightbox__nav--next', dialog).addEventListener('click', () => show(index + 1));
        $('.lightbox__stage', dialog).addEventListener('click', (e) => { if (e.target === e.currentTarget) modal.close(dialog); });
        dialog.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') show(index - 1);
            if (e.key === 'ArrowRight') show(index + 1);
        });

        let touchX = null;
        img.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
        img.addEventListener('touchend', (e) => {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
            touchX = null;
        });

        document.addEventListener('click', (e) => {
            const item = e.target.closest('[data-gallery-index]');
            if (!item) return;
            show(Number(item.dataset.galleryIndex));
            modal.open(dialog);
        });
    }

    /* ---------- BACKGROUND CANVAS ---------- */

    function initCanvas() {
        const canvas = $('#touchCanvas');
        if (!canvas) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { canvas.remove(); return; }
        const ctx = canvas.getContext('2d');
        let width, height;
        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const count = window.innerWidth < 760 ? 16 : 32;
        const rnd = (a, b) => a + Math.random() * (b - a);
        const coords = () => [(48 + Math.random() * 3.5).toFixed(4), (30 + Math.random() * 6.5).toFixed(4)];
        const nodes = Array.from({ length: count }, () => {
            const [lat, lng] = coords();
            return {
                x: rnd(0, width), y: rnd(0, height), size: rnd(6, 14),
                vx: rnd(-0.3, 0.3), vy: rnd(-0.3, 0.3),
                opacity: rnd(0.2, 0.8), fade: rnd(0.003, 0.011), fadeIn: Math.random() > 0.5, lat, lng
            };
        });

        let raf;
        const frame = () => {
            ctx.clearRect(0, 0, width, height);
            for (let a = 0; a < nodes.length; a++) {
                for (let b = a + 1; b < nodes.length; b++) {
                    const dist = Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y);
                    if (dist < 140) {
                        ctx.strokeStyle = `rgba(181, 213, 83, ${(1 - dist / 140) * Math.min(nodes[a].opacity, nodes[b].opacity) * 0.35})`;
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(nodes[a].x + nodes[a].size / 2, nodes[a].y + nodes[a].size / 2);
                        ctx.lineTo(nodes[b].x + nodes[b].size / 2, nodes[b].y + nodes[b].size / 2);
                        ctx.stroke();
                    }
                }
            }
            nodes.forEach((n) => {
                n.x = (n.x + n.vx + width) % width;
                n.y = (n.y + n.vy + height) % height;
                if (n.fadeIn) { n.opacity += n.fade; if (n.opacity >= 0.7) n.fadeIn = false; }
                else {
                    n.opacity -= n.fade;
                    if (n.opacity <= 0.05) { n.fadeIn = true; [n.lat, n.lng] = coords(); }
                }
                ctx.strokeStyle = `rgba(181, 213, 83, ${n.opacity})`;
                ctx.lineWidth = 1.2;
                ctx.strokeRect(n.x, n.y, n.size, n.size);
                ctx.fillStyle = `rgba(181, 213, 83, ${n.opacity * 0.8})`;
                ctx.font = '9px "Inter Tight", sans-serif';
                ctx.fillText(`${n.lat}°N ${n.lng}°E`, n.x + n.size + 6, n.y + 7);
            });
            raf = requestAnimationFrame(frame);
        };
        frame();
        document.addEventListener('visibilitychange', () => {
            cancelAnimationFrame(raf);
            if (!document.hidden) frame();
        });
    }

    /* ---------- BOOT ---------- */

    renderHeader();
    renderFooter();
    renderModals();
    initMobileNav();
    initHeaderScrollState();
    initRegistration();
    initCabinet();
    initGlobalEventActions();
    initCanvas();

    ({
        home: initHome,
        events: initEventsPage,
        event: initEventPage,
        materials: initMaterialsPage,
        material: initMaterialPage
    })[page]?.();
})();
