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

export { getStringPathForFolderIdsPath };