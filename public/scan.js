let scanBuffer = ''
let lastScanTime = 0

document.addEventListener('keydown', (event) => {
  const currentTime = Date.now()
  const scanThreshold = window.scanThreshold || 50
  const scanMinChar = window.scanMinChar || 3

  if (currentTime - lastScanTime > scanThreshold) {
    scanBuffer = ''
  }

  const functionKeys = {
    F2: 'PDA_BUTTON_1',
    F4: 'PDA_BUTTON_2',
    F8: 'PDA_BUTTON_3',
    F9: 'PDA_BUTTON_4',
  }

  if (functionKeys[event.key]) {
    document.dispatchEvent(new CustomEvent(functionKeys[event.key]))
    return
  }

  if (event.key?.length === 1) {
    scanBuffer += event.key
  }

  if (event.key === 'Enter' && scanBuffer.length >= scanMinChar) {
    document.dispatchEvent(
      new CustomEvent('PDA_SCAN', { detail: { value: scanBuffer } }),
    )
    scanBuffer = ''
  }

  lastScanTime = currentTime
})
