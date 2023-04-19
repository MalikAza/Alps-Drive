const fs = require('fs')

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

async function getFolderInfos(folderPath) {
    let folderInfos = []

    const items = await fs.promises.readdir(`${folderPath}`, {withFileTypes: true})
    await Promise.all(items.map(async (fd) => {
        return folderInfos.push(await _getItemInfos(`${folderPath}`, fd))
    }))

    return folderInfos
}

async function getItemSubFolderInfos(itemPath) {
    const item = fs.lstatSync(itemPath)
    if (!item.isDirectory()) return fs.readFileSync(itemPath, 'utf-8')
    else return await getFolderInfos(itemPath)
}

module.exports = { getFolderInfos, getItemSubFolderInfos }