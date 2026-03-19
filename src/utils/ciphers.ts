// Cryptographic algorithms adapted from TheAlgorithms/JavaScript
// https://github.com/TheAlgorithms/JavaScript/tree/master/Ciphers

export const decryptCaesar = (str: string, shift: number): string => {
  return str.replace(/[a-zA-Z]/g, (char) => {
    const base = char <= 'Z' ? 65 : 97;
    return String.fromCharCode(((char.charCodeAt(0) - base - shift + 26) % 26) + base);
  });
};

export const decryptROT13 = (str: string): string => {
  return decryptCaesar(str, 13);
};

export const decryptXOR = (str: string, key: string): string => {
  if (!key) return str;
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
};

export const decryptAtbash = (str: string): string => {
  return str.replace(/[a-zA-Z]/g, (char) => {
    const base = char <= 'Z' ? 65 : 97;
    return String.fromCharCode(base + 25 - (char.charCodeAt(0) - base));
  });
};

export const decryptVigenere = (str: string, key: string): string => {
  if (!key) return str;
  let result = '';
  let j = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (/[a-zA-Z]/.test(char)) {
      const base = char <= 'Z' ? 65 : 97;
      const keyChar = key[j % key.length].toLowerCase();
      const shift = keyChar.charCodeAt(0) - 97;
      result += String.fromCharCode(((char.charCodeAt(0) - base - shift + 26) % 26) + base);
      j++;
    } else {
      result += char;
    }
  }
  return result;
};

// Heuristic to check if the decrypted text looks like valid Lua or English
export const isLikelyDecrypted = (text: string): boolean => {
  const keywords = ['local ', 'function', 'end', 'return ', 'if ', 'then', 'math.', 'string.', 'print(', 'require('];
  let score = 0;
  for (const kw of keywords) {
    if (text.includes(kw)) score++;
  }
  return score >= 1; // Just 1 keyword is enough for a strong hint in small files
};
