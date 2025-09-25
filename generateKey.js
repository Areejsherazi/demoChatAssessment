// generate-keys.js
const { generateKeyPairSync } = require("crypto");
const fs = require("fs");
const path = require("path");

// make sure keys folder exists
const keysDir = path.join(__dirname, "keys");
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir);
}

// generate RSA key pair
const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048, // key size
  publicKeyEncoding: {
    type: "spki",      // recommended for public key
    format: "pem"
  },
  privateKeyEncoding: {
    type: "pkcs8",     // recommended for private key
    format: "pem"
  }
});

// write files
fs.writeFileSync(path.join(keysDir, "private.pem"), privateKey);
fs.writeFileSync(path.join(keysDir, "public.pem"), publicKey);

console.log("✅ RSA key pair generated in ./keys/private.pem and ./keys/public.pem");
