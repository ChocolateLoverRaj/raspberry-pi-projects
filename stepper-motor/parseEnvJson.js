const parseEnvJson = varName => {
  let envVar
  try {
    envVar = JSON.parse(process.env[varName])
  } catch (e) {
    console.error(e)
    throw new Error(`Parsing env var ${varName} had error (displayed above)`)
  }
  return envVar
}

export default parseEnvJson
