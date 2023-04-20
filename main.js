// Imports
const http = require('http')
const app = require('./app')

/**
 * The function normalizes a given port value to either a valid integer or false.
 * @returns The `normalizePort` function returns either the parsed integer value of the input `val` if
 * it is a valid integer, or the original `val` if it is not a valid integer. If `val` is not a valid
 * integer, the function returns `false`.
 */
const normalizePort = val => {
  const port = parseInt(val, 10)

  if (isNaN((port))) {
      return val
  }
  if (port >= 0) {
      return port
  }
  return false
}

const port = normalizePort(process.env.PORT || '3000')
app.set('port', port)

/**
 * The function handles errors related to server listening and provides specific error messages for
 * different scenarios.
 */
const errorHandler = error => {
  if (error.syscall !== 'listen') {
      throw error
  }
  const address = server.address()
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port
  switch (error.code) {
      case 'EACCESS':
          console.error(bind + ' requires elevated privileges.')
          process.exit(1)
          break
      case 'EADDRINUSE':
          console.error(bind + ' is already in use.')
          process.exit(1)
          break
      default:
          throw error
  }
}

const server = http.createServer(app)

server.on('error', errorHandler)
/* This code block is setting up an event listener for the 'listening' event of the `server` object.
When the server starts listening for incoming requests, this event is triggered and the callback
function is executed. The callback function retrieves the address on which the server is listening
and logs a message indicating that the server is listening on that address. */
server.on('listening', () => {
  const address = server.address()
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port
  console.log('Listening on ' + bind)
})

server.listen(port)