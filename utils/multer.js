const multer = require('multer')
const { drivePath } = require('./conf')

const storage = multer.diskStorage({
  destination: function(request, file, callback) {
    callback(null, request.path.replace('/api/drive', drivePath))
  },
  filename: function(request, file, callback) {
    callback(null, file.originalname)
  }
})

function fileCreationResponse(request, response, error) {
  if (!request.file) return response.status(400).send('No file provided.')
  if (error) return response.status(400).send('Something went wrong!')

  response.status(201).json({
    "message": "File perfectly uploaded."
  })
}

const upload = multer({
  storage: storage
}).single('file')

module.exports = {
  upload,
  fileCreationResponse
}