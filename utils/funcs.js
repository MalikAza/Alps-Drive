const fs = require('fs')

async function _getItemInfos(item) {
    // Defaults (folder) atrbs
    let infos = {
        name: item.name,
        isFolder: true
    }
    // File atrbs
    if (!item.isDirectory()) {
        infos.isFolder = false
        infos.size = (await fs.promises.stat(`${__dirname}/drive/${item.name}`)).size
    }
    
    return infos
}

/**
 * This function reads the contents of a directory and returns an array of information about each item
 * in the directory.
 * @returns The `getDriveInfos` function is returning an array of objects containing information about
 * the files and directories in the `./drive` directory. The information is obtained by calling the
 * `_getItemInfos` function on each file or directory in the `./drive` directory using `Promise.all` to
 * execute the calls concurrently.
 */
async function getDriveInfos() {
    let infos = []
    const items = await fs.promises.readdir('./drive', {withFileTypes: true})
    await Promise.all(items.map(async (fd) => {
        return infos.push(await _getItemInfos(fd))
    }))

    return infos
}

module.exports = { getDriveInfos }