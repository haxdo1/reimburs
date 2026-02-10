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
    openSettingsBtn.addEventListener('click', () => settingsModal.classList.add('is-active'));
    [closeSettingsBtn, document.querySelector('.modal-background')].forEach(el => {
        el.addEventListener('click', () => settingsModal.classList.remove('is-active'));
    });
    saveSettingsBtn.addEventListener('click', () => {
        localStorage.setItem('imgur_client_id', clientIdInput.value.trim());
        saveSettingsBtn.classList.add('is-loading');
        setTimeout(() => {
            saveSettingsBtn.classList.remove('is-loading');
            settingsModal.classList.remove('is-active');
        }, 500);
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
            copyBtn.innerHTML = '<strong>Copied!</strong>';
            copyBtn.classList.replace('is-info', 'is-success');
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.classList.replace('is-success', 'is-info');
            }, 2000);
        });
    });

    copySubjectBtn.addEventListener('click', () => {
        const text = subjectOutput.value;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copySubjectBtn.innerHTML;
            copySubjectBtn.innerHTML = '<strong>Copied!</strong>';
            copySubjectBtn.classList.add('is-success');
            setTimeout(() => {
                copySubjectBtn.innerHTML = originalText;
                copySubjectBtn.classList.remove('is-success');
            }, 2000);
        });
    });

    // Auto-copy BBCode when clicking "Post to Forum" (double insurance)
    forumPostLink.addEventListener('click', () => {
        const text = bbcodeOutput.textContent;
        navigator.clipboard.writeText(text);
        // We don't change button text here to avoid confusing the navigation
    });

    function addActivity() {
        activityCount++;
        const div = document.createElement('div');
        div.className = 'activity-item';
        div.id = `activity-${activityCount}`;
        div.innerHTML = `
            <div class="level is-mobile mb-4">
                <div class="level-left">
                    <span class="tag is-info is-light is-rounded">UNIT ${activityCount}</span>
                </div>
                <div class="level-right">
                    ${activityCount > 1 ? `<button type="button" class="button is-danger is-small is-ghost" onclick="removeActivity(${activityCount})">Terminate</button>` : ''}
                </div>
            </div>

            <div class="field mb-5">
                <label class="label">Activity Description</label>
                <div class="control">
                    <input type="text" id="desc-${activityCount}" class="input activity-desc" placeholder="Operational task description..." required>
                </div>
            </div>

            <div class="columns is-variable is-4">
                <div class="column is-4">
                    <div class="field">
                        <label class="label">Refund Amount</label>
                        <div class="control">
                            <input type="text" id="refund-${activityCount}" class="input activity-refund" placeholder="0.000" required>
                        </div>
                    </div>
                </div>
                <div class="column">
                    <div class="field">
                        <label class="label">Evidence Protocol (URL)</label>
                        <div class="field has-addons">
                            <div class="control is-expanded">
                                <input type="text" id="img-${activityCount}" class="input activity-img" placeholder="Upload or paste link..." required>
                            </div>
                            <div class="control">
                                <div class="file is-info">
                                    <label class="file-label">
                                        <input class="file-input" type="file" accept="image/*" onchange="handleFileUpload(this, ${activityCount})">
                                        <span class="file-cta">
                                            <span class="file-label">Upload</span>
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <p id="status-${activityCount}" class="help mt-2">Ready for data entry</p>
                    </div>
                </div>
            </div>
        `;
        activitiesList.appendChild(div);
    }

    /**
     * Robustly parses currency amounts handling dots as thousand separators 
     * and commas as decimal separators (or vice versa).
     */
    function parseAmount(str) {
        if (!str) return 0;

        // Remove currency symbols and spaces
        let clean = str.replace(/[^\d.,-]/g, '');

        // Find positions of last dot and last comma
        const lastDot = clean.lastIndexOf('.');
        const lastComma = clean.lastIndexOf(',');

        if (lastDot > lastComma) {
            // Dot is likely the decimal separator (e.g., 1,000.75)
            // Remove commas as thousand separators
            clean = clean.replace(/,/g, '');
        } else if (lastComma > lastDot) {
            // Comma is likely the decimal separator (e.g., 1.000,75)
            // Remove dots as thousand separators, then replace comma with dot for JS float
            clean = clean.replace(/\./g, '').replace(/,/g, '.');
        } else {
            // No separators or only one of them. 
            // If it's a single separator, it's ambiguous. 
            // In $1.000, it's thousand. In $1.5, it's decimal.
            // Rule of thumb: if 3 digits follow, it's likely thousand. 
            // But let's check length of decimals.
            const parts = clean.split(/[.,]/);
            if (parts.length > 1) {
                if (parts[1].length === 3) {
                    // Likely a thousand separator (1.000)
                    clean = clean.replace(/[.,]/g, '');
                } else {
                    // Likely a decimal (1.5 or 1,5)
                    clean = clean.replace(/[.,]/, '.');
                }
            }
        }

        const result = parseFloat(clean);
        return isNaN(result) ? 0 : result;
    }

    /**
     * Formats number back to standard reimbursement format (dots for thousands, comma for decimal if needed)
     */
    function formatCurrency(num) {
        // Use German locale as it uses . for thousands and , for decimals
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

        statusLabel.textContent = 'Uploading...';
        statusLabel.className = 'help has-text-info';

        const setSuccess = (url) => {
            imgInput.value = url;
            statusLabel.textContent = 'Upload Successful!';
            statusLabel.className = 'help has-text-success';
        };

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Data = reader.result.split(',')[1];

            // Strategy: Direct Base64 CORS Upload (Static Hosting Optimized)
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

                if (response.status === 403) {
                    throw new Error('IMGUR_REJECTED');
                }

                const result = await response.json();
                if (result.success) {
                    setSuccess(result.data.link);
                } else {
                    throw new Error(result.data?.error || 'Direct upload failed');
                }
            } catch (error) {
                console.error('Upload Error:', error.message);
                statusLabel.textContent = 'Upload Blocked!';
                statusLabel.className = 'help has-text-danger';

                if (error.message === 'IMGUR_REJECTED') {
                    alert('Imgur rejected the request (403). This usually means your Client-ID is restricted. Please click the Gear icon ⚙️ and try a DIFFERENT Client-ID.');
                } else {
                    alert('Upload failed. Possible causes: API Rate limits or slow connection. Please try again or paste a link manually.');
                }
            }
        };
        reader.onerror = () => {
            statusLabel.textContent = 'File Read Error!';
            statusLabel.className = 'help has-text-danger';
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

        const activityItems = document.querySelectorAll('.activity-item');
        let totalRefund = 0;
        let activitiesBB = '';

        activityItems.forEach((item) => {
            const desc = item.querySelector('.activity-desc').value;
            const refundStr = item.querySelector('.activity-refund').value;
            const img = item.querySelector('.activity-img').value;

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

        // Subject Generation: Subject : Reimbursement [Name] ([Period])
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

        // Update Forum Link with subject and message
        const forumUrl = new URL('https://news.san-andreas.net/posting.php');
        forumUrl.searchParams.set('mode', 'post');
        forumUrl.searchParams.set('f', '767');
        forumUrl.searchParams.set('subject', subject);
        forumUrl.searchParams.set('message', bbcode); // Primary
        forumUrl.searchParams.set('msg', bbcode);     // Common alternative

        forumPostLink.href = forumUrl.toString();

        resultCard.style.display = 'block';
        resultCard.scrollIntoView({ behavior: 'smooth' });
    }
});
