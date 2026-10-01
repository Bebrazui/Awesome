// Aether — Industrial Network Instrument Controller
// Grounded in real utility, honest interaction, and tactile feedback

(function () {
  'use strict';

  // 1. Telegram WebApp Integration
  const tg = window.Telegram?.WebApp;

  if (tg) {
    try {
      tg.ready();
      tg.expand();
      if (typeof tg.setHeaderColor === 'function') {
        tg.setHeaderColor('#0e0f12');
      }
      if (typeof tg.setBackgroundColor === 'function') {
        tg.setBackgroundColor('#08080a');
      }
    } catch (e) {
      console.warn('Telegram WebApp setup error:', e);
    }
  }

  // 2. Haptic Feedback Utility
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

  // 3. User Avatar and Name Sync
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
    }, 2000);
  }

  // 5. Hardware Switch Controller
  let isConnected = true;
  const powerBtn = document.getElementById('power-toggle-btn');
  const knobText = document.getElementById('knob-text');
  const consoleTitle = document.getElementById('console-title');
  const consoleSub = document.getElementById('console-sub');
  const headerStatus = document.getElementById('header-status');
  const currentIp = document.getElementById('current-ip');
  const currentPing = document.getElementById('current-ping');

  function updateSwitchState() {
    if (isConnected) {
      powerBtn.classList.remove('disconnected');
      powerBtn.classList.add('active');
      knobText.textContent = 'ON';
      consoleTitle.textContent = 'Защита активна';
      consoleSub.textContent = 'Трафик направлен через ' + (activeCityName || 'Стокгольм');
      headerStatus.textContent = 'Подключено';
      headerStatus.style.color = 'var(--safety-orange)';
      currentIp.textContent = activeIp || '185.220.101.45';
      currentPing.textContent = activePingVal || '14';
    } else {
      powerBtn.classList.remove('active');
      powerBtn.classList.add('disconnected');
      knobText.textContent = 'OFF';
      consoleTitle.textContent = 'Защита отключена';
      consoleSub.textContent = 'Прямое соединение без шифрования';
      headerStatus.textContent = 'Отключено';
      headerStatus.style.color = 'var(--text-muted)';
      currentIp.textContent = 'Скрыт';
      currentPing.textContent = '--';
    }
  }

  if (powerBtn) {
    powerBtn.addEventListener('click', function () {
      Haptic.tap('heavy');
      isConnected = !isConnected;
      updateSwitchState();
      showToast(isConnected ? 'Узел подключен' : 'Узел отключен');
    });
  }

  // 6. Navigation Tabs
  const tabButtons = document.querySelectorAll('.dock-btn');
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

  const activeServerCard = document.getElementById('active-server-card');
  if (activeServerCard) {
    activeServerCard.addEventListener('click', function () {
      switchTab('servers');
    });
  }

  // 7. Server Selection Table
  let activeCityName = 'Стокгольм';
  let activeIp = '185.220.101.45';
  let activePingVal = '14';

  const serverRows = document.querySelectorAll('.server-row');
  const selectedNodeName = document.getElementById('selected-node-name');
  const selectedNodePing = document.getElementById('selected-node-ping');

  serverRows.forEach(function (row) {
    row.addEventListener('click', function () {
      Haptic.tap('medium');
      serverRows.forEach(function (r) {
        r.classList.remove('selected');
      });
      row.classList.add('selected');

      const name = row.getAttribute('data-name');
      const ping = row.getAttribute('data-ping');
      const ip = row.getAttribute('data-ip');

      activeCityName = name.split(',')[1]?.trim() || name;
      activeIp = ip;
      activePingVal = parseInt(ping, 10) || 14;

      if (selectedNodeName) selectedNodeName.textContent = name;
      if (selectedNodePing) selectedNodePing.textContent = ping;
      if (currentPing && isConnected) currentPing.textContent = activePingVal;
      if (currentIp && isConnected) currentIp.textContent = activeIp;
      if (consoleSub && isConnected) {
        consoleSub.textContent = 'Трафик направлен через ' + activeCityName;
      }

      showToast('Выбран: ' + name);
      switchTab('connect');
    });
  });

  // 8. Copy Key CTA
  const vlessKey = 'vless://aether-ultra-node@se.aether.cloud:443?encryption=none&security=reality&sni=se.aether.cloud&fp=chrome&type=grpc#Aether-Stockholm';
  const copyBtn = document.getElementById('btn-copy-vless');

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      Haptic.tap('medium');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(vlessKey).then(function () {
          showToast('Ключ VLESS скопирован');
        }).catch(function () {
          showToast('Ключ скопирован');
        });
      } else {
        showToast('Ключ скопирован');
      }
    });
  }

  // 9. Ping refresh
  const pingBtn = document.getElementById('ping-refresh-btn');
  if (pingBtn) {
    pingBtn.addEventListener('click', function () {
      Haptic.tap('light');
      const p = Math.floor(Math.random() * 3) + 13;
      activePingVal = p;
      if (isConnected) currentPing.textContent = p;
      if (selectedNodePing) selectedNodePing.textContent = p + ' мс';
      showToast('Пинг: ' + p + ' мс');
    });
  }

  syncUserProfile();
})();
