
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

/**
 * Returns an array containing all the folders with a new synthetic attribute 'children'
 * where [only] documents/questionnaires that belong to a folder are.
 * - Orphan documents/questionnaires (e.g.: at root level) aren't taken into account
 * - Folders are still not put inside the 'children' attribute (the tree isn't fully built)
 */
const flatFoldersWithDocumentsInside = (documentsFoldersQuestionnaires) => {
    const allFoldersById = {}
    documentsFoldersQuestionnaires.folders.forEach(f => {
        allFoldersById[f.id] = { ...f, children: [], type: "folder", isProtected: false };
    });
    documentsFoldersQuestionnaires.documents.forEach(d => {
        // d.folder_id is null if the document doesn't belong to a folder (e.g.: is at root level)
        // allFoldersById[d.folder_id] is undefined if the folder containing the document isn't found
        // I'm not sure whether this could ever happen, but I'm leaving that here as that might happen
        // after deletion errors, I believe
        if ((d.folder_id !== null) && (allFoldersById[d.folder_id] !== undefined)) {
            allFoldersById[d.folder_id].children.push({ ...d, type: "document" });
        }
    });
    documentsFoldersQuestionnaires.questionnaires.forEach(q => {
        if ((q.folder_id !== null) && (allFoldersById[q.folder_id] !== undefined)) {
            allFoldersById[q.folder_id].children.push({ ...q, type: "questionnaire" });
        }
    });
    return Object.values(allFoldersById);
}

const buildTree = (documentsFoldersQuestionnaires) => {
    const allFolders = flatFoldersWithDocumentsInside(documentsFoldersQuestionnaires);
    const tree = [];
    const remainingNonRootFolders = []
    for (const folder of allFolders) {
        if (folder.parent_folder_id) {
            remainingNonRootFolders.push(folder);
        } else {
            tree.push(folder);
        }
    }
    for (const rootFolder of tree) {
        findAllChildrenAndRecursivelyInsertInto(rootFolder, remainingNonRootFolders);
    }
    // As a final step, add the root-level documents/questionnaires that have noot been taken into
    // consideration yet (see `flatFoldersWithDocumentsInside`)
    documentsFoldersQuestionnaires.documents.forEach(d => {
        if (d.folder_id === null) {
            tree.push({ ...d, type: "document" })
        }
    });
    documentsFoldersQuestionnaires.questionnaires.forEach(q => {
        if (q.folder_id === null) {
            tree.push({ ...q, type: "questionnaire" })
        }
    });
    generateProtectedFolderAttribute(tree);
    return tree;
}

export { buildTree }