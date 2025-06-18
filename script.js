document.getElementById("generate").addEventListener("click", () => {
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
    passwordField.value = "Invalid RegEx!";
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
  tooltip.style.bottom = "20px";
  tooltip.style.left = "-200px";
  tooltip.style.background = "#000";
  tooltip.style.color = "#fff";
  tooltip.style.padding = "8px 16px";
  tooltip.style.borderRadius = "8px";
  tooltip.style.fontSize = "14px";
  tooltip.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
  tooltip.style.zIndex = "9999";
  tooltip.style.transition = "left 0.5s ease-in-out";

  document.body.appendChild(tooltip);
  setTimeout(() => {
    tooltip.style.left = "20px";
  }, 50);
  setTimeout(() => {
    tooltip.style.left = "-200px";
  }, 2000);
  setTimeout(() => {
    tooltip.remove();
  }, 2700);
}
