import { Command } from 'commander'
import jsonfile from 'jsonfile'
import dev from './dev.js'
import uploadCert from './uploadCert.js'

const packageJson = jsonfile.readFileSync('package.json')
const program = new Command()
  .name(packageJson.name)
  .description(packageJson.description)
  .version(packageJson.version)

program.command('dev')
  .description('Start dev server')
  .action(dev)

program.command('upload-cert')
  .description('Updload SSL certificate to https://file.io to securely download')
  .action(uploadCert)

program.parse()
