/**
 * Interact Nepal Web Portal - Public View Engine
 * Dynamically loads configuration (branding, members, leaders, resources, projects)
 * and manages routing tabs, searching, sorting, detail modals, and themes.
 */
import { db, auth } from "./firebase.js?v=2";

console.log("APP JS STARTED", db, auth);

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // State storage
    let siteConfig = null;
    let activeFilter = 'all';
    let searchQuery = '';

    // DOM Elements
    const teamGrid = document.getElementById('team-grid');
    const searchInput = document.getElementById('search-input');
    const filterPills = document.getElementById('filter-pills');
    const profileModal = document.getElementById('profile-modal');
    const modalContent = document.getElementById('modal-content');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const mobileNav = document.getElementById('mobileNav');
    const themeCheckbox = document.getElementById('checkbox');

    // Tab Links & Sections
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.tab-section');

    // Init Theme
    initTheme();

    // Load Configuration Data
    loadConfiguration();

    // Register Tab Navigation click events
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = link.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    /**
     * Toggles visibility of sections based on navigation tab selection
     */
    function switchTab(tabName) {
    // Toggle active link states
    navLinks.forEach(link => {
        if (link.getAttribute('data-tab') === tabName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Toggle active section states
    sections.forEach(sec => {
        if (sec.id === `tab-${tabName}`) {
            sec.classList.add('active');
        } else {
            sec.classList.remove('active');
        }
    });

    // Close mobile drawer
    if (mobileNav) mobileNav.style.display = 'none';

    // Update URL hash
    window.location.hash = tabName;
    updatePageTitle(tabName);
}

    /**
     * Updates page title based on the active section tab name
     */
    function updatePageTitle(tabName) {
        if (!siteConfig) return;
        const brandName = siteConfig.branding.siteName || 'Interact District 3292';
        let tabTitle = "Home";
        if (tabName === 'team') tabTitle = "Team Members";
        else if (tabName === 'past-bods') tabTitle = "Past BOD's";
        else if (tabName === 'resources') tabTitle = "Resources";
        else if (tabName === 'projects') tabTitle = "Projects";
        else if (tabName === 'about') tabTitle = "About Us";

        document.title = `${tabTitle} | ${brandName}`;
    }

    /**
     * Initializes tab view on reload based on browser URL hash value
     */
    function initHashTab() {
        const hash = window.location.hash.substring(1); // Strip '#' symbol
        const validTabs = ['home', 'team', 'past-bods', 'resources', 'projects', 'about'];
        if (hash && validTabs.includes(hash)) {
            switchTab(hash);
        } else {
            switchTab('home');
        }
    }

    /**
     * Tries to load config from LocalStorage, falls back to default-config.json
     */
    async function loadConfiguration() {
    try {
        const docRef = doc(db, "config", "portal");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            siteConfig = docSnap.data();
        } else {
            await fetchDefaultConfig();
        }

        applyBranding(siteConfig.branding);
        renderTeam(siteConfig.members);
        renderPastBods(siteConfig.leaders);
        renderResources(siteConfig.resources);
        renderProjects(siteConfig.projects);
        initHashTab();

    } catch (error) {
        console.error("Error loading configuration:", error);
        await fetchDefaultConfig();
    }
}



    

    /**
     * Fetches the static seed file and commits it to LocalStorage
     */
    async function loadConfiguration() {
    try {
        const docRef = doc(db, "config", "portal");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            siteConfig = docSnap.data();
        } else {
            await fetchDefaultConfig();
        }

        applyBranding(siteConfig.branding);
        renderTeam(siteConfig.members);
        renderPastBods(siteConfig.leaders);
        renderResources(siteConfig.resources);
        renderProjects(siteConfig.projects);
        initHashTab();

    } catch (error) {
        console.error("Error loading configuration:", error);
        await fetchDefaultConfig();
    }
}
async function fetchDefaultConfig() {
    const response = await fetch("default-config.json");
    siteConfig = await response.json();

    applyBranding(siteConfig.branding);
    renderTeam(siteConfig.members);
    renderPastBods(siteConfig.leaders);
    renderResources(siteConfig.resources);
    renderProjects(siteConfig.projects);
    initHashTab();
}

    /**
     * Applies primary/accent/gold colors and updates logo URLs across page components
     */
    function applyBranding(branding) {
        if (!branding) return;

        // Apply theme color variables dynamically on root element
        document.documentElement.style.setProperty('--primary-blue', branding.primaryColor || '#0C2340');
        document.documentElement.style.setProperty('--interact-blue', branding.accentColor || '#00A3E0');
        document.documentElement.style.setProperty('--accent-gold', branding.goldColor || '#F39C12');

        // Header logos
        const navLogo = document.getElementById('nav-logo');
        const navThemeLogo = document.getElementById('nav-theme-logo');
        if (navLogo && branding.logoUrl) navLogo.src = branding.logoUrl;
        if (navThemeLogo && branding.themeLogoUrl) navThemeLogo.src = branding.themeLogoUrl;

        // Footer branding
        const footerLogo = document.getElementById('footer-logo');
        const footerHeading = document.getElementById('footer-text-heading');
        const footerDesc = document.getElementById('footer-text-desc');
        const footerSiteName = document.getElementById('footer-site-name');

        if (footerLogo && branding.themeLogoUrl) footerLogo.src = branding.themeLogoUrl;
        if (footerHeading && branding.footerText) footerHeading.textContent = branding.footerText;
        if (footerDesc && branding.footerDesc) footerDesc.textContent = branding.footerDesc;
        if (footerSiteName && branding.siteName) footerSiteName.textContent = branding.siteName;

        // About Page Theme Logo
        const aboutThemeImg = document.getElementById('about-theme-img');
        if (aboutThemeImg && branding.themeLogoUrl) aboutThemeImg.src = branding.themeLogoUrl;
//Hero
        const heroTitle = document.getElementById("hero-title");
const heroSubtitle = document.getElementById("hero-subtitle");

if (heroTitle) {
    heroTitle.textContent = branding.heroTitle || branding.siteName;
}

if (heroSubtitle) {
    heroSubtitle.textContent =
        branding.heroSubtitle ||
        "Connecting Young Leaders for Change and Service Above Self";
}
    }

    /**
     * Renders team cards with filters and search queries applied
     */
    function renderTeam(members) {
        if (!members || !Array.isArray(members) || !teamGrid) return;

        // Filter algorithm
        const filteredMembers = members.filter(member => {
            const matchesZone = activeFilter === 'all' || member.zone === activeFilter;
            
            const normalizedSearch = searchQuery.toLowerCase().trim();
            const matchesSearch = normalizedSearch === '' || 
                (member.name && member.name.toLowerCase().includes(normalizedSearch)) ||
                (member.post && member.post.toLowerCase().includes(normalizedSearch)) ||
                (member.club && member.club.toLowerCase().includes(normalizedSearch)) ||
                (member.zone && member.zone.toLowerCase().includes(normalizedSearch));

            return matchesZone && matchesSearch;
        });

        // Clear grid
        teamGrid.innerHTML = '';

        if (filteredMembers.length === 0) {
            teamGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-user-slash"></i>
                    <h3>No Members Found</h3>
                    <p>No members match your search phrase or selected zone filter.</p>
                </div>
            `;
            return;
        }

        // Render card elements
        filteredMembers.forEach(member => {
            const card = document.createElement('div');
            card.className = 'card';
            card.setAttribute('data-id', member.id);

            // Fallback image source on load error
            const memberImage = member.image || 'https://interactnepal.org/images/default-user.png';

            card.innerHTML = `
                <div class="image-container">
                    <span class="zone-badge">${member.zone}</span>
                    <img src="${memberImage}" 
                         alt="${member.name}" 
                         loading="lazy" 
                         decoding="async" 
                         onerror="this.onerror=null; this.src='https://interactnepal.org/images/default-user.png';">
                </div>
                <div class="card-content">
                    <h3>${member.name}</h3>
                    <p class="card-post">${member.post}</p>
                    <p class="card-club">${member.club}</p>
                    
                    <div class="social-icons" onclick="event.stopPropagation();">
                        ${member.facebook ? `<a href="${member.facebook}" target="_blank" class="icon-fb" title="Facebook"><i class="fab fa-facebook-f"></i></a>` : ''}
                        ${member.instagram ? `<a href="${member.instagram}" target="_blank" class="icon-ig" title="Instagram"><i class="fab fa-instagram"></i></a>` : ''}
                        ${member.phone ? `<a href="tel:${member.phone}" class="icon-ph" title="Phone Call"><i class="fas fa-phone"></i></a>` : ''}
                        ${member.email ? `<a href="mailto:${member.email}" target="_blank" class="icon-em" title="Email"><i class="fa-solid fa-envelope"></i></a>` : ''}
                    </div>
                </div>
            `;

            // Card click expands profile details modal
            card.addEventListener('click', () => openMemberModal(member));

            teamGrid.appendChild(card);
        });
    }

    /**
     * Renders Past District Interact Representatives timeline cards
     */
    function renderPastBods(leaders) {
        const timeline = document.getElementById('past-bods-timeline');
        if (!timeline) return;
        timeline.innerHTML = '';

        if (!leaders || leaders.length === 0) {
            timeline.innerHTML = `
                <div class="no-results" style="grid-column: 1/-1;">
                    <i class="fas fa-history"></i>
                    <h3>No Records Found</h3>
                    <p>No past leaders listed in current configuration.</p>
                </div>
            `;
            return;
        }

        // Sort descending by Year string (e.g. 2025/26 > 2024/25)
        const sortedLeaders = [...leaders].sort((a, b) => b.year.localeCompare(a.year));

        sortedLeaders.forEach(leader => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.innerHTML = `
                <div class="timeline-year">${leader.year}</div>
                <div class="timeline-content">
                    <h3>${leader.name}</h3>
                    <div class="club"><i class="fas fa-graduation-cap"></i> ${leader.club}</div>
                    ${leader.theme ? `<div class="theme-statement">Theme: "${leader.theme}"</div>` : ''}
                </div>
            `;
            timeline.appendChild(item);
        });
    }

    /**
     * Renders downloadable document cards in the Resources grid
     */
    function renderResources(resources) {
        const container = document.getElementById('resources-container');
        if (!container) return;
        container.innerHTML = '';

        if (!resources || resources.length === 0) {
            container.innerHTML = `
                <div class="no-results" style="grid-column: 1/-1;">
                    <i class="fas fa-folder-open"></i>
                    <h3>No Resources Uploaded</h3>
                    <p>Stay tuned for manuals, guidelines, and bylaws resources.</p>
                </div>
            `;
            return;
        }

        resources.forEach(res => {
            const card = document.createElement('div');
            card.className = 'resource-card';

            // Select icon depending on type string
            let iconClass = 'fa-file-pdf';
            const typeLower = (res.type || '').toLowerCase();
            if (typeLower.includes('zip') || typeLower.includes('archive') || typeLower.includes('asset')) iconClass = 'fa-file-zipper';
            else if (typeLower.includes('xls') || typeLower.includes('sheet') || typeLower.includes('excel')) iconClass = 'fa-file-excel';
            else if (typeLower.includes('doc') || typeLower.includes('word')) iconClass = 'fa-file-word';
            else if (typeLower.includes('link') || typeLower.includes('web')) iconClass = 'fa-link';

            card.innerHTML = `
                <div class="resource-icon"><i class="fas ${iconClass}"></i></div>
                <div class="resource-info">
                    <h3>${res.title}</h3>
                    <p>${res.type}</p>
                </div>
                <a href="${res.link}" class="resource-download-btn" title="Open Resource" target="_blank"><i class="fas fa-download"></i></a>
            `;
            container.appendChild(card);
        });
    }

    /**
     * Renders project highlights in the Project catalog grid
     */
    function renderProjects(projects) {
        const container = document.getElementById('projects-container');
        if (!container) return;
        container.innerHTML = '';

        if (!projects || projects.length === 0) {
            container.innerHTML = `
                <div class="no-results" style="grid-column: 1/-1;">
                    <i class="fas fa-image"></i>
                    <h3>No Projects Documented</h3>
                    <p>Stay tuned for highlights on service projects.</p>
                </div>
            `;
            return;
        }

        projects.forEach(proj => {
            const card = document.createElement('div');
            card.className = 'project-card';

            const projImage = proj.image || 'https://interactnepal.org/images/theme.png';

            card.innerHTML = `
                <div class="project-img-container">
                    <img src="${projImage}" alt="${proj.title}" onerror="this.onerror=null; this.src='https://interactnepal.org/images/theme.png';">
                </div>
                <div class="project-content">
                    <div class="project-meta">
                        <span><i class="fas fa-graduation-cap"></i> ${proj.club}</span>
                        <span><i class="fas fa-calendar-day"></i> ${proj.date}</span>
                    </div>
                    <h3>${proj.title}</h3>
                    <p>${proj.desc}</p>
                </div>
            `;
            container.appendChild(card);
        });
    }

    /**
     * Modal profile detailed view popup builder
     */
    function openMemberModal(member) {
        const memberImage = member.image || 'https://interactnepal.org/images/default-user.png';
        
        modalContent.innerHTML = `
            <div class="modal-img-wrapper">
                <img src="${memberImage}" alt="${member.name}" onerror="this.onerror=null; this.src='https://interactnepal.org/images/default-user.png';">
            </div>
            <div class="modal-info">
                <span class="zone-pill">${member.zone}</span>
                <h2>${member.name}</h2>
                <div class="post">${member.post}</div>
                <div class="club"><i class="fas fa-graduation-cap"></i> ${member.club}</div>
                
                <div class="modal-details-list">
                    ${member.phone ? `
                        <a href="tel:${member.phone}" class="modal-detail-item">
                            <i class="fas fa-phone"></i>
                            <span>${member.phone}</span>
                        </a>
                    ` : ''}
                    
                    ${member.email ? `
                        <a href="mailto:${member.email}" class="modal-detail-item">
                            <i class="fas fa-envelope"></i>
                            <span>${member.email}</span>
                        </a>
                    ` : ''}
                </div>
                
                <div class="modal-socials">
                    ${member.facebook ? `<a href="${member.facebook}" target="_blank" class="icon-fb" title="Facebook"><i class="fab fa-facebook-f"></i></a>` : ''}
                    ${member.instagram ? `<a href="${member.instagram}" target="_blank" class="icon-ig" title="Instagram"><i class="fab fa-instagram"></i></a>` : ''}
                </div>
            </div>
        `;
        
        profileModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scroll
    }

    function closeModal() {
        profileModal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore background scroll
    }

    // Modal Events
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (profileModal) {
        profileModal.addEventListener('click', (e) => {
            if (e.target === profileModal) closeModal();
        });
    }

    // Escape Key closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && profileModal.classList.contains('active')) {
            closeModal();
        }
    });

    // Real-time Search Handler
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            if (siteConfig) renderTeam(siteConfig.members);
        });
    }

    // Filter Pills Click Handler
    if (filterPills) {
        filterPills.addEventListener('click', (e) => {
            const button = e.target.closest('.filter-btn');
            if (!button) return;

            // Update active state class
            filterPills.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Apply filter value
            activeFilter = button.getAttribute('data-filter');
            if (siteConfig) renderTeam(siteConfig.members);
        });
    }

    // Navigation Mobile Hamburger Toggle
    if (menuToggleBtn && mobileNav) {
        menuToggleBtn.addEventListener('click', () => {
            if (mobileNav.style.display === 'block') {
                mobileNav.style.display = 'none';
            } else {
                mobileNav.style.display = 'block';
            }
        });
    }

    // Theme Switch Controller
    function initTheme() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        if (currentTheme === 'dark') {
            document.body.classList.add('dark-theme');
            if (themeCheckbox) themeCheckbox.checked = true;
        } else {
            document.body.classList.remove('dark-theme');
            if (themeCheckbox) themeCheckbox.checked = false;
        }
    }

    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // Hidden Admin entrance by double-clicking the brand logo
    const logoContainer = document.querySelector('.logo');
    if (logoContainer) {
        logoContainer.style.cursor = 'pointer';
        logoContainer.addEventListener('dblclick', () => {
            window.location.href = 'admin.html';
        });
    }
});
