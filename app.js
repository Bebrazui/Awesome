// Telegram WebApp Design Guide Implementation
const tg = window.Telegram?.WebApp;

// Haptic feedback engine (Section 9 of Style Guide)
const Haptic = {
  tabChange: () => {
    try { tg?.HapticFeedback?.selectionChanged(); } catch (e) {}
  },
  tap: (style = 'light') => {
    try { tg?.HapticFeedback?.impactOccurred(style); } catch (e) {}
  },
  success: () => {
    try { tg?.HapticFeedback?.notificationOccurred('success'); } catch (e) {}
  },
  error: () => {
    try { tg?.HapticFeedback?.notificationOccurred('error'); } catch (e) {}
  }
};

// Toast notification helper
function showToast(text) {
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');
  if (!toast || !toastText) return;
  toastText.textContent = text;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Telegram WebApp environment (Section 4.1)
  if (tg) {
    try {
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#101924');
      tg.setBackgroundColor('#0d131a');

      // Personalize user details and avatar (from Telegram WebApp initDataUnsafe)
      const user = tg.initDataUnsafe?.user;
      if (user) {
        if (user.first_name) {
          const greetingEl = document.getElementById('user-greeting');
          if (greetingEl) {
            greetingEl.textContent = `Кошелек ${user.first_name}`;
          }
          const profileName = document.getElementById('profile-name');
          if (profileName) {
            profileName.textContent = user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name;
          }
        }
        if (user.username) {
          const profileHandle = document.getElementById('profile-handle');
          if (profileHandle) {
            profileHandle.textContent = `@${user.username}`;
          }
        }
        if (user.photo_url) {
          const heroAvatarImg = document.getElementById('user-avatar-img');
          const heroPlaceholder = document.getElementById('user-avatar-placeholder');
          if (heroAvatarImg && heroPlaceholder) {
            heroAvatarImg.src = user.photo_url;
            heroAvatarImg.style.display = 'block';
            heroPlaceholder.style.display = 'none';
          }
          const profileAvatarImg = document.getElementById('profile-avatar-img');
          const profilePlaceholder = document.getElementById('profile-avatar-placeholder');
          if (profileAvatarImg && profilePlaceholder) {
            profileAvatarImg.src = user.photo_url;
            profileAvatarImg.style.display = 'block';
            profilePlaceholder.style.display = 'none';
          }
        }
      }
    } catch (e) {
      console.warn('Telegram WebApp SDK init error:', e);
    }
  }

  // 2. Floating Navbar Tab Switching (Section 7)
  const tabButtons = document.querySelectorAll('.nav-tab-btn');
  const tabPanes = {
    agent: document.getElementById('tab-agent-content'),
    explore: document.getElementById('tab-explore-content'),
    generate: document.getElementById('tab-generate-content'),
    settings: document.getElementById('tab-settings-content')
  };

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      if (!tabPanes[tabId]) return;

      Haptic.tabChange();

      // Update active state on tab buttons
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update active tab pane
      Object.keys(tabPanes).forEach(id => {
        if (id === tabId) {
          tabPanes[id].style.display = 'block';
          tabPanes[id].classList.add('active');
        } else {
          tabPanes[id].style.display = 'none';
          tabPanes[id].classList.remove('active');
        }
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // 3. Action Prompt Cards Interaction (Section 5)
  document.querySelectorAll('.action-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      Haptic.tap('medium');
      const actionName = card.querySelector('.card-title')?.textContent || 'Действие';
      showToast(`Запущено: ${actionName}`);
    });
  });

  // 4. Model Selector Modal Bottom Sheet (Section 4.2)
  const modelBtn = document.getElementById('model-selector-btn');
  const modelModal = document.getElementById('model-modal');
  const modelNameLabel = document.getElementById('selected-model-name');
  const modelOptions = document.querySelectorAll('.sheet-option');

  if (modelBtn && modelModal) {
    modelBtn.addEventListener('click', () => {
      Haptic.tap('light');
      modelModal.classList.add('active');
    });

    modelModal.addEventListener('click', (e) => {
      if (e.target === modelModal || e.target.classList.contains('sheet-handle')) {
        modelModal.classList.remove('active');
      }
    });

    modelOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        const model = opt.getAttribute('data-model');
        modelOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        if (modelNameLabel) {
          modelNameLabel.textContent = model;
        }
        Haptic.success();
        modelModal.classList.remove('active');
        showToast(`Выбрана модель: ${model}`);
      });
    });
  }

  // 5. Deposit TON Button
  const proBtn = document.getElementById('pro-btn');
  if (proBtn) {
    proBtn.addEventListener('click', () => {
      Haptic.tap('heavy');
      showToast('💎 Адрес пополнения скопирован в буфер!');
    });
  }

  // 6. Arc Progress Widget (Section 8.1)
  const continueSetupBtn = document.getElementById('btn-continue-setup');
  const arcStepsLeft = document.getElementById('arc-steps-left');
  let currentSteps = 3;

  if (continueSetupBtn && arcStepsLeft) {
    continueSetupBtn.addEventListener('click', () => {
      if (currentSteps > 1) {
        currentSteps -= 1;
        arcStepsLeft.textContent = currentSteps;
        Haptic.success();
        showToast(`Шаг верификации пройден! Осталось: ${currentSteps}`);
      } else {
        arcStepsLeft.textContent = '✓';
        continueSetupBtn.textContent = 'Лимит $50,000 активен';
        continueSetupBtn.style.background = '#28c76f';
        Haptic.success();
        showToast('Максимальный лимит верификации получен!');
      }
    });
  }

  // 7. Quick Action Items
  document.querySelectorAll('.quick-action-item').forEach(item => {
    item.addEventListener('click', () => {
      Haptic.tap('light');
      const label = item.querySelector('.quick-action-label')?.textContent || '';
      showToast(`Операция: ${label}`);
    });
  });

  // 8. Promo Banner Close & Carousel Dots
  const promoClose = document.getElementById('promo-close-btn');
  const promoBanner = document.getElementById('promo-banner-card');
  if (promoClose && promoBanner) {
    promoClose.addEventListener('click', (e) => {
      e.stopPropagation();
      Haptic.tap('light');
      promoBanner.style.display = 'none';
    });
  }

  // 9. DEX Swap Logic
  const swapBtn = document.getElementById('generate-btn');
  const swapInput = document.getElementById('swap-input-amount');
  const swapOutput = document.getElementById('swap-output-amount');
  const swapBtnLabel = document.getElementById('swap-btn-label');
  const outputBox = document.getElementById('generation-output');
  const outputText = document.getElementById('output-text');
  const quickPairPills = document.querySelectorAll('.quick-prompt-pill');
  const swapReverseBtn = document.getElementById('swap-reverse-btn');
  const fromSymbolEl = document.getElementById('swap-from-symbol');
  const toSymbolEl = document.getElementById('swap-to-symbol');

  let currentRate = 5.62;
  let fromSymbol = 'TON';
  let toSymbol = 'USDT';

  function updateSwapCalculation() {
    const val = parseFloat(swapInput?.value || '0');
    if (swapOutput) {
      swapOutput.textContent = (val * currentRate).toFixed(2);
    }
    if (swapBtnLabel) {
      swapBtnLabel.textContent = `Обменять ${fromSymbol} на ${toSymbol}`;
    }
  }

  if (swapInput) {
    swapInput.addEventListener('input', updateSwapCalculation);
  }

  quickPairPills.forEach(pill => {
    pill.addEventListener('click', () => {
      Haptic.tap('light');
      const pair = pill.getAttribute('data-pair');
      if (pair === 'TON_USDT') {
        fromSymbol = 'TON'; toSymbol = 'USDT'; currentRate = 5.62;
      } else if (pair === 'USDT_TON') {
        fromSymbol = 'USDT'; toSymbol = 'TON'; currentRate = 0.178;
      } else if (pair === 'TON_NOT') {
        fromSymbol = 'TON'; toSymbol = 'NOT'; currentRate = 720.5;
      } else if (pair === 'TON_STARS') {
        fromSymbol = 'TON'; toSymbol = 'Stars'; currentRate = 350.0;
      }
      if (fromSymbolEl) fromSymbolEl.textContent = fromSymbol;
      if (toSymbolEl) toSymbolEl.textContent = toSymbol;
      updateSwapCalculation();
    });
  });

  if (swapReverseBtn) {
    swapReverseBtn.addEventListener('click', () => {
      Haptic.tap('medium');
      const temp = fromSymbol;
      fromSymbol = toSymbol;
      toSymbol = temp;
      currentRate = 1 / currentRate;
      if (fromSymbolEl) fromSymbolEl.textContent = fromSymbol;
      if (toSymbolEl) toSymbolEl.textContent = toSymbol;
      updateSwapCalculation();
    });
  }

  if (swapBtn && outputBox && outputText) {
    swapBtn.addEventListener('click', () => {
      const val = parseFloat(swapInput?.value || '0');
      if (val <= 0) {
        Haptic.error();
        showToast('Укажите сумму для обмена');
        return;
      }

      Haptic.tap('medium');
      swapBtn.disabled = true;
      swapBtn.style.opacity = '0.6';
      if (swapBtnLabel) swapBtnLabel.textContent = 'Маршрутизация DEX...';

      outputBox.style.display = 'block';
      outputBox.classList.add('visible');
      outputText.innerHTML = '<span style="color: var(--text-secondary);">Поиск лучшего пула ликвидности DeDust / STON.fi...</span>';

      setTimeout(() => {
        Haptic.success();
        swapBtn.disabled = false;
        swapBtn.style.opacity = '1';
        if (swapBtnLabel) swapBtnLabel.textContent = `Обменять ${fromSymbol} на ${toSymbol}`;

        const received = (val * currentRate).toFixed(2);
        const txHash = '0x' + Math.random().toString(16).substring(2, 10) + '...' + Math.random().toString(16).substring(2, 6);
        outputText.innerHTML = `✅ <b>Успешно обменяно:</b> ${val} ${fromSymbol} → <b>${received} ${toSymbol}</b><br><span style="color: var(--text-secondary); font-size: 11px;">TX Hash: ${txHash} • Сетевой сбор: 0.00 TON (Gasless)</span>`;
        showToast(`Обмен завершен: +${received} ${toSymbol}!`);
      }, 600);
    });
  }

  // 10. Settings toggles and items
  const digestToggle = document.getElementById('digest-toggle');
  if (digestToggle) {
    digestToggle.addEventListener('change', () => {
      Haptic.tap('medium');
      showToast(digestToggle.checked ? 'Дайджест включен (09:00)' : 'Дайджест отключен');
    });
  }

  document.querySelectorAll('.group-item[data-setting]').forEach(item => {
    item.addEventListener('click', () => {
      Haptic.tap('light');
      const title = item.querySelector('.group-item-title')?.textContent || '';
      showToast(`Настройка: ${title}`);
    });
  });
});
