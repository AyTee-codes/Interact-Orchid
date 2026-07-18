/**
 * Interact Nepal Web Portal - Admin Dashboard Engine
 * Handles CRUD for members, leaders, resources, projects, branding, and credentials.
 */
import { db, auth } from "./firebase.js";
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
let siteConfig = null;
async function saveToFirebase() {
    if (!siteConfig) {
        throw new Error("siteConfig is null.");
    }

    try {
        await setDoc(
            doc(db, "config", "portal"),
            siteConfig,
            { merge: true }
        );
    } catch (err) {
        console.error("Firebase save failed:", err);
        throw err;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
   
    // Current configuration state
    let selectedPhotoBase64 = null;
    let selectedProjectPhotoBase64 = null;

   


    // DOM Elements
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const sections = document.querySelectorAll('.dashboard-section');
    const headerTitle = document.getElementById('header-section-title');
    const headerDesc = document.getElementById('header-section-desc');
    const toast = document.getElementById('toast');

    // Tables
    const memberTableRows = document.getElementById('member-table-rows');
    const leaderTableRows = document.getElementById('leader-table-rows');
    const resourceTableRows = document.getElementById('resource-table-rows');
    const projectTableRows = document.getElementById('project-table-rows');

    // MODAL 1: Member Elements
    const memberModal = document.getElementById('member-modal');
    const memberForm = document.getElementById('member-form');
    const memberIdInput = document.getElementById('member-id');
    const memberNameInput = document.getElementById('member-name');
    const memberPostInput = document.getElementById('member-post');
    const memberClubInput = document.getElementById('member-club');
    const memberZoneSelect = document.getElementById('member-zone');
    const memberPhoneInput = document.getElementById('member-phone');
    const memberEmailInput = document.getElementById('member-email');
    const memberFbInput = document.getElementById('member-fb');
    const memberIgInput = document.getElementById('member-ig');
    const memberImgurlInput = document.getElementById('member-imgurl');
    const memberPreviewBox = document.getElementById('member-preview-box');
    const memberSubmitBtn = document.getElementById('member-submit-btn');
    const modalFormTitle = document.getElementById('modal-form-title');

    // MODAL 2: Leader Elements
    const leaderModal = document.getElementById('leader-modal');
    const leaderForm = document.getElementById('leader-form');
    const leaderIdInput = document.getElementById('leader-id');
    const leaderYearInput = document.getElementById('leader-year');
    const leaderNameInput = document.getElementById('leader-name');
    const leaderClubInput = document.getElementById('leader-club');
    const leaderThemeInput = document.getElementById('leader-theme');
    const leaderSubmitBtn = document.getElementById('leader-submit-btn');
    const leaderFormTitle = document.getElementById('leader-form-title');

    // MODAL 3: Resource Elements
    const resourceModal = document.getElementById('resource-modal');
    const resourceForm = document.getElementById('resource-form');
    const resourceIdInput = document.getElementById('resource-id');
    const resourceTitleInput = document.getElementById('resource-title');
    const resourceTypeSelect = document.getElementById('resource-type');
    const resourceLinkInput = document.getElementById('resource-link');
    const resourceSubmitBtn = document.getElementById('resource-submit-btn');
    const resourceFormTitle = document.getElementById('resource-form-title');

    // MODAL 4: Project Elements
    const projectModal = document.getElementById('project-modal');
    const projectForm = document.getElementById('project-form');
    const projectIdInput = document.getElementById('project-id');
    const projectTitleInput = document.getElementById('project-title');
    const projectClubInput = document.getElementById('project-club');
    const projectDateInput = document.getElementById('project-date');
    const projectDescInput = document.getElementById('project-desc');
    const projectImgurlInput = document.getElementById('project-imgurl');
    const projectPreviewBox = document.getElementById('project-preview-box');
    const projectSubmitBtn = document.getElementById('project-submit-btn');
    const projectFormTitle = document.getElementById('project-form-title');

    // Sidebar Section Switcher
    sidebarItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');

            // Toggle sidebar active item
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Show active section
            sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            // Dynamic header titles
            if (targetId === 'branding-sec') {
                headerTitle.textContent = "Branding & Colors";
                headerDesc.textContent = "Manage site identity, theme colors, logos, and footer information.";
            } else if (targetId === 'members-sec') {
                headerTitle.textContent = "Team Members";
                headerDesc.textContent = "Add, edit, or remove district and zone officers.";
            } else if (targetId === 'leaders-sec') {
                headerTitle.textContent = "Past BOD's";
                headerDesc.textContent = "Manage tenure records of previous District Interact Representatives.";
            } else if (targetId === 'resources-sec') {
                headerTitle.textContent = "Resources";
                headerDesc.textContent = "Organize downloadable bylaws, report templates, and guidelines.";
            } else if (targetId === 'projects-sec') {
                headerTitle.textContent = "District Projects";
                headerDesc.textContent = "Highlight collaborative service campaigns, dates, and summaries.";
            } else if (targetId === 'sync-sec') {
                headerTitle.textContent = "Import & Export";
                headerDesc.textContent = "Import or export configuration files for absolute portability.";
            }
        });
    });

    // Auth DOM Elements
    const loginOverlay = document.getElementById('login-overlay');
    const dashboardWrapper = document.getElementById('dashboard-wrapper');
    const loginError = document.getElementById('login-error');
    checkAuth();

