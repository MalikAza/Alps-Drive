const fs = require('fs')

function noSuchFileOrDirectoryError(error) {
  if (error.message.includes('ENOENT: no such file or directory')) return true
  return false
}

/**
 * This is an async function that retrieves information about a file or folder, such as its name, size,
 * and whether it is a folder or not.
 * @param path - The `path` parameter is a string representing the path to the directory where the
 * `item` is located.
 * @param item - The `item` parameter is an object representing a file or directory in a file system.
 * It is passed as an argument to the `_getItemInfos` function. The function checks whether the item is
 * a file or a directory and returns an object with information about the item, such as its name,
 * whether
 * @returns The `_getItemInfos` function returns an object containing information about the item passed
 * as a parameter. The object includes the item's name and whether it is a folder or a file. If the
 * item is a file, the object also includes its size.
 */
async function _getItemInfos(path, item) {
  // Defaults (folder) atrbs
  let itemInfos = {
      name: item.name,
      isFolder: true
  }
  // File atrbs
  if (!item.isDirectory()) {
      itemInfos.isFolder = false
      itemInfos.size = (await fs.promises.stat(`${path}/${item.name}`)).size
  }
  
  return itemInfos
}

/**
 * This function retrieves information about all items in a specified folder path.
 * @param folderPath - The `folderPath` parameter is a string representing the path of the folder for
 * which we want to retrieve information about its contents.
 * @returns The `getFolderInfos` function is returning an array of objects containing information about
 * the items in the specified folder. The information includes the name, type (file or directory),
 * and size.
 */
async function getFolderInfos(folderPath) {
  let folderInfos = []

  const items = await fs.promises.readdir(`${folderPath}`, {withFileTypes: true})
  await Promise.all(items.map(async (fd) => {
      return folderInfos.push(await _getItemInfos(`${folderPath}`, fd))
  }))

  return folderInfos
}

/**
 * This function checks if a given item path is a directory or not, and returns either the file content
 * or folder information accordingly.
 * @param itemPath - The parameter `itemPath` is a string representing the path of a file or folder in
 * the file system.
 * @returns A tuple containing two values: a string representing the content type
 * ('application/octet-stream' or 'application/json') and either the contents of the file as a string
 * (if the item is not a directory) or the result of calling the `getFolderInfos` function (if the item
 * is a directory).
 */
async function getItemSubFolderInfos(itemPath) {
  const item = fs.lstatSync(itemPath)
  
  if (!item.isDirectory()) return ['application/octet-stream', fs.readFileSync(itemPath, 'utf-8')]
  else return ['application/json', await getFolderInfos(itemPath)]
}

module.exports = {
  getFolderInfos,
  getItemSubFolderInfos,
  noSuchFileOrDirectoryError
} 