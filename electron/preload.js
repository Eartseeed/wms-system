const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  appName: 'WMS-GATE-QC'
})