function checkAuth() {
    onAuthStateChanged(auth, async (user) => {
        if(user){
            loginOverlay.style.display = "none";
            dashboardWrapper.style.display = "block";

            await loadConfiguration();
        }else{
            loginOverlay.style.display = "flex";
            dashboardWrapper.style.display = "none";
        }
    });
}
   

  // Login Form Submit Handler
window.handleLogin = async function(event){

    event.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        loginError.style.display = "none";

    } catch(error){

        console.error(error);

       if(error.code === "auth/invalid-credential"){
        loginError.innerHTML =
        "Invalid email or password.";
    }
    else{
        loginError.innerHTML =
        "Something went wrong. Try again.";
    }

    loginError.style.display="block";
}
};
    // Logout Handler
   window.handleLogout = async function(){
    await signOut(auth);
   };

    // Initialize config
    async function loadConfiguration() {
    try {
        const docRef = doc(db, "config", "portal");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

siteConfig = {
    branding: data.branding || {},
    members: data.members || [],
    leaders: data.leaders || [],
    resources: data.resources || [],
    projects: data.projects || []
};
        } else {
            await fetchDefaultConfig();
            
        }

        populateBrandingForm(siteConfig.branding);
        renderAllTables();

    } catch (err) {
        console.error(err);
    }
} 

    /**
     * Seed config loader
     */
    async function fetchDefaultConfig() {
        try {
            const response = await fetch('default-config.json');
            siteConfig = await response.json();
           await saveToFirebase();
            populateBrandingForm(siteConfig.branding);
            renderAllTables();
        } catch (error) {
            console.error("Config fetch error:", error);
            showToast("Critical error loading configuration file.", true);
        }
    }

    /**
     * Populates the branding form inputs with current configuration values
     */
    function populateBrandingForm(branding) {
        if (!branding) return;
        document.getElementById('brand-sitename').value = branding.siteName || '';
        document.getElementById('brand-logourl').value = branding.logoUrl || '';
        document.getElementById('brand-themelogourl').value = branding.themeLogoUrl || '';
        
        document.getElementById('color-primary').value = branding.primaryColor || '#0C2340';
        document.getElementById('color-primary-text').value = branding.primaryColor || '#0C2340';
        
        document.getElementById('color-accent').value = branding.accentColor || '#00A3E0';
        document.getElementById('color-accent-text').value = branding.accentColor || '#00A3E0';
        
        document.getElementById('color-gold').value = branding.goldColor || '#F39C12';
        document.getElementById('color-gold-text').value = branding.goldColor || '#F39C12';

        
        document.getElementById('brand-footertext').value = branding.footerText || '';
        document.getElementById('brand-footerdesc').value = branding.footerDesc || '';
    }

    /**
     * Saves branding changes to the current configuration state
     */
    window.saveBranding = async function(event) {
        event.preventDefault();
        if (!siteConfig) return;

        siteConfig.branding = {
            siteName: document.getElementById('brand-sitename').value,
            logoUrl: document.getElementById('brand-logourl').value,
            themeLogoUrl: document.getElementById('brand-themelogourl').value,
            primaryColor: document.getElementById('color-primary').value,
            accentColor: document.getElementById('color-accent').value,
            goldColor: document.getElementById('color-gold').value,
            footerText: document.getElementById('brand-footertext').value,
            footerDesc: document.getElementById('brand-footerdesc').value
        };

        try {
        await saveToFirebase();

renderBrandingTable(siteConfig.Branding);
closeMemberModal();
showToast("Branding updated successfully.");
    } catch (error) {
        console.error(error);
        showToast("Failed to save branding changes.", true);
    }
};

    /**
     * Renders tables for all segments
     */
    function renderAllTables() {
        if (!siteConfig) return;
        renderMembersTable(siteConfig.members || []);
        renderLeadersTable(siteConfig.leaders || []);
        renderResourcesTable(siteConfig.resources || []);
        renderProjectsTable(siteConfig.projects || []);
    }

    /* ==========================================
       CRUD 1: TEAM MEMBERS MODULE
       ========================================== */
    function renderMembersTable(members) {
        if (!memberTableRows) return;
        memberTableRows.innerHTML = '';

        if (members.length === 0) {
            memberTableRows.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">No members registered.</td></tr>`;
            return;
        }

        members.forEach(member => {
            const tr = document.createElement('tr');
            const memberImage = member.image || 'https://interactnepal.org/images/default-user.png';
            tr.innerHTML = `
                <td>
                    <div class="table-member-profile">
                        <img src="${memberImage}" class="table-member-img" alt="" onerror="this.onerror=null; this.src='https://interactnepal.org/images/default-user.png';">
                        <div class="table-member-name">${member.name}</div>
                    </div>
                </td>
                <td>${member.post}</td>
                <td>${member.club}</td>
                <td><span style="font-weight:600;">${member.zone}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-secondary" onclick="openMemberModal('edit', '${member.id}')"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn btn-danger" onclick="deleteMember('${member.id}')"><i class="fas fa-trash-alt"></i> Delete</button>
                    </div>
                </td>
            `;
            memberTableRows.appendChild(tr);
        });
    }

    window.openMemberModal = function(mode, memberId = null) {
        selectedPhotoBase64 = null;
        memberForm.reset();
        memberPreviewBox.innerHTML = '<i class="fas fa-user"></i>';

        if (mode === 'add') {
            modalFormTitle.textContent = "Add Team Member";
            memberSubmitBtn.textContent = "Add Member";
            memberIdInput.value = "";
        } else if (mode === 'edit' && memberId) {
            modalFormTitle.textContent = "Edit Team Member";
            memberSubmitBtn.textContent = "Save Changes";
            memberIdInput.value = memberId;

            const member = (siteConfig.members || []).find(m => m.id === memberId);
            if (member) {
                memberNameInput.value = member.name || '';
                memberPostInput.value = member.post || '';
                memberClubInput.value = member.club || '';
                memberZoneSelect.value = member.zone || 'District';
                memberPhoneInput.value = member.phone || '';
                memberEmailInput.value = member.email || '';
                memberFbInput.value = member.facebook || '';
                memberIgInput.value = member.instagram || '';
                memberImgurlInput.value = (member.image && !member.image.startsWith('data:')) ? member.image : '';

                if (member.image) {
                    memberPreviewBox.innerHTML = `<img src="${member.image}" alt="">`;
                    if (member.image.startsWith('data:')) {
                        selectedPhotoBase64 = member.image;
                    }
                }
            }
        }
        memberModal.classList.add('active');
    };

    window.closeMemberModal = function() {
        memberModal.classList.remove('active');
    };

    window.handleMemberPhotoUpload = function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            selectedPhotoBase64 = e.target.result;
            memberPreviewBox.innerHTML = `<img src="${selectedPhotoBase64}" alt="">`;
            memberImgurlInput.value = "";
        };
        reader.readAsDataURL(file);
    };

    window.updateMemberPhotoPreview = function(url) {
        if (!url) {
            memberPreviewBox.innerHTML = '<i class="fas fa-user"></i>';
            return;
        }
        selectedPhotoBase64 = null;
        memberPreviewBox.innerHTML = `<img src="${url}" alt="" onerror="this.onerror=null; this.parentNode.innerHTML='<i class=\'fas fa-exclamation-circle\'></i>';">`;
    };

    window.saveMember = async function(event) {
        event.preventDefault();
        if (!siteConfig) return;

        const memberId = memberIdInput.value;
        const memberData = {
            id: memberId || 'member-' + Date.now(),
            name: memberNameInput.value,
            post: memberPostInput.value,
            club: memberClubInput.value,
            zone: memberZoneSelect.value,
            phone: memberPhoneInput.value,
            email: memberEmailInput.value,
            facebook: memberFbInput.value,
            instagram: memberIgInput.value,
            image: selectedPhotoBase64 || memberImgurlInput.value || 'https://interactnepal.org/images/default-user.png'
        };

        if (memberId) {
            const index = siteConfig.members.findIndex(m => m.id === memberId);
            if (index !== -1) siteConfig.members[index] = memberData;
            
        } else {
            siteConfig.members ??= [];
            siteConfig.members.push(memberData);
            showToast("New member successfully added.");
        }
        try {
        await saveToFirebase();

renderMembersTable(siteConfig.members);
closeMemberModal();
showToast("Member updated successfully.");
    } catch (error) {
        console.error(error);
        showToast("Failed to save member changes.", true);
    }
};

    window.deleteMember = async function(memberId) {
        if (!confirm("Delete this team member?")) return;
        siteConfig.members = siteConfig.members.filter(m => m.id !== memberId);
        try {
            await saveToFirebase();
        } catch (error) {
            console.error(error);
            showToast("Failed to delete member.", true);
        }
        renderMembersTable(siteConfig.members);
        showToast("Member deleted.");
    };


    /* ==========================================
       CRUD 2: PAST BOD MODULE
       ========================================== */
    function renderLeadersTable(leaders) {
        if (!leaderTableRows) return;
        leaderTableRows.innerHTML = '';

        if (leaders.length === 0) {
            leaderTableRows.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">No leaders documented.</td></tr>`;
            return;
        }

        leaders.forEach(leader => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span style="font-weight:600;">${leader.year}</span></td>
                <td>${leader.name}</td>
                <td>${leader.club}</td>
                <td><span style="font-style:italic;">"${leader.theme || ''}"</span></td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-secondary" onclick="openLeaderModal('edit', '${leader.id}')"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn btn-danger" onclick="deleteLeader('${leader.id}')"><i class="fas fa-trash-alt"></i> Delete</button>
                    </div>
                </td>
            `;
            leaderTableRows.appendChild(tr);
        });
    }

    window.openLeaderModal = function(mode, leaderId = null) {
        leaderForm.reset();
        if (mode === 'add') {
            leaderFormTitle.textContent = "Add Past Leader";
            leaderSubmitBtn.textContent = "Add Leader";
            leaderIdInput.value = "";
        } else if (mode === 'edit' && leaderId) {
            leaderFormTitle.textContent = "Edit Past Leader";
            leaderSubmitBtn.textContent = "Save Changes";
            leaderIdInput.value = leaderId;

            const leader = (siteConfig.leaders || []).find(m => m.id === leaderId);
            if (leader) {
                leaderYearInput.value = leader.year || '';
                leaderNameInput.value = leader.name || '';
                leaderClubInput.value = leader.club || '';
                leaderThemeInput.value = leader.theme || '';
            }
        }
        leaderModal.classList.add('active');
    };

    window.closeLeaderModal = function() {
        leaderModal.classList.remove('active');
    };

    window.saveLeader = async function(event) {
        event.preventDefault();
        if (!siteConfig) return;

        const id = leaderIdInput.value;
        const leaderData = {
            id: id || 'leader-' + Date.now(),
            year: leaderYearInput.value,
            name: leaderNameInput.value,
            club: leaderClubInput.value,
            theme: leaderThemeInput.value
        };

        if (id) {
            const index = siteConfig.leaders.findIndex(l => l.id === id);
            if (index !== -1) siteConfig.leaders[index] = leaderData;
        } else {
            siteConfig.leaders ??= [];
            siteConfig.leaders.push(leaderData);
            showToast("New past leader added.");
        }

        try {
        await saveToFirebase();
        renderLeadersTable(siteConfig.leaders);
closeLeaderModal();
        showToast("Leader updated successfully.");
    } catch (error) {
        console.error(error);
        showToast("Failed to save leader changes.", true);
    }
};

    window.deleteLeader = async function(id) {
        if (!confirm("Delete this leader record?")) return;
        siteConfig.leaders = siteConfig.leaders.filter(l => l.id !== id);
        try {
    await saveToFirebase();
} catch(err){
    console.error(err);
    showToast("Failed to delete leader.", true);
    return;
}

renderLeadersTable(siteConfig.leaders);
showToast("Leader deleted.");
        renderLeadersTable(siteConfig.leaders);
        showToast("Leader record deleted.");
    };


    /* ==========================================
       CRUD 3: RESOURCES MODULE
       ========================================== */
    function renderResourcesTable(resources) {
        if (!resourceTableRows) return;
        resourceTableRows.innerHTML = '';

        if (resources.length === 0) {
            resourceTableRows.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-muted);">No resources registered.</td></tr>`;
            return;
        }

        resources.forEach(res => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span style="font-weight:600;">${res.title}</span></td>
                <td>${res.type}</td>
                <td><a href="${res.link}" target="_blank">${res.link}</a></td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-secondary" onclick="openResourceModal('edit', '${res.id}')"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn btn-danger" onclick="deleteResource('${res.id}')"><i class="fas fa-trash-alt"></i> Delete</button>
                    </div>
                </td>
            `;
            resourceTableRows.appendChild(tr);
        });
    }

    window.openResourceModal = function(mode, resId = null) {
        resourceForm.reset();
        if (mode === 'add') {
            resourceFormTitle.textContent = "Add Resource File";
            resourceSubmitBtn.textContent = "Add Resource";
            resourceIdInput.value = "";
        } else if (mode === 'edit' && resId) {
            resourceFormTitle.textContent = "Edit Resource File";
            resourceSubmitBtn.textContent = "Save Changes";
            resourceIdInput.value = resId;

            const res = (siteConfig.resources || []).find(m => m.id === resId);
            if (res) {
                resourceTitleInput.value = res.title || '';
                resourceTypeSelect.value = res.type || 'PDF Document';
                resourceLinkInput.value = res.link || '';
            }
        }
        resourceModal.classList.add('active');
    };

    window.closeResourceModal = function() {
        resourceModal.classList.remove('active');
    };

    window.saveResource = async function(event) {
        event.preventDefault();
        if (!siteConfig) return;

        const id = resourceIdInput.value;
        const resData = {
            id: id || 'res-' + Date.now(),
            title: resourceTitleInput.value,
            type: resourceTypeSelect.value,
            link: resourceLinkInput.value
        };

        if (id) {
            const index = siteConfig.resources.findIndex(r => r.id === id);
            if (index !== -1) siteConfig.resources[index] = resData;
            
        } else {
            siteConfig.resources ??= [];
        siteConfig.resources.push(resData);
            showToast("New resource document added.");
        }

        try {
        await saveToFirebase();
        renderResourcesTable(siteConfig.resources);
closeResourceModal();
        showToast("Resource updated successfully.");
    } catch (error) {
        console.error(error);
        showToast("Failed to save resource changes.", true);
    }
};

    window.deleteResource = async function(id) {
        if (!confirm("Delete this resource file?")) return;
        siteConfig.resources = siteConfig.resources.filter(r => r.id !== id);
        try {
            await saveToFirebase();
        } catch (error) {
            console.error(error);
            showToast("Failed to delete resource.", true);
            return;
        }
        renderResourcesTable(siteConfig.resources);
        showToast("Resource document removed.");
    };


    /* ==========================================
       CRUD 4: DISTRICT PROJECTS MODULE
       ========================================== */
    function renderProjectsTable(projects) {
        if (!projectTableRows) return;
        projectTableRows.innerHTML = '';

        if (projects.length === 0) {
            projectTableRows.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">No projects registered.</td></tr>`;
            return;
        }

        projects.forEach(proj => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span style="font-weight:600;">${proj.title}</span></td>
                <td>${proj.club}</td>
                <td>${proj.date}</td>
                <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${proj.desc}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-secondary" onclick="openProjectModal('edit', '${proj.id}')"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn btn-danger" onclick="deleteProject('${proj.id}')"><i class="fas fa-trash-alt"></i> Delete</button>
                    </div>
                </td>
            `;
            projectTableRows.appendChild(tr);
        });
    }

    window.openProjectModal = function(mode, projId = null) {
        selectedProjectPhotoBase64 = null;
        projectForm.reset();
        projectPreviewBox.innerHTML = '<i class="fas fa-image"></i>';

        if (mode === 'add') {
            projectFormTitle.textContent = "Add District Project";
            projectSubmitBtn.textContent = "Add Project";
            projectIdInput.value = "";
        } else if (mode === 'edit' && projId) {
            projectFormTitle.textContent = "Edit District Project";
            projectSubmitBtn.textContent = "Save Changes";
            projectIdInput.value = projId;

            const proj = (siteConfig.projects || []).find(p => p.id === projId);

if (proj) {
    projectTitleInput.value = proj.title || '';
    projectClubInput.value = proj.club || '';
    projectDateInput.value = proj.date || '';
    projectDescInput.value = proj.desc || '';
    projectImgurlInput.value =
        (proj.image && !proj.image.startsWith('data:')) ? proj.image : '';

    if (proj.image) {
        projectPreviewBox.innerHTML = `<img src="${proj.image}" alt="">`;

        if (proj.image.startsWith('data:')) {
            selectedProjectPhotoBase64 = proj.image;
        }
    }
}
        }
        projectModal.classList.add('active');
    };

    window.closeProjectModal = function() {
        projectModal.classList.remove('active');
    };

    window.handleProjectPhotoUpload = function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            selectedProjectPhotoBase64 = e.target.result;
            projectPreviewBox.innerHTML = `<img src="${selectedProjectPhotoBase64}" alt="">`;
            projectImgurlInput.value = "";
        };
        reader.readAsDataURL(file);
    };

    window.updateProjectPhotoPreview = function(url) {
        if (!url) {
            projectPreviewBox.innerHTML = '<i class="fas fa-image"></i>';
            return;
        }
        selectedProjectPhotoBase64 = null;
        projectPreviewBox.innerHTML = `<img src="${url}" alt="" onerror="this.onerror=null; this.parentNode.innerHTML='<i class=\'fas fa-exclamation-circle\'></i>';">`;
    };

    window.saveProject = async function(event) {
        event.preventDefault();
        if (!siteConfig) return;

        const id = projectIdInput.value;
        const projData = {
            id: id || 'proj-' + Date.now(),
            title: projectTitleInput.value,
            club: projectClubInput.value,
            date: projectDateInput.value,
            desc: projectDescInput.value,
            image: selectedProjectPhotoBase64 || projectImgurlInput.value || 'https://interactnepal.org/images/theme.png'
        };

        if (id) {
            const index = siteConfig.projects.findIndex(p => p.id === id);
            if (index !== -1) siteConfig.projects[index] = projData;
            
        } else {
            siteConfig.projects ??= [];
            siteConfig.projects.push(projData);
            showToast("New service project added.");
        }

        try {
        await saveToFirebase();
        renderProjectsTable(siteConfig.projects);
closeProjectModal();
        showToast("Project updated successfully.");
    } catch (error) {
        console.error(error);
        showToast("Failed to save project changes.", true);
    }
};

    window.deleteProject =async function(id) {
        if (!confirm("Delete this project?")) return;
        siteConfig.projects = siteConfig.projects.filter(p => p.id !== id);
        try {
            await saveToFirebase();
        } catch (error) {
            console.error(error);
            showToast("Failed to delete project.", true);
        }
        renderProjectsTable(siteConfig.projects);
        showToast("Project record deleted.");
    };


    /* ==========================================
       SYSTEM LEVEL CONFIGURATION & BACKUPS
       ========================================== */
    window.restoreDefaults = async function () {
    if (!confirm("Restore defaults?")) return;

    await fetchDefaultConfig();

    showToast("Defaults restored.");
};

    window.exportConfig = function() {
        if (!siteConfig) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(siteConfig, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "interact-config.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast("Full configuration JSON exported.");
    };

    window.importConfig = async function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (
    !importedData.branding ||
    !Array.isArray(importedData.members) ||
    !Array.isArray(importedData.leaders) ||
    !Array.isArray(importedData.resources) ||
    !Array.isArray(importedData.projects)
) {
    throw new Error("Invalid format.");
}

                siteConfig = importedData;
                await saveToFirebase();
                populateBrandingForm(siteConfig.branding);
                renderAllTables();
                showToast("All configurations and content imported successfully!");
            } catch (err) {
                console.error(err);
                showToast("Invalid JSON file schema structure.", true);
            }
        };
        reader.readAsText(file);
    };

    function showToast(message, isError = false) {
        toast.textContent = message;
        toast.className = "toast";
        if (isError) toast.classList.add('toast-error');
        toast.classList.add('active');

        setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    }
});
