function doesNotExists(response, type) {
  return response.status(404).json({
    "message": `This ${type} does not exists.`
  })
  }
  
function alreadyExists(response, type) {
  return response.status(400).send(
    `This ${type} already exists.`
  )
}
  
function notAlphaNum(response, name) {
  return response.status(400).send(
    "The folder's name is not valid. It must be alpha-numeric."
  )
}

module.exports = {
  doesNotExists,
  alreadyExists,
  notAlphaNum
}