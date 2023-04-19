const express = require('express')
const { getFolderInfos, getItemSubFolderInfos } = require('./utils/funcs')

const app = express()
app.use(express.static('frontend'))

app.get('/api/drive', async (request, result) => {
  const driveInfos = await getFolderInfos(`${__dirname}/drive`)

  result.status(200).json(driveInfos)
})

app.get('/api/drive/:name', async (request, result) => {
  const name = request.params.name
  const nameInfos = await getItemSubFolderInfos(`${__dirname}/drive/${name}`)

  result.status(200).json(nameInfos)
})

// app.post('/api/stuff', (req, res, next) => {
//   console.log(req.body);
//   res.status(201).json({
//     message: 'Objet créé !'
//   });
// });

module.exports = app