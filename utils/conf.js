const os = require('os')
const path = require('path')
const drivePath = path.join(os.tmpdir(), 'drive')

module.exports = { drivePath }