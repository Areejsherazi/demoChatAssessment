const encoder = new TextEncoder()
const decoder = new TextDecoder()

function bufToBase64(buf: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}
function base64ToBuf(b64: string) {
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return arr.buffer
}

const MASTER_KEY_STORAGE = 'sc_master_key_meta' // stores salt etc (not raw key)
const CHAT_KEYS_STORAGE = 'sc_chat_keys' // mapping chatId -> wrapped key + version

export async function deriveMasterKey(password: string, salt?: Uint8Array) {
  const pwKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  const _salt = salt || crypto.getRandomValues(new Uint8Array(16))

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: _salt as BufferSource,   
      iterations: 150000,
      hash: 'SHA-256'
    },
    pwKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )

  return { key, salt: _salt }
}


// Generate a random chat key (AES-GCM)
export async function generateChatKey() {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
}

// Wrap (encrypt) a chat key with master key by exporting raw chat key and encrypting bytes with master
export async function wrapChatKey(masterKey: CryptoKey, chatKey: CryptoKey) {
  const raw = await crypto.subtle.exportKey('raw', chatKey)
  // use AES-GCM with a random iv to wrap
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const wrapped = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, masterKey, raw)
  return { wrapped: bufToBase64(wrapped), iv: bufToBase64(iv.buffer) }
}

export async function unwrapChatKey(masterKey: CryptoKey, wrappedB64: string, ivB64: string) {
  const wrapped = base64ToBuf(wrappedB64)
  const iv = new Uint8Array(base64ToBuf(ivB64))
  const raw = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, masterKey, wrapped)
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt'])
}

// For demo: store master key salt in localStorage (not the key itself)
export function saveMasterMeta(salt: Uint8Array) {
  localStorage.setItem(MASTER_KEY_STORAGE, bufToBase64(salt.buffer as ArrayBuffer))
}
export function loadMasterMeta() {
  const s = localStorage.getItem(MASTER_KEY_STORAGE)
  if (!s) return null
  return new Uint8Array(base64ToBuf(s))
}

// chat keys mapping helpers
type ChatKeyMeta = { wrapped: string; iv: string; keyVersion: string }

function loadChatKeyMap(): Record<string, ChatKeyMeta> {
  const raw = localStorage.getItem(CHAT_KEYS_STORAGE)
  if (!raw) return {}
  try { return JSON.parse(raw) } catch { return {} }
}
function saveChatKeyMap(map: Record<string, ChatKeyMeta>) {
  localStorage.setItem(CHAT_KEYS_STORAGE, JSON.stringify(map))
}

// Ensure a chat key exists locally: if not, generate & wrap with master and store.
// If backend supports key distribution it would be fetched instead. For demo we generate locally.
export async function ensureChatKeyAvailable(chatId: string) {
  const map = loadChatKeyMap()
  if (map[chatId]) return // exists
  // derive master key from stored password? We don't store password. For demo we attempt to get a temporary master key in sessionStorage.
  const temp = sessionStorage.getItem('sc_master_pw')
  if (!temp) {
    // generate a chat key but we need to wrap it; for demo we will create and store unwrapped as wrapped with master= ephemeral random key (not secure).
    // Better approach: require user to register/login with password to derive master key (our auth hook stores password in session only).
    console.warn('Master password not found in session; generating chat key wrapped with ephemeral master (demo only).')
  }
  // For demo: create and wrap using stored masterKey in session (if exists)
  const sk = sessionStorage.getItem('sc_master_key_b64')
  if (sk) {
    // master key exported raw
    const masterRaw = base64ToBuf(sk)
    const master = await crypto.subtle.importKey('raw', masterRaw, {name: 'AES-GCM'}, true, ['encrypt','decrypt'])
    const chatKey = await generateChatKey()
    const { wrapped, iv } = await wrapChatKey(master, chatKey)
    map[chatId] = { wrapped, iv, keyVersion: 'v1' }
    saveChatKeyMap(map)
    return
  }
  // fallback: create an unwrapped stored key (NOT secure) — only for demo so app can show behavior
  const chatKey = await generateChatKey()
  const raw = await crypto.subtle.exportKey('raw', chatKey)
  map[chatId] = { wrapped: bufToBase64(raw), iv: '', keyVersion: 'v1-unwrapped-demo' }
  saveChatKeyMap(map)
}

// API for encrypting plaintext message before sending
export async function encryptMessageForSend(chatId: string, plaintext: string) {
  const map = loadChatKeyMap()
  if (!map[chatId]) {
    await ensureChatKeyAvailable(chatId)
  }
  const meta = loadChatKeyMap()[chatId]
  if (!meta) throw new Error('Chat key not available')

  let chatCryptoKey: CryptoKey
  if (meta.iv) {
    // wrapped — need master key from session
    const masterB64 = sessionStorage.getItem('sc_master_key_b64')
    if (!masterB64) throw new Error('Master key not in session; re-login required to decrypt chat key')
    const masterRaw = base64ToBuf(masterB64)
    const master = await crypto.subtle.importKey('raw', masterRaw, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt'])
    chatCryptoKey = await unwrapChatKey(master, meta.wrapped, meta.iv)
  } else {
    // unwrapped demo
    const raw = base64ToBuf(meta.wrapped)
    chatCryptoKey = await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt'])
  }

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, chatCryptoKey, encoder.encode(plaintext))
  return {
    ciphertext: bufToBase64(ct),
    iv: bufToBase64(iv.buffer),
    keyVersion: meta.keyVersion,
    alg: 'AES-GCM-256'
  }
}

export async function decryptMessageForDisplay(chatId: string, encryptedPayload: any) {
  const map = loadChatKeyMap()
  const meta = map[chatId]
  if (!meta) throw new Error('Chat key missing locally')

  let chatCryptoKey: CryptoKey
  if (meta.iv) {
    const masterB64 = sessionStorage.getItem('sc_master_key_b64')
    if (!masterB64) throw new Error('Master key not in session; re-login required to decrypt')
    const masterRaw = base64ToBuf(masterB64)
    const master = await crypto.subtle.importKey('raw', masterRaw, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt'])
    chatCryptoKey = await unwrapChatKey(master, meta.wrapped, meta.iv)
  } else {
    const raw = base64ToBuf(meta.wrapped)
    chatCryptoKey = await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt'])
  }

  const iv = new Uint8Array(base64ToBuf(encryptedPayload.iv))
  const ct = base64ToBuf(encryptedPayload.ciphertext)
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, chatCryptoKey, ct)
  return decoder.decode(plainBuf)
}



