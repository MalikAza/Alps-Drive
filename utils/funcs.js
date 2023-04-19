const fs = require('fs')

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
 * This function returns information about a file or folder, including its content if it is a file.
 * @param itemPath - `itemPath` is a string parameter representing the path of a file or folder in the
 * file system. The function checks if the item at the given path is a file or a directory, and returns
 * its content if it's a file or recursively calls `getFolderInfos` function to get the content
 * @returns The function `getItemSubFolderInfos` returns an object with the property "content" that
 * contains the content of the file if the itemPath is a file, or it returns the result of the
 * `getFolderInfos` function if the itemPath is a directory. If the itemPath does not exist, it returns
 * `false`. If there is an error, it throws a new error with the message
 */
async function getItemSubFolderInfos(itemPath) {
    try {
        const item = fs.lstatSync(itemPath)
        
        if (!item.isDirectory()) return {"content": fs.readFileSync(itemPath, 'utf-8')}
        else return await getFolderInfos(itemPath)
    }
    catch (error) {
        if (error.message.includes('ENOENT: no such file or directory')) return false
        else throw new Error('Something wrong happened', {cause: error})
    }
}

module.exports = { getFolderInfos, getItemSubFolderInfos }