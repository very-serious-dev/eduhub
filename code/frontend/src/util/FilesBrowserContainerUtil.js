const getFolderNamesForFolderIdsPath = (folderIdsPath, tree) => {
    let path = [];
    let subTreeBeingWalked = tree;
    for (let folderId of folderIdsPath) {
        const folderBeingWalked = subTreeBeingWalked.find(f => f.id === folderId);
        path.push(folderBeingWalked.name);
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

const traverseTreeAndAccumulateDocuments = (folder, mutableDocumentIds, mutableFolderIds) => {
    if (folder.children.length > 0) {
        for (const child of folder.children) {
            if (child.type === "document") {
                mutableDocumentIds.push(child.identifier);
            } else if (child.type === "folder") {
                traverseTreeAndAccumulateDocuments(child, mutableDocumentIds, mutableFolderIds);
            }
        }
    }
    mutableFolderIds.push(folder.id)
}

const getSelfAndSubTreeIds = (document, folder) => {
    if (document) { return { document_ids: [document.identifier], folder_ids: [] } }
    if (folder) {
        const documentIds = []
        const folderIds = []
        traverseTreeAndAccumulateDocuments(folder, documentIds, folderIds);
        return { document_ids: documentIds, folder_ids: folderIds };
    }
}

const getSelfAndSubTreeIdsForQueryParam = (document, folder) => {
    const selfAndSubTreeIds = getSelfAndSubTreeIds(document, folder);

    let queryParam = "";
    if (selfAndSubTreeIds.document_ids.length > 0) {
        queryParam += "?documentIds=" + selfAndSubTreeIds.document_ids.join(",");
    }
    if (selfAndSubTreeIds.folder_ids.length > 0) {
        queryParam += (queryParam.length > 0) ? "&" : "?";
        queryParam += "folderIds=" + selfAndSubTreeIds.folder_ids.join(",");
    }
    return queryParam;
}

export { getFolderNamesForFolderIdsPath };
export { getElementsCount };
export { getSelfAndSubTreeIds };
export { getSelfAndSubTreeIdsForQueryParam };
