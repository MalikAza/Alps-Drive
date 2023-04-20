const express = require('express')
const utilsFuncs = require('./utils/funcs')
const os = require('os')
const fs = require('fs')

const pathDoesntExistsJson = { "message": "This path does not exists." }
const internalServerErrorJson = { "message": "Internal Server Error" }
const alphaNumericRegEx = new RegExp('^[a-zA-Z]+$')

const app = express()
app.use(express.static('frontend'))
app.use(express.json())

app.get('/api/drive', async (request, response) => {
  response.set('Content-Type', 'application/json')

  try {
    const driveInfos = await utilsFuncs.getFolderInfos(`${os.tmpdir()}`)

    response.status(200).json(driveInfos)
  } catch (error) {
    if (utilsFuncs.noSuchFileOrDirectoryError(error)) response.status(404).json(pathDoesntExistsJson)
    else response.status(500).json(internalServerErrorJson)
  }
  
})

app.post('/api/drive', (request, response) => {
  const name = request.query.name
  const folderPath = `${os.tmpdir()}/${name}`

  // Folder's name not alpha-numeric
  if (!alphaNumericRegEx.test(name)) return response.status(400).send(
    "The folder's name is not valid. It must be alpha-numeric."
  )
  // Folder already exists
  if (fs.existsSync(folderPath)) return response.status(400).send(
    "This folder already exists."
  )
  
  fs.mkdirSync(folderPath)
  response.status(201).json({
    "message": "Folder perfetcly created."
  })
})

app.get('/api/drive/:name', async (request, response) => {
  const name = request.params.name
  
  try {
    const [contentType, nameInfos] = await utilsFuncs.getItemSubFolderInfos(`${os.tmpdir()}/${name}`)

    response
      .status(200)
      .set('Content-Type', contentType)
      .send(nameInfos)
  } catch (error) {
    if (utilsFuncs.noSuchFileOrDirectoryError(error)) response.status(404).json(pathDoesntExistsJson)
    else response.status(500).json(internalServerErrorJson)
  }
})

module.exports = app