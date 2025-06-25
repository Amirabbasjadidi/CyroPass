const clickSound = new Audio("assets/sound/click.mp3");
document.getElementById("generate").addEventListener("click", () => {
  clickSound.currentTime = 0;
  clickSound.play();
  const length = parseInt(document.getElementById("length").value, 10);
  const regexInput = document.getElementById("regex").value;
  const passwordField = document.getElementById("password");
  const ambiguous = document.getElementById("Ambiguous").checked;

  try {
    let charset = buildCharsetFromRegex(regexInput);

    if (!charset) {
      throw new Error("Empty charset");
    }

    if (!ambiguous) {
      const ambiguousChars = "Il1O0";
      charset = charset.split('').filter(ch => !ambiguousChars.includes(ch)).join('');
    }

    let password = "";
    const charsetLength = charset.length;
    const randomArray = new Uint32Array(length);
    window.crypto.getRandomValues(randomArray);

    for (let i = 0; i < length; i++) {
      const randIndex = randomArray[i] % charsetLength;
      password += charset[randIndex];
    }

    passwordField.value = password;

  } catch (e) {
    passwordField.value = "Invalid Characters!";
    console.error("Regex error:", e.message);
  }
});

function buildCharsetFromRegex(input) {
  let charset = "";

  if (input.includes("\\w")) charset += "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";
  if (input.includes("\\d")) charset += "0123456789";
  if (input.includes("\\sym")) charset += "!@#$%^&*()_+[]{}|;:,.<>?/`~";
  if (input.includes("?")) charset += "?";
  if (input.includes("-")) charset += "-";

  const bracketMatches = input.match(/\[(.*?)\]/g);
  if (bracketMatches) {
    bracketMatches.forEach(match => {
      const inner = expandRanges(match.replace(/[\[\]\\]/g, ""));
      charset += inner;
    });
  }

  return [...new Set(charset)].join('');
}

function expandRanges(input) {
  return input.replace(/([a-zA-Z0-9])\-([a-zA-Z0-9])/g, (_, start, end) => {
    let range = "";
    for (let i = start.charCodeAt(0); i <= end.charCodeAt(0); i++) {
      range += String.fromCharCode(i);
    }
    return range;
  });
}

document.getElementById("password").addEventListener("click", () => {
  const passwordField = document.getElementById("password");
  const password = passwordField.value;

  if (!password) return;

  navigator.clipboard.writeText(password).then(() => {
    showCopiedTooltip(passwordField);
  }).catch(err => {
    console.error("Failed to copy!", err);
  });
});

function showCopiedTooltip() {
  const tooltip = document.createElement("div");
  tooltip.textContent = "Copied!";
  tooltip.style.position = "fixed";
  tooltip.style.background = "#000";
  tooltip.style.color = "#fff";
  tooltip.style.padding = "8px 16px";
  tooltip.style.borderRadius = "8px";
  tooltip.style.fontSize = "14px";
  tooltip.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
  tooltip.style.zIndex = "9999";
  tooltip.style.transition = "all 0.5s ease-in-out";

  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (isMobile) {
    tooltip.style.top = "-50px";
    tooltip.style.left = "50%";
    tooltip.style.transform = "translateX(-50%)";
    document.body.appendChild(tooltip);
    setTimeout(() => {
      tooltip.style.top = "20px";
    }, 50);
    setTimeout(() => {
      tooltip.style.top = "-50px";
    }, 2000);
  } else {
    tooltip.style.bottom = "20px";
    tooltip.style.left = "-200px";
    document.body.appendChild(tooltip);
    setTimeout(() => {
      tooltip.style.left = "20px";
    }, 50);
    setTimeout(() => {
      tooltip.style.left = "-200px";
    }, 2000);
  }

  setTimeout(() => {
    tooltip.remove();
  }, 2700);
}

const themeToggle = document.getElementById("theme-toggle");
const themeIcon   = document.getElementById("theme-icon");

function updateIcon() {
  if (document.body.classList.contains("dark-mode")) {
    themeIcon.src = "assets/images/Night.webp";
    themeIcon.alt = "Light Mode";
  } else {
    themeIcon.src = "assets/images/Day.webp";
    themeIcon.alt = "Dark Mode";
  }
}

function applySavedTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark") document.body.classList.add("dark-mode");
  updateIcon();
}
applySavedTheme();

function animatedThemeChange() {
  const toDark = !document.body.classList.contains("dark-mode");

  document.body.style.pointerEvents = "none";
  document.body.style.cursor = "default";

  const overlay = document.createElement("div");
  overlay.className = "theme-overlay";
  overlay.style.background = toDark ? "#1e1e1e" : "#ccc";

  overlay.style.transformOrigin = toDark ? "top left" : "bottom right";
  overlay.style.transform = "scale(0)";
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.style.transform = "scale(1)";
  });

  overlay.addEventListener("transitionend", function handler() {
    overlay.removeEventListener("transitionend", handler);

    document.body.classList.toggle("dark-mode", toDark);
    localStorage.setItem("theme", toDark ? "dark" : "light");
    updateIcon();

    overlay.style.transitionDelay = "100ms";
    overlay.style.transformOrigin = toDark ? "bottom right" : "top left";
    overlay.style.transform = "scale(0)";

    overlay.addEventListener("transitionend", () => {
      overlay.remove();

      document.body.style.pointerEvents = "";
      document.body.style.cursor = "";
    }, { once: true });
  });
}

themeToggle.addEventListener("click", animatedThemeChange);


const SETTINGS_KEY = "cyropass_settings";

function saveSettings() {
  const settings = {
    length:   document.getElementById("length").value,
    regex:    document.getElementById("regex").value,
    ambiguous:document.getElementById("Ambiguous").checked
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function restoreSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return;
  try {
    const s = JSON.parse(raw);
    if (s.length)    document.getElementById("length").value   = s.length;
    if (s.regex)     document.getElementById("regex").value    = s.regex;
    if (typeof s.ambiguous === "boolean")
                     document.getElementById("Ambiguous").checked = s.ambiguous;
  } catch {}
}

restoreSettings();

["input", "change"].forEach(evt => {
  document.getElementById("length")   .addEventListener(evt, saveSettings);
  document.getElementById("regex")    .addEventListener(evt, saveSettings);
  document.getElementById("Ambiguous").addEventListener(evt, saveSettings);
});

document.getElementById("generate").addEventListener("click", () => {
  saveSettings();
});

const DEFAULTS = { regex: "[\\w\\d\\sym?-]" };

document.getElementById("reset-regex").addEventListener("click", () => {
  const input = document.getElementById("regex");
  input.value = DEFAULTS.regex;
  saveSettings();
  input.focus();
});

