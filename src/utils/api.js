export function getWebSocketUrl() {
  const raw = import.meta.env.VITE_WS_URL
  // 如果是 / 开头的相对路径，拼上当前 host 和协议
  if (raw.startsWith('/')) {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws'
    return `${proto}://${location.host}${raw}`
  }
  return raw // 绝对地址，直接返回
}

export function getMgrWebSocketUrl() {
  const raw = import.meta.env.VITE_MGR_WS_URL
  // 如果是 / 开头的相对路径，拼上当前 host 和协议
  if (raw.startsWith('/')) {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws'
    return `${proto}://${location.host}${raw}`
  }
  return raw // 绝对地址，直接返回
}

export function getImgUploadUrl() {
  return import.meta.env.VITE_IMG_UPLOAD_URL
}

export function getImageUrl(imageName) {
  return import.meta.env.VITE_IMG_URL_PREFIX + imageName
}
