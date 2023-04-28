const path = require('path')
const fs = require('fs')
const { drivePath } = require('./conf')
const utilsMulter = require('./multer')
const archiver = require('archiver')

const alphaNumericRegEx = new RegExp('^[a-zA-Z\-_\.0-9]+$')

class Drive {
  #state = true

  request;
  response;
  folderPath;

  constructor(request, response) {
    this.request = request
    this.response = response
    this.folderPath = path.join(drivePath, request.params[0])

    if (!fs.existsSync(this.folderPath)) {
      this.#state = false
      return response.status(404).send(`This path does not exists.`)
    }
  }

  getState() { return this.#state }

  pathAlreadyExists(type) {
    return this.response.status(400).send(
      `This ${type} already exists.`
    )
  }

  doesPathAlreadyExists(path) {
    if (fs.existsSync(path)) return true
    return false
  }

  testIfIsAlphaNum(name) {
    if (!alphaNumericRegEx.test(name)) return false
    return true
  }

  notAlphaNum(type) {
    return this.response.status(400).send(
      `The ${type}'s name is not valid. It must be alpha-numeric.`
    )
  }
}


class DrivePost extends Drive {
  #qName;

  constructor(request, response) {
    super(request, response)
    this.#qName = this.request.query.name
  }

  createFolder() {
    const futureFolderPath = path.join(this.folderPath, this.#qName)

    if (this.pathAlreadyExists(futureFolderPath)) return this.pathAlreadyExists('folder')
    if (!this.testIfIsAlphaNum(this.#qName)) return this.notAlphaNum('folder')

    fs.mkdirSync(path.join(this.folderPath, this.#qName))
    this.response.status(201).send(
      'Folder perfectly created.'
    )
  }

}


class DriveGet extends Drive {
  #archivePath;
  #qType;

  constructor(request, response) {
    super(request, response)
    this.#qType = this.request.query.type
    this.#archivePath = `${this.folderPath}.${this.#qType}`
  }

  #archiveResponse() {
    return this.response
      .status(200)
      .download(this.#archivePath)
  }

  #pathInfosResponse(contentType, infos) {
    return this.response
      .set('Content-Type', contentType)
      .status(200)
      .send(infos)
  }

  #getItemInfos(item) {
    // Defaults (folder) atrbs
    let itemInfos = {
      name: item.name,
      isFolder: true
    }
    // File atrbs
    if (item.isDirectory()) {
      itemInfos.isFolder = false
      itemInfos.size = fs.statSync(path.join(this.folderPath, item.name)).size
    }

    return itemInfos
  }

  async createArchive() {
    if (this.doesPathAlreadyExists(this.#archivePath)) return this.#archiveResponse()

    const archive = archiver(this.qType, { zlib: { level: 9}})
    const output = fs.createWriteStream(this.#archivePath)

    let action = new Promise((resolve, reject) => {
      archive
        .directory(this.folderPath, false)
        .on('error', err => reject(err))
        .pipe(output)

      output.on('close', () => {
        resolve()
      })

      archive.finalize()
    })

    await action
    
    return this.#archiveResponse()
  }

  async getPathInfos() {
    const item = fs.lstatSync(this.folderPath)

    // File handling
    if (!item.isDirectory()) return this.#pathInfosResponse(
      'application/octet-stream',
      fs.readFileSync(this.folderPath, 'utf-8')
    )

    // Folder handling
    let folderInfos = []

    const items = fs.readdirSync(`${this.folderPath}`, {withFileTypes: true})
    await Promise.all(items.map((item) => {
      return folderInfos.push(this.#getItemInfos(item))
    }))

    return this.#pathInfosResponse(
      'application/json',
      folderInfos
    )
  }

}

class DrivePut extends Drive {
  #newName;

  constructor(request, response) {
    super(request, response)
    this.#newName = request.query.newName
  }

  uploadFile() {
    utilsMulter.upload(this.request, this.response, (error) => {
      utilsMulter.fileCreationResponse(this.request, this.response, error)
    })
  }

  rename() {
    if (this.#newName === 'null' || !this.#newName)
      return this.response.status(204).send()

    if (!this.testIfIsAlphaNum(this.#newName)) {
      if (this.doesPathAlreadyExists(path.join(this.folderPath, this.#newName)))
        return
    }
  }

}

module.exports = {
  DriveGet,
  DrivePost,
  DrivePut,
}