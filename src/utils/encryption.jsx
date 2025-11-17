import CryptoJS from 'crypto-js';

// Encrypt data using AES encryption
const secretKey = '1QUa97x7+RK30ydey7OINl+oFNPZASMvfn40bmRB/Zw='

export const encryptData = (data) => {
  const encrypted = CryptoJS.AES.encrypt(data, secretKey).toString();
  return encrypted;
};
// Decrypt data using AES decryption
// Decrypt data using AES decryption
export const decryptData = (encryptedData) => {
  try {
    // Step 0: Check if encryptedData is null or empty
    if (!encryptedData) {
      console.warn('decryptData called with null or empty value');
      return ""; // <-- Return empty string instead of null
    }

    // Step 1: Decrypt the data using Caesar Cipher first (reverse the Caesar encryption)

    // Step 2: Decrypt the AES-encrypted data
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey); // AES decryption using the same secret key
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8); // Convert the bytes back to a UTF-8 string

    // Step 3: Parse the decrypted data back to an object (assuming it was a JSON object before encryption)
    try {
      const originalData = JSON.parse(decryptedData);
      return originalData;
    } catch (jsonError) {
      return decryptedData || ""; // <-- Ensure it's a string
    }
    
  } catch (error) {
    console.error('Decryption failed:', error);
    return ""; // <-- Return empty string on failure
  }
};



export const encrypturl = (data) => {
  const encodedData = encodeURIComponent(data);

  const encrypted = CryptoJS.AES.encrypt(encodedData, secretKey).toString(CryptoJS.enc.Base64); // Use Base64 encoding
  // Make Base64 URL-safe by replacing `+` with `-`, `/` with `_`, and removing `=`
  const urlSafeEncrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return urlSafeEncrypted;
};
export const decrypturl = (encryptedData) => {
  try {
    // Make the Base64 string URL-safe by reversing the replacements
    const base64Data = encryptedData.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if necessary
    const base64DataWithPadding = base64Data.padEnd(base64Data.length + (4 - base64Data.length % 4) % 4, '=');

    // Decrypt the data using AES
    const bytes = CryptoJS.AES.decrypt(base64DataWithPadding, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8); // Convert the bytes back to a UTF-8 string

    // URL decode the decrypted data
    const decodedData = decodeURIComponent(decryptedData);

    // Parse the decrypted data back to an object (assuming it was a JSON object before encryption)
    try {
      const originalData = JSON.parse(decodedData);
      return originalData;
    } catch (jsonError) {
      return decodedData;
    }
    
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Decryption failed');
  }
};
