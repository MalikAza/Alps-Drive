const os = require('os')
const fs = require('fs')
const path = require('path')
const responses = require('./responses')
const archiver = require('archiver')

const alphaNumericRegEx = new RegExp('^[a-zA-Z\-_\.0-9]+$')

function _getItemInfos(currentPath, item) {
  // Defaults (folder) atrbs
  let itemInfos = {
      name: item.name,
      isFolder: true
  }
  // File atrbs
  if (!item.isDirectory()) {
      itemInfos.isFolder = false
      itemInfos.size = fs.statSync(path.join(currentPath, item.name)).size
  }
  
  return itemInfos
}

async function getFolderInfos(folderPath) {
  let folderInfos = []

  const items = fs.readdirSync(`${folderPath}`, {withFileTypes: true})
  await Promise.all(items.map((fd) => {
      return folderInfos.push(_getItemInfos(`${folderPath}`, fd))
  }))

  return folderInfos
}

async function getItemSubFolderInfos(itemPath) {
  const item = fs.lstatSync(itemPath)
  // File handling
  if (!item.isDirectory()) return ['application/octet-stream', fs.readFileSync(itemPath, 'utf-8')]
  // Folder handling
  else return ['application/json', await getFolderInfos(itemPath)]
}

function createFolder(response, currentPath, name) {
  if (!alphaNumericRegEx.test(name)) return responses.notAlphaNum(response, name)

  fs.mkdirSync(path.join(currentPath, name))
  response.status(201).json({
    "message": "Folder perfetcly created."
  })
}

function deleteFolder(response, currentPath) {
  fs.rmSync(path.join(currentPath), { recursive: true, force: true })
  response.status(200).json({
    "message": "Folder perfectly deleted."
  })
}

function renameFolder(response, currentPath, newName) {
  if (!alphaNumericRegEx.test(newName)) return responses.notAlphaNum(response, newName)

  const pathWOLastItem = currentPath.split('/').slice(0, -1).join('/')
  const pathLastItem = fs.lstatSync(currentPath)
  let newPath = `${pathWOLastItem}/${newName}`
  
  if (!pathLastItem.isDirectory()) {
    newPath += `.${currentPath.split('.').pop()}`
  }

  fs.renameSync(currentPath, newPath)
  response.status(200).json({
    "message": "Folder perfectly renamed."
  })
}

async function createArchiveFromFolder(currentPath, type) {
  const archivePath = `${currentPath}.${type}`

  if (fs.existsSync(archivePath)) return archivePath

  const archive = archiver(type, { zlib: { level: 9 }})
  const output = fs.createWriteStream(archivePath)
  
  action = new Promise((resolve, reject) => {
    archive
      .directory(currentPath, false)
      .on('error', err => reject(err))
      .pipe(output)

    output.on('close', () => {
      resolve()
    })
    archive.finalize()
  })
  await action

  return archivePath
}

module.exports = {
  getFolderInfos,
  getItemSubFolderInfos,
  createFolder,
  deleteFolder,
  renameFolder,
  createArchiveFromFolder,
} 