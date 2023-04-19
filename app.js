const express = require('express')
const { getDriveInfos } = require('./utils/funcs')

const app = express()
app.use(express.static('frontend'))

app.get('/api/drive', async (request, result) => {
  const infos = await getDriveInfos()

  result.status(200).json(infos)
})

module.exports = app