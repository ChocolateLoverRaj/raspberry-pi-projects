// import FormData from 'form-data'
// import { createReadStream } from 'fs'
// import { request } from 'https'
// import streamToString from 'stream-to-string'

const uploadCert = () => {
  console.log("Doesn't work :(")
  // const form = new FormData()
  // form.append('file', createReadStream('conf/ca-cert.pem'))
  // form.pipe(request({
  //   method: 'post',
  //   host: 'file.io',
  //   headers: {
  //     ...form.getHeaders(),
  //     Accept: 'application/json'
  //   }
  // }).on('response', async res => {
  //   const string = await streamToString(res)
  //   const { link } = JSON.parse(string)
  //   console.log(`Certificate downloadable at ${link}`)
  // }))
}

export default uploadCert
