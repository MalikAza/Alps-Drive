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

// Force disallowing cross-origins
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  next()
})

// create a folder
app.post('/api/drive/*', (request, response) => {
  const folderPath = path.join(drivePath, request.params['0'])
  const name = request.query.name

  if (!fs.existsSync(folderPath)) return responses.doesNotExists(response, 'folder')
  if (fs.existsSync(path.join(folderPath, name))) return responses.alreadyExists(response, 'folder')

  actions.createFolder(response, folderPath, name)
})

// getting folder infos or download folder as zip/tar
app.get('/api/drive/*', async (request, response) => {
  const foDPath = path.join(drivePath, request.params['0'])
  const downloadingExt = request.query.type

  if (!fs.existsSync(foDPath)) return responses.doesNotExists(response, 'path')
  if (downloadingExt) {
    const archivePath = await actions.createArchiveFromFolder(foDPath, downloadingExt)

    return response
      .status(200)
      .download(archivePath)
  }

  const [contentType, foDInfos] = await actions.getItemSubFolderInfos(foDPath)

  response
    .set('Content-Type', contentType)
    .status(200)
    .send(foDInfos)
})

// upload a file or rename file/folder
app.put('/api/drive/*', (request, response) => {
  const folderPath = path.join(drivePath, request.params['0'])
  const newName = request.query.newName

  if (!fs.existsSync(folderPath)) return responses.doesNotExists(response, 'folder')
  if (!newName) {
    utilsMulter.upload(request, response, (error) => {
      utilsMulter.fileCreationResponse(request, response, error)
    })
  } else {
    actions.renameFolder(response, folderPath, newName)
  }
  
})

// delete folder or file
app.delete('/api/drive/*', (request, response) => {
  const folderPath = path.join(drivePath, request.params['0'])

  if (!fs.existsSync(path.join(folderPath))) return responses.doesNotExists(response, 'folder')

  actions.deleteFolder(response, folderPath)
})

module.exports = app