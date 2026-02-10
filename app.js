document.addEventListener('DOMContentLoaded', () => {
    const activitiesList = document.getElementById('activitiesList');
    const addActivityBtn = document.getElementById('addActivityBtn');
    const reimbursementForm = document.getElementById('reimbursementForm');
    const resultCard = document.getElementById('resultCard');
    const bbcodeOutput = document.getElementById('bbcodeOutput');
    const copyBtn = document.getElementById('copyBtn');
    const subjectOutput = document.getElementById('subjectOutput');
    const copySubjectBtn = document.getElementById('copySubjectBtn');
    const forumPostLink = document.getElementById('forumPostLink');
    const periodInput = document.getElementById('period');

    // Settings elements
    const settingsModal = document.getElementById('settingsModal');
    const openSettingsBtn = document.getElementById('openSettingsBtn');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const clientIdInput = document.getElementById('clientIdInput');

    const DEFAULT_CLIENT_ID = '7e9230a41c07e4c';
    let activityCount = 0;

    // Load settings
    clientIdInput.value = localStorage.getItem('imgur_client_id') || DEFAULT_CLIENT_ID;

    // Settings Modal Logic
    openSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
        lucide.createIcons();
    });

    [closeSettingsBtn, settingsModal].forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target === el || el === closeSettingsBtn) {
                settingsModal.classList.add('hidden');
            }
        });
    });

    saveSettingsBtn.addEventListener('click', () => {
        localStorage.setItem('imgur_client_id', clientIdInput.value.trim());
        const originalText = saveSettingsBtn.innerHTML;
        saveSettingsBtn.innerHTML = '<span class="flex items-center justify-center gap-2"><i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Saving...</span>';
        lucide.createIcons();

        setTimeout(() => {
            saveSettingsBtn.innerHTML = originalText;
            settingsModal.classList.add('hidden');
        }, 600);
    });

    // Detect period automatically
    const periodContext = getPeriodContext();
    periodInput.value = periodContext;

    // Add initial activity
    addActivity();

    function getPeriodContext() {
        const now = new Date();
        const date = now.getDate();
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        const monthName = monthNames[now.getMonth()];

        let week;
        if (date <= 7) week = "Week 1";
        else if (date <= 14) week = "Week 2";
        else if (date <= 21) week = "Week 3";
        else week = "Week 4";

        return `${week} / ${monthName}`;
    }

    addActivityBtn.addEventListener('click', () => {
        addActivity();
    });

    reimbursementForm.addEventListener('submit', (e) => {
        e.preventDefault();
        generateBBCode();
    });

    copyBtn.addEventListener('click', () => {
        const text = bbcodeOutput.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i> Copied!';
            copyBtn.classList.add('bg-green-600');
            lucide.createIcons();
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.classList.remove('bg-green-600');
                lucide.createIcons();
            }, 2000);
        });
    });

    copySubjectBtn.addEventListener('click', () => {
        const text = subjectOutput.value;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copySubjectBtn.textContent;
            copySubjectBtn.textContent = 'Copied!';
            copySubjectBtn.classList.replace('text-accent-blue', 'text-green-500');
            setTimeout(() => {
                copySubjectBtn.textContent = originalText;
                copySubjectBtn.classList.replace('text-green-500', 'text-accent-blue');
            }, 2000);
        });
    });

    forumPostLink.addEventListener('click', () => {
        const text = bbcodeOutput.textContent;
        navigator.clipboard.writeText(text);
    });

    function addActivity() {
        activityCount++;
        const div = document.createElement('div');
        div.className = 'p-6 md:p-8 bg-white/2 border border-white/5 rounded-2xl space-y-6 relative group/item animate-slide-up';
        div.id = `activity-${activityCount}`;
        div.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <span class="px-3 py-1 bg-accent-blue/10 text-accent-blue text-[10px] font-bold uppercase tracking-wider rounded-full border border-accent-blue/20">
                        Activity ${activityCount}
                    </span>
                </div>
                ${activityCount > 1 ? `
                    <button type="button" class="p-2 text-slate-500 hover:text-red-400 transition-colors" onclick="removeActivity(${activityCount})">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                ` : ''}
            </div>

            <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Activity Description</label>
                <input type="text" id="desc-${activityCount}" class="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-accent-blue transition-colors text-sm" placeholder="e.g. Vehicle maintenance, Fuel restoration..." required>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                    <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Refund Amount</label>
                    <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                        <input type="text" id="refund-${activityCount}" class="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white focus:outline-none focus:border-accent-blue transition-colors text-sm font-mono" placeholder="100.00" required>
                    </div>
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Proof Link (URL)</label>
                    <div class="flex gap-2">
                        <div class="relative flex-grow">
                             <input type="text" id="img-${activityCount}" class="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-accent-blue transition-colors text-sm" placeholder="Paste link or upload..." required>
                        </div>
                        <label class="cursor-pointer shrink-0 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                            <i data-lucide="upload" class="w-4 h-4"></i>
                            <input class="hidden" type="file" accept="image/*" onchange="handleFileUpload(this, ${activityCount})">
                        </label>
                    </div>
                    <p id="status-${activityCount}" class="text-[10px] flex items-center gap-2 text-slate-500">
                        <span class="w-1 h-1 rounded-full bg-slate-500"></span>
                        Ready to upload
                    </p>
                </div>
            </div>
        `;
        activitiesList.appendChild(div);
        lucide.createIcons();
    }

    function parseAmount(str) {
        if (!str) return 0;
        let clean = str.replace(/[^\d.,-]/g, '');
        const lastDot = clean.lastIndexOf('.');
        const lastComma = clean.lastIndexOf(',');

        if (lastDot > lastComma) {
            clean = clean.replace(/,/g, '');
        } else if (lastComma > lastDot) {
            clean = clean.replace(/\./g, '').replace(/,/g, '.');
        } else {
            const parts = clean.split(/[.,]/);
            if (parts.length > 1) {
                if (parts[1].length === 3) {
                    clean = clean.replace(/[.,]/g, '');
                } else {
                    clean = clean.replace(/[.,]/, '.');
                }
            }
        }

        const result = parseFloat(clean);
        return isNaN(result) ? 0 : result;
    }

    function formatCurrency(num) {
        return num.toLocaleString('de-DE', {
            minimumFractionDigits: num % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2
        });
    }

    window.handleFileUpload = async (input, id) => {
        const file = input.files[0];
        if (!file) return;

        const statusLabel = document.getElementById(`status-${id}`);
        const imgInput = document.getElementById(`img-${id}`);

        statusLabel.innerHTML = '<i data-lucide="loader-2" class="w-3 h-3 animate-spin"></i> Uploading...';
        statusLabel.className = 'text-[10px] flex items-center gap-2 text-blue-400';
        lucide.createIcons();

        const setSuccess = (url) => {
            imgInput.value = url;
            statusLabel.innerHTML = '<i data-lucide="check-circle-2" class="w-3 h-3"></i> Upload complete!';
            statusLabel.className = 'text-[10px] flex items-center gap-2 text-green-500';
            lucide.createIcons();
        };

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Data = reader.result.split(',')[1];

            try {
                const clientId = localStorage.getItem('imgur_client_id') || DEFAULT_CLIENT_ID;
                const formData = new FormData();
                formData.append('image', base64Data);
                formData.append('type', 'base64');

                const response = await fetch('https://api.imgur.com/3/image', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Client-ID ${clientId}`
                    },
                    body: formData,
                    referrerPolicy: 'no-referrer'
                });

                if (response.status === 403) throw new Error('IMGUR_REJECTED');

                const result = await response.json();
                if (result.success) {
                    setSuccess(result.data.link);
                } else {
                    throw new Error(result.data?.error || 'Direct upload failed');
                }
            } catch (error) {
                console.error('Upload Error:', error.message);
                statusLabel.innerHTML = '<i data-lucide="alert-circle" class="w-3 h-3"></i> Upload failed';
                statusLabel.className = 'text-[10px] flex items-center gap-2 text-red-400';
                lucide.createIcons();

                if (error.message === 'IMGUR_REJECTED') {
                    alert('Imgur rejected the request (403). Please update your Client-ID in settings.');
                }
            }
        };
    };

    window.removeActivity = (id) => {
        const el = document.getElementById(`activity-${id}`);
        if (el) el.remove();
    };

    function generateBBCode() {
        const name = document.getElementById('name').value;
        const position = document.getElementById('position').value;
        const period = document.getElementById('period').value;

        const activityItems = document.querySelectorAll('#activitiesList > div');
        let totalRefund = 0;
        let activitiesBB = '';

        activityItems.forEach((item) => {
            const desc = item.querySelector('input[id^="desc-"]').value;
            const refundStr = item.querySelector('input[id^="refund-"]').value;
            const img = item.querySelector('input[id^="img-"]').value;

            const amount = parseAmount(refundStr);
            totalRefund += amount;

            activitiesBB += `
[*][b]${desc}[/b]
[spoiler]
[b]Activity Description:[/b] ${desc}
[b]Refund:[/b] $${refundStr} 
[spoiler][img]${img}[/img][/spoiler]
[/spoiler]`;
        });

        const formattedTotal = formatCurrency(totalRefund);
        const subject = `Reimbursement ${name} (${period})`;
        subjectOutput.value = subject;

        const bbcode = `[divbox=darkBlue][divbox=White]
[hr][/hr]
[center][img]https://i.imgur.com/s4itB88.png[/img][/center]
[hr][/hr]
[divbox=darkblue][color=#FFFFFF][center][size=150][b]Reimbursement[/b][/size][/center][/color][/divbox]
[hr][/hr]
[b]Name:[/b] ${name}
[b]Position:[/b] ${position}
[b]Total Refund:[/b] $${formattedTotal}
[b]Activity:[/b]


[spoiler]
[list]
${activitiesBB}
[/list]
[/spoiler]
[/divbox][/divbox]`;

        bbcodeOutput.textContent = bbcode.trim();

        const forumUrl = new URL('https://news.san-andreas.net/posting.php');
        forumUrl.searchParams.set('mode', 'post');
        forumUrl.searchParams.set('f', '767');
        forumUrl.searchParams.set('subject', subject);
        forumUrl.searchParams.set('message', bbcode);
        forumUrl.searchParams.set('msg', bbcode);

        forumPostLink.href = forumUrl.toString();

        resultCard.classList.remove('hidden');
        resultCard.scrollIntoView({ behavior: 'smooth' });
        lucide.createIcons();
    }
});

