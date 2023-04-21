const express = require('express')
const actions = require('./utils/actions')
const fs = require('fs')
const path = require('path')
const utilsMulter = require('./utils/multer')
const responses = require('./utils/responses')
const { drivePath } = require('./utils/conf')

const app = express()
app.use(express.static('frontend'))
app.use(express.json())

// creating folder
app.post('/api/drive', (request, response) => {
  const name = request.query.name
  const folderPath = path.join(drivePath, name)

  // folder already exists
  if (fs.existsSync(folderPath)) return responses.alreadyExists(response, 'folder')
  
  actions.createFolder(response, drivePath, name)
})

// getting folder infos @ drive's root
app.get('/api/drive', async (_, response) => {
  const driveInfos = await actions.getFolderInfos(drivePath)

  response
    .set('Content-Type', 'application/json')
    .status(200)
    .json(driveInfos)
})

// upload file @ drive's root
app.put('/api/drive', (request, response) => {
  utilsMulter.upload(request, response, (error) => {
    utilsMulter.fileCreationResponse(request, response, error)
  })
})

// delete folder or file @ drive's root
app.delete('/api/drive/:name', (request, response) => {
  const name = request.params.name

  if (!fs.existsSync(path.join(drivePath, name))) return responses.doesNotExists(response, 'folder')

  actions.deleteFolder(response, drivePath, name)
})

// create folder in a drive's subfolder
app.post('/api/drive/:folder', (request, response) => {
  const folder = request.params.folder
  const name = request.query.name
  const folderPath = path.join(drivePath, folder)
  
  if (!fs.existsSync(folderPath)) return responses.doesNotExists(response, 'folder')
  if (fs.existsSync(path.join(folderPath, name))) return responses.alreadyExists(response, 'folder')

  actions.createFolder(response, folderPath, name)
})

// getting drive's subfolder infos
app.get('/api/drive/:name', async (request, response) => {
  const name = request.params.name
  const foDPath = path.join(drivePath, name)
  
  if (!fs.existsSync(foDPath)) return responses.doesNotExists(response, 'path')

  const [contentType, nameInfos] = await actions.getItemSubFolderInfos(foDPath)

  response
    .set('Content-Type', contentType)
    .status(200)
    .send(nameInfos)
})

// upload file @ drive's subfolder
app.put('/api/drive/:folder', (request, response) => {
  const folder = request.params.folder
  const folderPath = path.join(drivePath, folder)

  if (!fs.existsSync(folderPath)) return responses.doesNotExists(response, 'folder')

  utilsMulter.upload(request, response, (error) => {
    utilsMulter.fileCreationResponse(request, response, error)
  })
})

// delete folder or file @ drive's subfolder
app.delete('/api/drive/:folder/:name', (request, response) => {
  const folder = request.params.folder
  const name = request.params.name
  const folderPath = path.join(drivePath, folder)

  if (!fs.existsSync(folderPath)) return responses.doesNotExists(response, 'folder')
  if (!fs.existsSync(path.join(folderPath, name))) return responses.doesNotExists(response, 'folder')

  actions.deleteFolder(response, folderPath, name)
})


module.exports = app