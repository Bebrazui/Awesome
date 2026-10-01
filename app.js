// GhostNet — Stealth Mesh VPN & Proxy Hub JavaScript Controller
// Strictly complies with C:\TMA_Design_Guide\README.md (Sections 4, 7, 9)

(function () {
  'use strict';

  // 1. Telegram WebApp Integration
  const tg = window.Telegram?.WebApp;

  if (tg) {
    try {
      tg.ready();
      tg.expand();
      if (typeof tg.setHeaderColor === 'function') {
        tg.setHeaderColor('#0b1424');
      }
      if (typeof tg.setBackgroundColor === 'function') {
        tg.setBackgroundColor('#06090f');
      }
    } catch (e) {
      console.warn('Telegram WebApp setup error:', e);
    }
  }

  // 2. Haptic Feedback Utility (Section 9)
  const Haptic = {
    tap: function (style) {
      try {
        tg?.HapticFeedback?.impactOccurred(style || 'light');
      } catch (e) {}
    },
    success: function () {
      try {
        tg?.HapticFeedback?.notificationOccurred('success');
      } catch (e) {}
    },
    tabChange: function () {
      try {
        tg?.HapticFeedback?.selectionChanged();
      } catch (e) {}
    }
  };

  // 3. User Avatar and Name Synchronization
  function syncUserProfile() {
    const user = tg?.initDataUnsafe?.user;
    const nameEl = document.getElementById('user-display-name');
    const avatarEl = document.getElementById('nav-user-avatar');

    if (user && user.first_name) {
      if (nameEl) nameEl.textContent = user.first_name;
    }

    if (user && user.photo_url) {
      if (avatarEl) avatarEl.src = user.photo_url;
    }
  }

  // 4. Toast Notification
  function showToast(msg) {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');
    if (!toast || !toastText) return;

    toastText.textContent = msg;
    toast.classList.add('show');
    Haptic.success();

    setTimeout(function () {
      toast.classList.remove('show');
    }, 2400);
  }

  // 5. Power Toggle State (Connected / Disconnected)
  let isConnected = true;
  const powerBtn = document.getElementById('power-toggle-btn');
  const statusLabel = document.getElementById('status-label-text');
  const statusIp = document.getElementById('status-ip-text');
  const metricSpeed = document.getElementById('metric-speed');
  const metricPingVal = document.getElementById('metric-ping-val');
  const currentPing = document.getElementById('current-ping');

  function updatePowerState() {
    if (isConnected) {
      powerBtn.classList.remove('disconnected');
      powerBtn.classList.add('active');
      statusLabel.innerHTML = '<span class="status-dot-active"></span><span>ЗАЩИЩЕНО • VLESS REALITY</span>';
      statusLabel.style.color = '#22c55e';
      statusIp.textContent = '185.220.101.45 • Стокгольм, Швеция';
      metricSpeed.textContent = '980';
      metricPingVal.textContent = '14';
      currentPing.textContent = '14 ms';
    } else {
      powerBtn.classList.remove('active');
      powerBtn.classList.add('disconnected');
      statusLabel.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:#ef4444;display:inline-block;"></span><span>ОТКЛЮЧЕНО</span>';
      statusLabel.style.color = '#ef4444';
      statusIp.textContent = 'Трафик не защищен • Нажмите для подключения';
      metricSpeed.textContent = '0';
      metricPingVal.textContent = '--';
      currentPing.textContent = '-- ms';
    }
  }

  if (powerBtn) {
    powerBtn.addEventListener('click', function () {
      Haptic.tap('heavy');
      isConnected = !isConnected;
      updatePowerState();
      if (isConnected) {
        showToast('Подключено к Стокгольм (14 ms)');
      } else {
        showToast('Защита отключена');
      }
    });
  }

  // 6. Node Selection Logic
  const nodeRows = document.querySelectorAll('.node-row');
  nodeRows.forEach(function (row) {
    row.addEventListener('click', function () {
      Haptic.tap('medium');
      nodeRows.forEach(function (r) {
        r.classList.remove('selected');
        const radio = r.querySelector('.node-radio-active, .node-radio');
        if (radio) {
          radio.className = 'node-radio';
        }
      });
      row.classList.add('selected');
      const radio = row.querySelector('.node-radio');
      if (radio) {
        radio.className = 'node-radio-active';
      }

      const nodeName = row.querySelector('.node-title')?.textContent || 'Сервер';
      const nodePing = row.querySelector('.node-ping-tag')?.textContent || '14 ms';
      
      if (statusIp) {
        statusIp.textContent = '185.220.101.45 • ' + nodeName;
      }
      if (currentPing) {
        currentPing.textContent = nodePing;
      }
      if (metricPingVal) {
        metricPingVal.textContent = parseInt(nodePing, 10) || 14;
      }

      showToast('Выбран узел: ' + nodeName);
    });
  });

  // 7. Clipboard Copy Logic
  const vlessConfig = 'vless://ghostnet-ultra-node@se.ghostnet.cloud:443?encryption=none&security=reality&sni=se.ghostnet.cloud&fp=chrome&type=grpc#GhostNet-Sweden-10G';

  function copyToClipboard(text, msg) {
    Haptic.tap('medium');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast(msg || 'Скопировано в буфер!');
      }).catch(function () {
        showToast(msg || 'Скопировано!');
      });
    } else {
      showToast(msg || 'Скопировано!');
    }
  }

  const copyVlessBtn = document.getElementById('btn-copy-vless');
  if (copyVlessBtn) {
    copyVlessBtn.addEventListener('click', function () {
      copyToClipboard(vlessConfig, 'Ключ VLESS скопирован для Happ');
    });
  }

  // 8. QR Code Modal
  const qrModal = document.getElementById('qr-modal');
  const showQrBtn = document.getElementById('btn-show-qr');
  const closeQrBtn = document.getElementById('close-qr-btn');
  const copyInsideModalBtn = document.getElementById('copy-link-inside-modal');

  if (showQrBtn && qrModal) {
    showQrBtn.addEventListener('click', function () {
      Haptic.tap('medium');
      qrModal.classList.add('open');
    });
  }

  if (closeQrBtn && qrModal) {
    closeQrBtn.addEventListener('click', function () {
      Haptic.tap('light');
      qrModal.classList.remove('open');
    });
  }

  if (qrModal) {
    qrModal.addEventListener('click', function (e) {
      if (e.target === qrModal) {
        qrModal.classList.remove('open');
      }
    });
  }

  if (copyInsideModalBtn) {
    copyInsideModalBtn.addEventListener('click', function () {
      copyToClipboard(vlessConfig, 'Строка подключения скопирована');
      qrModal?.classList.remove('open');
    });
  }

  // 9. Floating Island Tab Navigation (Section 7)
  const tabButtons = document.querySelectorAll('.nav-tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  function switchTab(targetTabId) {
    Haptic.tabChange();

    tabButtons.forEach(function (btn) {
      if (btn.getAttribute('data-tab') === targetTabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    tabPanes.forEach(function (pane) {
      if (pane.id === 'tab-' + targetTabId + '-content') {
        pane.style.display = 'block';
      } else {
        pane.style.display = 'none';
      }
    });
  }

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  const viewAllNodesBtn = document.getElementById('view-all-nodes-btn');
  if (viewAllNodesBtn) {
    viewAllNodesBtn.addEventListener('click', function () {
      switchTab('servers');
    });
  }

  // 10. Ping refresh button
  const pingRefreshBtn = document.getElementById('ping-refresh-btn');
  if (pingRefreshBtn) {
    pingRefreshBtn.addEventListener('click', function () {
      Haptic.tap('light');
      const p = Math.floor(Math.random() * 5) + 12;
      currentPing.textContent = p + ' ms';
      metricPingVal.textContent = p;
      showToast('Пинг обновлен: ' + p + ' ms');
    });
  }

  // 11. Initial execution
  syncUserProfile();
})();
