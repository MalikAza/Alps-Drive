const express = require('express')
const utilsFuncs = require('./utils/funcs')
const os = require('os')
const fs = require('fs')
const path = require('path')

const app = express()
app.use(express.static('frontend'))
app.use(express.json())

app.post('/api/drive', (request, response) => {
  const name = request.query.name
  const folderPath = path.join(os.tmpdir(), name)

  if (fs.existsSync(folderPath)) return utilsFuncs.alreadyExistsResponse(response, 'folder')
  
  utilsFuncs.createFolder(response, os.tmpdir(), name)
})

app.get('/api/drive', async (_, response) => {

  const driveInfos = await utilsFuncs.getFolderInfos(`${os.tmpdir()}`)

  response
    .set('Content-Type', 'application/json')
    .status(200)
    .json(driveInfos)
})

app.post('/api/drive/:folder', (request, response) => {
  const folder = request.params.folder
  const name = request.query.name
  const folderPath = path.join(os.tmpdir(), folder)
  
  if (!fs.existsSync(folderPath)) return utilsFuncs.doesNotExistsResponse(response, 'folder')
  if (fs.existsSync(path.join(folderPath, name))) return utilsFuncs.alreadyExistsResponse(response, 'folder')

  utilsFuncs.createFolder(response, folderPath, name)
})

app.get('/api/drive/:name', async (request, response) => {
  const name = request.params.name
  const foDPath = path.join(os.tmpdir(), name)
  
  if (!fs.existsSync(foDPath)) return utilsFuncs.doesNotExistsResponse(response, 'path')

  const [contentType, nameInfos] = await utilsFuncs.getItemSubFolderInfos(foDPath)

  response
    .set('Content-Type', contentType)
    .status(200)
    .send(nameInfos)
})

module.exports = app