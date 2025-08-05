
const expandAndExploreMaybeProtectedFolder = (folder, ancestorFolders) => {
    const containsProtectedDocument = folder.children.some(e => (e.type === 'document' || e.type === 'questionnaire') && e.is_protected === true);
    if (containsProtectedDocument) {
        folder.isProtected = true;
        ancestorFolders.forEach(f => f.isProtected = true);
    }
    for (let child of folder.children.filter(e => e.type === 'folder')) {
        expandAndExploreMaybeProtectedFolder(child, [...ancestorFolders, folder]);
    }
}

/**
 * Given a built tree, traverses it and sets 'isProtected = true'
 * to folders that are ancestors of documents with is_protected == true
 */
const generateProtectedFolderAttribute = (tree) => {
    for (let rootFolder of tree.filter(e => e.type === 'folder')) {
        expandAndExploreMaybeProtectedFolder(rootFolder, [])
    }
}

const findAllChildrenAndRecursivelyInsertInto = (folder, remainingFoldersMutable) => {
    for (let i = remainingFoldersMutable.length - 1; i >= 0; i--) {
        if (remainingFoldersMutable[i].parent_folder_id === folder.id) {
            const childFolder = remainingFoldersMutable.splice(i, 1)[0];
            folder.children.push(childFolder);
        }
    }
    for (const child of folder.children.filter(x => x.type === "folder")) {
        findAllChildrenAndRecursivelyInsertInto(child, remainingFoldersMutable);
    }
}

const buildTree = (documentsFoldersQuestionnaires) => {
    const rootDocuments = [];
    const rootQuestionnaires = [];
    const rootFolders = [];
    const nonRootFolders = [];
    const allFoldersById = {}
    documentsFoldersQuestionnaires.folders.forEach(f => {
        allFoldersById[f.id] = { ...f, children: [], type: "folder", isProtected: false };
    });
    documentsFoldersQuestionnaires.documents.forEach(d => {
        // d.folder_id is null if the document doesn't belong to a folder (is at root level)
        // allFoldersById[d.folder_id] is undefined if the folder containing the document isn't found (document shared with me, but not its parent folder)
        if ((d.folder_id === null) || (allFoldersById[d.folder_id] === undefined)) {
            rootDocuments.push({ ...d, type: "document" });
        } else {
            allFoldersById[d.folder_id].children.push({ ...d, type: "document" });
        }
    });
    documentsFoldersQuestionnaires.questionnaires.forEach(q => {
        if ((q.folder_id === null) || (allFoldersById[q.folder_id] === undefined)) {
            rootQuestionnaires.push({ ...q, type: "questionnaire" });
        } else {
            allFoldersById[q.folder_id].children.push({ ...q, type: "questionnaire" });
        }
    });
    Object.values(allFoldersById).forEach(f => {
        if ((f.parent_folder_id === null) || (allFoldersById[f.parent_folder_id] === undefined)) {
            rootFolders.push(f);
        } else {
            nonRootFolders.push(f);
        }
    })
    for (const rootFolder of rootFolders) {
        findAllChildrenAndRecursivelyInsertInto(rootFolder, nonRootFolders);
    }
    const tree = [...rootDocuments, ...rootQuestionnaires, ...rootFolders];
    generateProtectedFolderAttribute(tree);
    return tree;
}

export { buildTree }