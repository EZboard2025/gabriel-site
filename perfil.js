// Profile Page JavaScript

// Check if user is logged in
let currentUser = getCurrentUser();

if (!currentUser || !currentUser.isLoggedIn) {
    // Redirect to home if not logged in
    window.location.href = 'index.html';
}

// Load user data from Supabase
async function loadUserData() {
    if (!currentUser) return;

    try {
        // Fetch fresh data from Supabase including profile_photo
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();

        if (error) throw error;

        if (data) {
            // Update currentUser with fresh data
            currentUser = { ...currentUser, ...data };
            localStorage.setItem('ramppy_session', JSON.stringify(currentUser));

            // Update profile header
            document.getElementById('profile-name').textContent = data.nome;
            document.getElementById('profile-email').textContent = data.email;

            // Update avatar - show photo if exists, otherwise initials
            const avatar = document.getElementById('profile-avatar');
            if (data.profile_photo) {
                avatar.innerHTML = `<img src="${data.profile_photo}" alt="Foto de perfil" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            } else {
                const initials = getInitials(data.nome);
                avatar.innerHTML = `<span class="avatar-initials">${initials}</span>`;
            }

            // Update member since
            if (data.created_at) {
                const date = new Date(data.created_at);
                document.getElementById('member-since').textContent = date.getFullYear();
            }

            // Update form fields
            document.getElementById('edit-nome').value = data.nome || '';
            document.getElementById('edit-email').value = data.email || '';
            document.getElementById('edit-empresa').value = data.empresa || '';
            document.getElementById('edit-telefone').value = data.telefone || '';
        }
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        // Fallback to local data
        document.getElementById('profile-name').textContent = currentUser.nome;
        document.getElementById('profile-email').textContent = currentUser.email;
        const initials = getInitials(currentUser.nome);
        document.getElementById('avatar-initials').textContent = initials;
    }
}

// Get initials from name
function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Edit profile functionality
let isEditing = false;
const editBtn = document.getElementById('edit-profile-btn');
const cancelBtn = document.getElementById('cancel-edit-btn');
const formActions = document.getElementById('form-actions');
const profileForm = document.getElementById('profile-form');
const formInputs = profileForm.querySelectorAll('input');

editBtn.addEventListener('click', () => {
    isEditing = true;
    formInputs.forEach(input => {
        if (input.id !== 'edit-email') { // Email shouldn't be editable
            input.disabled = false;
        }
    });
    formActions.style.display = 'flex';
    editBtn.style.display = 'none';
});

cancelBtn.addEventListener('click', () => {
    isEditing = false;
    formInputs.forEach(input => input.disabled = true);
    formActions.style.display = 'none';
    editBtn.style.display = 'flex';
    loadUserData(); // Reload original data
});

// Save profile changes
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('edit-nome').value;
    const empresa = document.getElementById('edit-empresa').value;
    const telefone = document.getElementById('edit-telefone').value;

    try {
        // Update in Supabase
        const { data, error } = await supabase
            .from('users')
            .update({
                nome: nome,
                empresa: empresa,
                telefone: telefone
            })
            .eq('id', currentUser.id)
            .select()
            .single();

        if (error) throw error;

        // Update local session
        const updatedUser = {
            ...currentUser,
            nome: nome,
            empresa: empresa,
            telefone: telefone
        };
        localStorage.setItem('ramppy_session', JSON.stringify(updatedUser));

        // Update UI
        document.getElementById('profile-name').textContent = nome;
        const initials = getInitials(nome);
        document.getElementById('avatar-initials').textContent = initials;

        // Exit edit mode
        isEditing = false;
        formInputs.forEach(input => input.disabled = true);
        formActions.style.display = 'none';
        editBtn.style.display = 'flex';

        alert('Perfil atualizado com sucesso!');
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        alert('Erro ao atualizar perfil. Tente novamente.');
    }
});

// Change password
document.getElementById('change-password-btn').addEventListener('click', () => {
    const currentPassword = prompt('Digite sua senha atual:');
    if (!currentPassword) return;

    const newPassword = prompt('Digite sua nova senha:');
    if (!newPassword) return;

    const confirmPassword = prompt('Confirme sua nova senha:');
    if (newPassword !== confirmPassword) {
        alert('As senhas não coincidem!');
        return;
    }

    // TODO: Implement password change with Supabase
    alert('Funcionalidade de alteração de senha em desenvolvimento.');
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('Tem certeza que deseja sair?')) {
        logoutUser();
        window.location.href = 'index.html';
    }
});

// Delete account
document.getElementById('delete-account-btn').addEventListener('click', async () => {
    const confirmation = prompt('ATENÇÃO: Esta ação é irreversível!\nDigite "EXCLUIR" para confirmar:');

    if (confirmation !== 'EXCLUIR') {
        return;
    }

    try {
        // Delete from Supabase
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', currentUser.id);

        if (error) throw error;

        // Clear session
        localStorage.removeItem('ramppy_session');

        alert('Conta excluída com sucesso.');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Erro ao excluir conta:', error);
        alert('Erro ao excluir conta. Tente novamente.');
    }
});

// Change avatar with image upload
document.getElementById('change-avatar-btn').addEventListener('click', () => {
    // Create file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/png, image/jpeg, image/jpg, image/gif';

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5MB');
            return;
        }

        try {
            // Convert image to base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Image = reader.result;

                // Update in Supabase
                const { error } = await supabase
                    .from('users')
                    .update({ profile_photo: base64Image })
                    .eq('id', currentUser.id);

                if (error) {
                    console.error('Erro do Supabase:', error);
                    throw error;
                }

                // Update local session
                currentUser.profile_photo = base64Image;
                localStorage.setItem('ramppy_session', JSON.stringify(currentUser));

                // Update UI - replace initials with image
                const avatar = document.getElementById('profile-avatar');
                avatar.innerHTML = `<img src="${base64Image}" alt="Foto de perfil" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;

                console.log('Foto salva com sucesso!');
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Erro ao fazer upload da foto:', error);
            alert('Erro ao atualizar foto. Tente novamente.');
        }
    });

    fileInput.click();
});

