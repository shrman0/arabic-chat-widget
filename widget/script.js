savedBodyStyles = {
            overflow: document.body.style.overflow,
            touchAction: document.body.style.touchAction,
            position: document.body.style.position,
            top: document.body.style.top,
            left: document.body.style.left,
            right: document.body.style.right,
            width: document.body.style.width,
            height: document.body.style.height,
        };
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${_savedScrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.documentElement.style.overflow = 'hidden';

        // Block touchmove on document (non-passive) except inside chat widget
        _blockDocTouch = function(e) {
            const widget = El.container;
            if (widget && widget.contains(e.target)) return;
            e.preventDefault();
        };
        document.addEventListener('touchmove', _blockDocTouch, { passive: false });

        // Handle touch inside widget — allow only in scrollable areas
        if (El.container) {
            El.container.__handleTouchStart = function(e) {
                const scrollable = e.target.closest('.chat-widget-messages');
                if (scrollable && e.touches.length === 1) {
                    scrollable.__touchStartY = e.touches[0].clientY;
                }
            };
            El.container.__handleTouchMove = function(e) {
                const scrollable = e.target.closest('.chat-widget-messages');
                if (!scrollable) { e.preventDefault(); return; }
                const { scrollTop, scrollHeight, clientHeight } = scrollable;
                const isScrollable = scrollHeight > clientHeight;
                if (!isScrollable) { e.preventDefault(); return; }
                if (e.touches.length === 1) {
                    const startY = scrollable.__touchStartY;
                    if (startY !== undefined) {
                        const deltaY = startY - e.touches[0].clientY;
                        const atTop = scrollTop <= 0;
                        const atBottom = scrollTop + clientHeight >= scrollHeight;
                        if ((atTop && deltaY < 0) || (atBottom && deltaY > 0)) {
                            e.preventDefault();
                        }
                    }
                }
            };
            El.container.addEventListener('touchstart', El.container.__handleTouchStart, { passive: true });
            El.container.addEventListener('touchmove', El.container.__handleTouchMove, { passive: false });
        }
    }

    function unlockBodyScroll() {
        if (_blockDocTouch) {
            document.removeEventListener('touchmove', _blockDocTouch);
            _blockDocTouch = null;
        }
        if (El.container) {
            if (El.container.__handleTouchStart) El.container.removeEventListener('touchstart', El.container.__handleTouchStart);
            if (El.container.__handleTouchMove) El.container.removeEventListener('touchmove', El.container.__handleTouchMove);
        }
        Object.keys(_savedBodyStyles).forEach(key => {
            document.body.style[key] = _savedBodyStyles[key] || '';
        });
        document.documentElement.style.overflow = '';
        window.scrollTo(0, _savedScrollY);
    }

    function showWidget() {
        State.isWidgetOpen = true;
        El.container.style.display = 'block';
        if (El.triggerBtn) El.triggerBtn.style.display = 'none';
        lockBodyScroll();
    }

    function hideWidget() {
        State.isWidgetOpen = false;
        El.container.style.display = 'none';
        if (El.triggerBtn) El.triggerBtn.style.display = 'flex';
        unlockBodyScroll();
    }

    function toggleWidget() {
        State.isWidgetOpen ? hideWidget() : showWidget();
    }

    // ========================================
    // Modal
    // ========================================
    function openModal() { El.modal.style.display = 'flex'; }
    function closeModal() { El.modal.style.display = 'none'; }

    // ========================================
    // Messaging
    // ========================================
    function handleSend(e) {
        e.preventDefault();
        const text = El.msgInput.value.trim();
        const attachment = State.currentAttachment;
        if (!text && !attachment) return;

        const msg = { id: Date.now(), text, sender: 'customer', attachment, timestamp: new Date() };
        State.messages.push(msg);
        renderMessage(msg);

        El.msgInput.value = '';
        removeAttachment();
        updateSendBtn();
        if (El.emptyState) El.emptyState.style.display = 'none';

        simulateResponse(attachment);
    }

    function simulateResponse(hasAttachment) {
        State.isTyping = true;
        renderTyping();
        setInputDisabled(true);

        setTimeout(() => {
            State.isTyping = false;
            removeTypingEl();
            setInputDisabled(false);

            const text = hasAttachment
                ? 'شكراً لإرسال الملف! سنقوم بمراجعته والرد عليك قريباً.'
                : 'شكراً لتواصلك معنا! كيف يمكنني مساعدتك اليوم؟';

            const msg = { id: Date.now(), text, sender: 'store', timestamp: new Date() };
            State.messages.push(msg);
            renderMessage(msg);
            El.msgInput.focus();

            if (CONFIG.apiEndpoint) sendToAPI(State.messages[State.messages.length - 2]);
        }, CONFIG.responseDelay);
    }

    // ========================================
    // Rendering
    // ========================================
    function renderMessage(msg) {
        const isStore = msg.sender === 'store';
        const timeStr = msg.timestamp
            ? msg.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
            : '';

        const wrapper = document.createElement('div');
        wrapper.className = `chat-widget-message ${msg.sender}`;

        let html = '';

        if (isStore) {
            html += `<img src="${CONFIG.storeLogo}" alt="Store" class="chat-widget-message-avatar">`;
        }

        html += '<div class="chat-widget-message-content">';
        html += '<div class="chat-widget-message-bubble">';

        if (msg.attachment) {
            if (msg.attachment.type === 'image') {
                html += `<div class="chat-widget-message-attachment">
                    <img src="${msg.attachment.url}" alt="${escapeHtml(msg.attachment.name)}">
                </div>`;
            } else {
                html += `<div class="chat-widget-message-file">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        <polyline points="13 2 13 9 20 9"></polyline>
                    </svg>
                    <div class="chat-widget-message-file-info">
                        <div class="chat-widget-message-file-name">${escapeHtml(msg.attachment.name)}</div>
                        ${msg.attachment.size ? `<div class="chat-widget-message-file-size">${formatSize(msg.attachment.size)}</div>` : ''}
                    </div>
                    <a href="${msg.attachment.url}" download="${escapeHtml(msg.attachment.name)}" class="chat-widget-message-file-download">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                    </a>
                </div>`;
            }
        }

        if (msg.text) {
            html += `<span>${escapeHtml(msg.text)}</span>`;
        }

        html += '</div>'; // bubble

        if (timeStr) {
            html += `<span class="chat-widget-message-time">${timeStr}</span>`;
        }

        html += '</div>'; // content

        wrapper.innerHTML = html;
        El.messages.appendChild(wrapper);
        scrollToBottom();
        setTimeout(scrollToBottom, 150);
    }

    function renderTyping() {
        const div = document.createElement('div');
        div.className = 'chat-widget-typing';
        div.id = 'typing-indicator';
        div.innerHTML = `
            <img src="${CONFIG.storeLogo}" alt="Store" class="chat-widget-typing-avatar">
            <div class="chat-widget-typing-bubble">
                <div class="chat-widget-typing-dot"></div>
                <div class="chat-widget-typing-dot"></div>
                <div class="chat-widget-typing-dot"></div>
            </div>`;
        El.messages.appendChild(div);
        scrollToBottom();
    }

    function removeTypingEl() {
        const el = document.getElementById('typing-indicator');
        if (el) el.remove();
    }

    // ========================================
    // Auto-scroll (to bottom of messages)
    // ========================================
    function scrollToBottom() {
        if (!El.messages) return;
        El.messages.scrollTop = El.messages.scrollHeight;
        requestAnimationFrame(() => {
            El.messages.scrollTop = El.messages.scrollHeight;
        });
        setTimeout(() => {
            El.messages.scrollTop = El.messages.scrollHeight;
        }, 200);
    }

    // ========================================
    // Input management
    // ========================================
    function updateSendBtn() {
        const hasText = El.msgInput.value.trim().length > 0;
        const hasAtt  = State.currentAttachment !== null;
        El.sendBtn.disabled = !hasText && !hasAtt;
    }

    function setInputDisabled(disabled) {
        El.msgInput.disabled = disabled;
        El.attachBtn.disabled = disabled;
        El.sendBtn.disabled = disabled;
        El.msgInput.placeholder = disabled ? 'جاري الكتابة...' : 'اكتب رسالتك...';
    }

    // ========================================
    // File attachment
    // ========================================
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        const url  = URL.createObjectURL(file);
        const type = file.type.startsWith('image/') ? 'image' : 'file';
        State.currentAttachment = { type, url, name: file.name, size: file.size };
        renderAttachmentPreview(State.currentAttachment);
        updateSendBtn();
    }

    function renderAttachmentPreview(att) {
        let html = '';
        if (att.type === 'image') {
            html = `<img src="${att.url}" alt="${escapeHtml(att.name)}"
                        style="width:44px;height:44px;border-radius:8px;object-fit:cover;flex-shrink:0;">
                    <div style="flex:1;min-width:0;">
                        <div class="chat-widget-attachment-name">${escapeHtml(att.name)}</div>
                    </div>`;
        } else {
            html = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" style="flex-shrink:0;">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        <polyline points="13 2 13 9 20 9"></polyline>
                    </svg>
                    <div style="flex:1;min-width:0;">
                        <div class="chat-widget-attachment-name">${escapeHtml(att.name)}</div>
                        <div class="chat-widget-attachment-size">${formatSize(att.size)}</div>
                    </div>`;
        }
        El.attachInfo.innerHTML = html;
        El.attachPreview.style.display = 'block';
    }

    function removeAttachment() {
        State.currentAttachment = null;
        El.attachPreview.style.display = 'none';
        El.attachInfo.innerHTML = '';
        El.fileInput.value = '';
        updateSendBtn();
    }

    // ========================================
    // Rating screen
    // ========================================
    function showRatingScreen() { El.ratingScreen.style.display = 'flex'; }

    function hideRatingScreen() {
        El.ratingScreen.style.display = 'none';
        El.thankYou.style.display = 'none';
        El.ratingContent.style.display = 'block';
        State.currentRating = 0;
        updateStars(0);
        El.ratingFeedback.value = '';
        El.submitRating.disabled = true;
    }

    function handleConfirmClose() {
        closeModal();
        showRatingScreen();
    }

    function handleStarClick(e) {
        const star = e.target.closest('.chat-widget-star');
        if (!star) return;
        State.currentRating = parseInt(star.dataset.rating);
        updateStars(State.currentRating);
        El.submitRating.disabled = false;
    }

    function updateStars(rating) {
        El.ratingStars.querySelectorAll('.chat-widget-star').forEach((s, i) => {
            s.classList.toggle('active', i < rating);
        });
    }

    function handleSubmitRating() {
        El.ratingContent.style.display = 'none';
        El.thankYou.style.display = 'block';
        if (CONFIG.apiEndpoint) sendRatingToAPI(State.currentRating, El.ratingFeedback.value.trim());
        setTimeout(() => { hideRatingScreen(); }, 2000);
    }

    // ========================================
    // Ticket screen
    // ========================================
    function showTicketScreen() {
        El.ticketNumber.textContent = State.ticketId;
        El.ticketScreen.style.display = 'flex';
    }

    function hideTicketScreen() {
        El.ticketScreen.style.display = 'none';
    }

    function handleConvertToTicket() {
        closeModal();
        showTicketScreen();
        if (CONFIG.apiEndpoint) convertToTicketAPI();
    }

    function handleTicketClose() {
        hideTicketScreen();
        hideWidget();
        State.messages = [];
        El.messages.innerHTML = '';
        if (El.emptyState) El.emptyState.style.display = 'flex';
    }

    function handleTicketBack() {
        hideTicketScreen();
    }

    // ========================================
    // Download conversation
    // ========================================
    function handleDownload() {
        const lines = State.messages.map(m => {
            const sender = m.sender === 'store' ? CONFIG.storeName : 'العميل';
            const time   = m.timestamp ? m.timestamp.toLocaleTimeString('ar-SA') : '';
            return `[${time}] ${sender}: ${m.text || '[مرفق]'}`;
        });
        const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url;
        a.download = `محادثة-${CONFIG.storeName}-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ========================================
    // API integration stubs
    // ========================================
    function sendToAPI(message) {
        if (!CONFIG.apiEndpoint) return;
        fetch(CONFIG.apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${CONFIG.apiKey}` },
            body: JSON.stringify({ message: message.text, attachment: message.attachment, timestamp: message.timestamp }),
        }).catch(console.error);
    }

    function sendRatingToAPI(rating, feedback) {
        if (!CONFIG.apiEndpoint) return;
        fetch(`${CONFIG.apiEndpoint}/rating`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${CONFIG.apiKey}` },
            body: JSON.stringify({ rating, feedback, timestamp: new Date() }),
        }).catch(console.error);
    }

    function convertToTicketAPI() {
        if (!CONFIG.apiEndpoint) return;
        fetch(`${CONFIG.apiEndpoint}/ticket`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${CONFIG.apiKey}` },
            body: JSON.stringify({
                ticketId: State.ticketId,
                messages: State.messages,
                timestamp: new Date(),
            }),
        }).catch(console.error);
    }

    // ========================================
    // Utilities
    // ========================================
    function generateTicketId() {
        return '#TKT-' + Math.floor(10000 + Math.random() * 90000);
    }

    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        return (bytes / 1024).toFixed(1) + ' KB';
    }

    function escapeHtml(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    // ========================================
    // Public API (backend integration)
    // ========================================
    window.ChatWidget = {
        /** Set active theme by id: 'white'|'black'|'gold'|'sky'|'navy'|'red'|'whatsapp' */
        setTheme(themeId) { applyTheme(themeId); },

        /** Configure store info from backend */
        setStoreInfo(name, logo) {
            CONFIG.storeName = name;
            CONFIG.storeLogo = logo;
            document.getElementById('store-name').textContent = name;
            document.getElementById('store-logo').src = logo;
            document.getElementById('rating-store-name').textContent = name;
        },

        /** Connect to backend API */
        setAPI(endpoint, apiKey) {
            CONFIG.apiEndpoint = endpoint;
            CONFIG.apiKey = apiKey;
        },

        /** Open / close / toggle */
        open:   showWidget,
        close:  hideWidget,
        toggle: toggleWidget,

        /** Data access */
        getMessages: () => State.messages,
        getThemes:   () => Object.keys(THEMES),
        clearMessages() {
            State.messages = [];
            El.messages.innerHTML = '';
            if (El.emptyState) El.emptyState.style.display = 'flex';
        },

        /** Programmatically convert conversation to ticket */
        convertToTicket: handleConvertToTicket,
    };

    // ========================================
    // Boot
    // ========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();