const crypto = require("crypto");
require("dotenv").config();
const forge = require('node-forge');
const algorithm = "aes-256-ctr";
const secretKey = process.env.API_KEY_SECRET;
const ivLength = 16;

// 🔒 Encrypt API Key → HEX
exports.encryptApiKey = (apiKey) => {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, crypto.scryptSync(secretKey, 'salt', 32), iv);
  const encrypted = Buffer.concat([cipher.update(apiKey), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

// 🔓 Decrypt HEX back → API Key
exports.decryptApiKey = (encryptedApiKey) => {
  const [ivHex, encryptedHex] = encryptedApiKey.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, crypto.scryptSync(secretKey, 'salt', 32), iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString();
};


// .encrypt=()=>{


exports.encrypttrexo = (plainText, publicKeyPem) => {
  const aesKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv("aes-256-gcm", aesKey, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  const encryptedBuffer = Buffer.concat([encrypted, authTag]);
  const dataB64 = encryptedBuffer.toString("base64");

  const encryptedKeyB64 = crypto
    .publicEncrypt(
      { key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_PADDING },
      aesKey
    )
    .toString("base64");
  const encryptedIvB64 = crypto
    .publicEncrypt(
      { key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_PADDING },
      iv
    )
    .toString("base64");

  return `${dataB64}^${encryptedKeyB64}^${encryptedIvB64}`;
}

exports.decrypttrexo = (encryptedString, privateKeyPem) => {
  if (typeof encryptedString !== "string") {
    throw new TypeError("Expected encrypted string to be of type string.");
  }

  const [dataB64, encryptedKeyB64, encryptedIvB64] = encryptedString.split("^");

  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const aesKeyBinaryStr = privateKey.decrypt(
    forge.util.decode64(encryptedKeyB64),
    "RSAES-PKCS1-V1_5"
  );
  const ivBinaryStr = privateKey.decrypt(
    forge.util.decode64(encryptedIvB64),
    "RSAES-PKCS1-V1_5"
  );

  const aesKey = Buffer.from(aesKeyBinaryStr, "binary");
  const iv = Buffer.from(ivBinaryStr, "binary");

  const encryptedBuffer = Buffer.from(dataB64, "base64");
  const authTag = encryptedBuffer.slice(-16);
  const ciphertext = encryptedBuffer.slice(0, -16);

  const decipher = crypto.createDecipheriv("aes-256-gcm", aesKey, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

