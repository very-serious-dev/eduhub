const getFolderNamesForFolderIdsPath = (folderIdsPath, tree) => {
    let path = [];
    let subTreeBeingWalked = tree;
    for (let folderId of folderIdsPath) {
        const folderBeingWalked = subTreeBeingWalked.filter(e => e.type === 'folder').find(f => f.id === folderId);
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
        } else if (element.type === "questionnaire") {
            accumulated.nQuestionnaires += 1
        } else if (element.type === "folder") {
            accumulated.nFolders += 1
            accumulated = getCountRecursively(accumulated, element.children)
        }
    }
    return accumulated
}

const getElementsCount = (tree) => {
    const count = { nDocuments: 0, nFolders: 0, nBytes: 0, nQuestionnaires: 0 }
    getCountRecursively(count, tree);
    return count;
}

const traverseTreeAndAccumulateDocuments = (folder, mutableDocumentIds, mutableFolderIds, mutableQuestionnaireIds) => {
    if (folder.children.length > 0) {
        for (const child of folder.children) {
            if (child.type === "document") {
                mutableDocumentIds.push(child.identifier);
            } else if (child.type === "questionnaire") {
                mutableQuestionnaireIds.push(child.id);
            } else if (child.type === "folder") {
                traverseTreeAndAccumulateDocuments(child, mutableDocumentIds, mutableFolderIds, mutableQuestionnaireIds);
            }
        }
    }
    mutableFolderIds.push(folder.id)
}

const getSelfAndSubTreeIds = (folder) => {
    const documentIds = []
    const folderIds = []
    const questionnaireIds = []
    traverseTreeAndAccumulateDocuments(folder, documentIds, folderIds, questionnaireIds);
    return { document_ids: documentIds, folder_ids: folderIds, questionnaire_ids: questionnaireIds };
}

const getSelfAndSubTreeIdsForQueryParam = (folder) => {
    const selfAndSubTreeIds = getSelfAndSubTreeIds(folder);

    let queryParam = "?";
    if (selfAndSubTreeIds.document_ids.length > 0) {
        queryParam += "documentIds=" + selfAndSubTreeIds.document_ids.join(",");
        queryParam += "&";
    }
    if (selfAndSubTreeIds.folder_ids.length > 0) {
        queryParam += "folderIds=" + selfAndSubTreeIds.folder_ids.join(",");
        queryParam += "&";
    }
    if (selfAndSubTreeIds.questionnaire_ids.length > 0) {
        queryParam += "questionnaireIds=" + selfAndSubTreeIds.questionnaire_ids.join(",");
    }
    return queryParam;
}

export { getFolderNamesForFolderIdsPath };
export { getElementsCount };
export { getSelfAndSubTreeIds };
export { getSelfAndSubTreeIdsForQueryParam };
