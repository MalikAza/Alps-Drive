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

// create a folder
app.post('/api/drive/*', (request, response) => {
  const folderPath = path.join(drivePath, request.params['0'])
  const name = request.query.name

  if (!fs.existsSync(folderPath)) return responses.doesNotExists(response, 'folder')
  if (fs.existsSync(path.join(folderPath, name))) return responses.alreadyExists(response, 'folder')

  actions.createFolder(response, folderPath, name)
})

// getting folder infos
app.get('/api/drive/*', async (request, response) => {
  const foDPath = path.join(drivePath, request.params['0'])

  if (!fs.existsSync(foDPath)) return response.doesNotExists(response, 'path')

  const [contentType, foDInfos] = await actions.getItemSubFolderInfos(foDPath)

  response
    .set('Content-Type', contentType)
    .status(200)
    .send(foDInfos)
})

// upload a file
app.put('/api/drive/*', (request, response) => {
  const folderPath = path.join(drivePath, request.params['0'])

  if (!fs.existsSync(folderPath)) return responses.doesNotExists(response, 'folder')

  utilsMulter.upload(request, response, (error) => {
    utilsMulter.fileCreationResponse(request, response, error)
  })
})

// delete folder or file
app.delete('/api/drive/*/:name', (request, response) => {
  const folderPath = path.join(drivePath, request.params['0'])
  const name = request.params.name

  if (!fs.existsSync(folderPath)) return responses.doesNotExists(response, 'folder')
  if (!fs.existsSync(path.join(folderPath, name))) return responses.doesNotExists(response, 'folder')

  actions.deleteFolder(response, folderPath, name)
})

module.exports = app