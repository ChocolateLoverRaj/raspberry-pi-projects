import parseEnvJson from 'parse-env-json'
import Ajv from 'ajv'

const ajv = new Ajv()

const parseEnvJsonSchema = (varName, schema) => {
  const validate = ajv.compile(schema)
  const json = parseEnvJson(varName)
  if (!validate(json)) {
    console.error(validate.errors)
    throw new Error(`Invalid ${varName} env var`)
  }
  return json
}

export default parseEnvJsonSchema
