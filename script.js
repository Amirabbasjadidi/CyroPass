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
