const express = require('express')
const utilsFuncs = require('./utils/funcs')
const os = require('os')

const pathDoesntExistsJson = { "message": "This path does not exists." }
const internalServerErrorJson = { "message": "Internal Server Error" }

const app = express()
app.use(express.static('frontend'))

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

// app.post('/api/stuff', (req, res, next) => {
//   console.log(req.body);
//   res.status(201).json({
//     message: 'Objet créé !'
//   });
// });

module.exports = app