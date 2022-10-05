import { open } from 'fs/promises'
import { dirname, filename } from 'dirname-filename-esm'

const __dirname = dirname(import.meta)
const __filename = filename(import.meta)

const createService = async ({ name, force }) => {
  const fileName = `/etc/systemd/system/${name}.service`
  const fileHandle = await open(fileName, force ? 'w' : 'wx')
  await fileHandle.write(`
# This file was created by ${__filename}
[Unit]
Description=Starts an https server to control raspberry pi
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=on-failure
RestartSec=60
WorkingDirectory=${__dirname}
ExecStart=${process.argv[0]} index.js serve

[Install]
WantedBy=multi-user.target
`.slice(1))
  console.log(`Created ${fileName}`)
  console.log(`Run sudo systemctl enable ${name} to start server when rpi starts`)
}

export default createService
