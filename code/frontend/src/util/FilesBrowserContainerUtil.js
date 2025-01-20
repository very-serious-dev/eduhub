const getStringPathForFolderIdsPath = (folderIdsPath, tree) => {
    let path = "/";
    let subTreeBeingWalked = tree;
    for (let folderId of folderIdsPath) {
        const folderBeingWalked = subTreeBeingWalked.find(f => f.id === folderId);
        path += `${folderBeingWalked.name}/`;
        subTreeBeingWalked = folderBeingWalked.children;
    }
    return path;
}

const getCountRecursively = (accumulated, tree) => {
    if (tree.length === 0) { return accumulated }
    for (const element of tree) {
        if (element.type === "document") {
            accumulated.nDocuments += 1
            accumulated.nBytes += element.size
        } else if (element.type === "folder") {
            accumulated.nFolders += 1
            accumulated = getCountRecursively(accumulated, element.children)
        }
    }
    return accumulated
}

const getElementsCount = (tree) => {
    const count = { nDocuments: 0, nFolders: 0, nBytes: 0 }
    getCountRecursively(count, tree);
    return count;
}

export { getStringPathForFolderIdsPath };
export { getElementsCount };