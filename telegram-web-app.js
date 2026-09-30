// Telegram WebApp Mock & Bridge for browser and native client
(function() {
  if (!window.Telegram) window.Telegram = {};
  if (!window.Telegram.WebApp) {
    var WebApp = {
      initData: "",
      initDataUnsafe: { user: { first_name: "Пользователь", username: "user" } },
      version: "7.0",
      platform: "unknown",
      colorScheme: "dark",
      themeParams: {
        bg_color: "#0d131a",
        text_color: "#ffffff",
        hint_color: "#94a3b8",
        link_color: "#2ea5ff",
        button_color: "#2ea5ff",
        button_text_color: "#ffffff",
        secondary_bg_color: "#17202b"
      },
      isExpanded: true,
      viewportHeight: window.innerHeight,
      viewportStableHeight: window.innerHeight,
      headerColor: "#101924",
      backgroundColor: "#0d131a",
      isClosingConfirmationEnabled: false,
      HapticFeedback: {
        impactOccurred: function(style) { console.debug("[Haptic impact]", style); },
        notificationOccurred: function(type) { console.debug("[Haptic notification]", type); },
        selectionChanged: function() { console.debug("[Haptic selectionChanged]"); }
      },
      ready: function() {},
      expand: function() {},
      close: function() {},
      setHeaderColor: function(c) { this.headerColor = c; },
      setBackgroundColor: function(c) { this.backgroundColor = c; }
    };
    window.Telegram.WebApp = WebApp;
  }
})();
