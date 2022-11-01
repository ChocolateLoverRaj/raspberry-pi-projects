const parseEnvFloat = envVar => {
  const envVarString = process.env[envVar]
  const number = parseFloat(envVarString)
  if (Number.isNaN(number)) {
    throw new Error(`The env var ${envVar} is ${envVarString}, which is not a valid float.`)
  }
  return number
}

export default parseEnvFloat