// Load data on page load
loadUserData();

// ============================================
// Brand Color Customization System
// ============================================

const DEFAULT_BRAND_COLOR = '#22c55e';

// Load saved brand color from database
async function loadBrandColor() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('brand_color')
            .eq('id', currentUser.id)
            .single();

        if (error) throw error;

        const brandColor = data?.brand_color || DEFAULT_BRAND_COLOR;

        // Update color picker
        document.getElementById('brand-color').value = brandColor;
        document.getElementById('brand-color-text').value = brandColor.toUpperCase();

        // Apply color to the page
        applyBrandColor(brandColor);
    } catch (error) {
        console.error('Erro ao carregar cor da marca:', error);
        // Apply default color
        applyBrandColor(DEFAULT_BRAND_COLOR);
    }
}

// Apply brand color to entire site
function applyBrandColor(color) {
    // Apply to CSS variables - this changes ALL green colors in the site
    document.documentElement.style.setProperty('--primary-green', color);
    document.documentElement.style.setProperty('--primary-green-dark', adjustBrightness(color, -20));

    // Update preview elements
    updateBrandPreview(color);

    // Store in localStorage for quick access on other pages
    localStorage.setItem('ramppy_brand_color', color);
}

// Update the preview
function updateBrandPreview(color) {
    const previewBtn = document.querySelector('.preview-btn-primary');
    const previewBadge = document.querySelector('.preview-badge');
    const previewStars = document.querySelectorAll('.preview-star');

    if (previewBtn) {
        previewBtn.style.background = color;
        previewBtn.style.boxShadow = `0 8px 24px ${color}33`;
    }

    if (previewBadge) {
        previewBadge.style.background = `${color}15`;
        previewBadge.style.borderColor = color;
        previewBadge.style.color = color;
    }

    if (previewStars) {
        previewStars.forEach(star => {
            star.style.background = color;
            star.style.boxShadow = `0 0 20px ${color}`;
        });
    }
}

// Sync color picker with text input
function syncBrandColorInputs() {
    const colorInput = document.getElementById('brand-color');
    const textInput = document.getElementById('brand-color-text');

    colorInput.addEventListener('input', (e) => {
        const color = e.target.value;
        textInput.value = color.toUpperCase();
        updateBrandPreview(color);
    });

    textInput.addEventListener('input', (e) => {
        const value = e.target.value;
        if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            colorInput.value = value;
            updateBrandPreview(value);
        }
    });

    textInput.addEventListener('blur', (e) => {
        const value = e.target.value;
        if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
            e.target.value = colorInput.value.toUpperCase();
        }
    });
}

// Save brand color form
const brandColorForm = document.getElementById('brand-color-form');
brandColorForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const brandColor = document.getElementById('brand-color').value;

    try {
        // Save to Supabase
        const { error } = await supabase
            .from('users')
            .update({ brand_color: brandColor })
            .eq('id', currentUser.id);

        if (error) throw error;

        // Apply color to the entire page
        applyBrandColor(brandColor);

        alert('Cor da marca salva com sucesso! Esta cor será aplicada em toda a plataforma.');
    } catch (error) {
        console.error('Erro ao salvar cor:', error);
        alert('Erro ao salvar cor. Certifique-se de ter executado o SQL no Supabase primeiro.');
    }
});

// Reset color to default
document.getElementById('reset-color-btn').addEventListener('click', () => {
    if (confirm('Deseja resetar para o verde padrão da Ramppy?')) {
        document.getElementById('brand-color').value = DEFAULT_BRAND_COLOR;
        document.getElementById('brand-color-text').value = DEFAULT_BRAND_COLOR.toUpperCase();
        updateBrandPreview(DEFAULT_BRAND_COLOR);
    }
});

// Utility: Adjust color brightness
function adjustBrightness(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + percent));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + percent));
    const b = Math.max(0, Math.min(255, (num & 0xff) + percent));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// Initialize brand color system
syncBrandColorInputs();
loadBrandColor();
