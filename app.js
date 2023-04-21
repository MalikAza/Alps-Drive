const express = require('express')
const actions = require('./utils/actions')
const os = require('os')
const fs = require('fs')
const path = require('path')
const utilsMulter = require('./utils/multer')
const responses = require('./utils/responses')

const app = express()
app.use(express.static('frontend'))
app.use(express.json())

app.post('/api/drive', (request, response) => {
  const name = request.query.name
  const folderPath = path.join(os.tmpdir(), name)

  if (fs.existsSync(folderPath)) return responses.alreadyExists(response, 'folder')
  
  actions.createFolder(response, os.tmpdir(), name)
})

app.get('/api/drive', async (_, response) => {

  const driveInfos = await actions.getFolderInfos(`${os.tmpdir()}`)

  response
    .set('Content-Type', 'application/json')
    .status(200)
    .json(driveInfos)
})

app.put('/api/drive', (request, response) => {
  utilsMulter.upload(request, response, (error) => {
    utilsMulter.fileCreationResponse(request, response, error)
  })
})

app.delete('/api/drive/:name', (request, response) => {
  const name = request.params.name

  if (!fs.existsSync(path.join(os.tmpdir(), name))) return responses.doesNotExists(response, 'folder')

  actions.deleteFolder(response, os.tmpdir(), name)
})

app.post('/api/drive/:folder', (request, response) => {
  const folder = request.params.folder
  const name = request.query.name
  const folderPath = path.join(os.tmpdir(), folder)
  
  if (!fs.existsSync(folderPath)) return responses.doesNotExists(response, 'folder')
  if (fs.existsSync(path.join(folderPath, name))) return responses.alreadyExists(response, 'folder')

  actions.createFolder(response, folderPath, name)
})

app.get('/api/drive/:name', async (request, response) => {
  const name = request.params.name
  const foDPath = path.join(os.tmpdir(), name)
  
  if (!fs.existsSync(foDPath)) return responses.doesNotExists(response, 'path')

  const [contentType, nameInfos] = await actions.getItemSubFolderInfos(foDPath)

  response
    .set('Content-Type', contentType)
    .status(200)
    .send(nameInfos)
})

app.put('/api/drive/:folder', (request, response) => {
  const folder = request.params.folder
  const folderPath = path.join(os.tmpdir(), folder)

  if (!fs.existsSync(folderPath)) return responses.doesNotExists(response, 'folder')

  utilsMulter.upload(request, response, (error) => {
    utilsMulter.fileCreationResponse(request, response, error)
  })
})

app.delete('/api/drive/:folder/:name', (request, response) => {
  const folder = request.params.folder
  const name = request.params.name
  const folderPath = path.join(os.tmpdir(), folder)

  if (!fs.existsSync(folderPath)) return responses.doesNotExists(response, 'folder')
  if (!fs.existsSync(path.join(folderPath, name))) return responses.doesNotExists(response, 'folder')

  actions.deleteFolder(response, folderPath, name)
})

module.exports = app