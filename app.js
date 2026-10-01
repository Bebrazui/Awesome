// Aether — Minimalist Solar Orange VPN Controller
// Strictly complies with C:\TMA_Design_Guide\README.md

(function () {
  'use strict';

  // 1. Telegram WebApp Integration
  const tg = window.Telegram?.WebApp;

  if (tg) {
    try {
      tg.ready();
      tg.expand();
      if (typeof tg.setHeaderColor === 'function') {
        tg.setHeaderColor('#100d0a');
      }
      if (typeof tg.setBackgroundColor === 'function') {
        tg.setBackgroundColor('#070708');
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
    }, 2200);
  }

  // 5. Power Dial Toggle
  let isConnected = true;
  const powerBtn = document.getElementById('power-toggle-btn');
  const dialCaption = document.getElementById('dial-caption');
  const heroStateTitle = document.getElementById('hero-state-title');
  const heroStateSub = document.getElementById('hero-state-sub');
  const currentPing = document.getElementById('current-ping');

  function updatePowerState() {
    if (isConnected) {
      powerBtn.classList.remove('disconnected');
      powerBtn.classList.add('active');
      dialCaption.textContent = 'ON';
      heroStateTitle.textContent = 'Защищено';
      heroStateSub.textContent = 'VLESS Reality • Стокгольм, Швеция';
      currentPing.textContent = '14 ms';
    } else {
      powerBtn.classList.remove('active');
      powerBtn.classList.add('disconnected');
      dialCaption.textContent = 'OFF';
      heroStateTitle.textContent = 'Отключено';
      heroStateSub.textContent = 'Трафик не зашифрован';
      currentPing.textContent = '-- ms';
    }
  }

  if (powerBtn) {
    powerBtn.addEventListener('click', function () {
      Haptic.tap('heavy');
      isConnected = !isConnected;
      updatePowerState();
      if (isConnected) {
        showToast('Туннель активен (14 ms)');
      } else {
        showToast('Туннель отключен');
      }
    });
  }

  // 6. Navigation Tabs
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

  const selectNodeCard = document.getElementById('select-node-card');
  if (selectNodeCard) {
    selectNodeCard.addEventListener('click', function () {
      switchTab('servers');
    });
  }

  // 7. Node Selection in Servers Tab
  const nodeItems = document.querySelectorAll('.node-item');
  const selectedNodeName = document.getElementById('selected-node-name');
  const selectedNodePing = document.getElementById('selected-node-ping');

  nodeItems.forEach(function (item) {
    item.addEventListener('click', function () {
      Haptic.tap('medium');
      nodeItems.forEach(function (i) {
        i.classList.remove('selected');
      });
      item.classList.add('selected');

      const name = item.getAttribute('data-name');
      const ping = item.getAttribute('data-ping');

      if (selectedNodeName) selectedNodeName.textContent = name;
      if (selectedNodePing) selectedNodePing.textContent = ping;
      if (currentPing) currentPing.textContent = ping;
      if (heroStateSub && isConnected) {
        heroStateSub.textContent = 'VLESS Reality • ' + name;
      }

      showToast('Узел выбран: ' + name);
      switchTab('connect');
    });
  });

  // 8. Copy Config Link
  const vlessLink = 'vless://aether-solar-node@se.aether.cloud:443?encryption=none&security=reality&sni=se.aether.cloud&fp=chrome&type=grpc#Aether-Solar-10G';
  const copyBtn = document.getElementById('btn-copy-vless');

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      Haptic.tap('medium');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(vlessLink).then(function () {
          showToast('VLESS ключ скопирован для Happ');
        }).catch(function () {
          showToast('VLESS ключ скопирован');
        });
      } else {
        showToast('VLESS ключ скопирован');
      }
    });
  }

  // 9. Ping refresh
  const pingBtn = document.getElementById('ping-refresh-btn');
  if (pingBtn) {
    pingBtn.addEventListener('click', function () {
      Haptic.tap('light');
      const p = Math.floor(Math.random() * 4) + 12;
      currentPing.textContent = p + ' ms';
      if (selectedNodePing) selectedNodePing.textContent = p + ' ms';
      showToast('Пинг: ' + p + ' ms');
    });
  }

  syncUserProfile();
})();
