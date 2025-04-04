import { useEffect, useState } from "react";
import LoadingHUDPage from "./LoadingHUDPage";
import ErrorPage from "./ErrorPage";
import EduAPIFetch from "../../client/EduAPIFetch";
import FilesBody from "../components/files/FilesBody";

const FilesPage = () => {
    const [documentsAndFolders, setDocumentsAndFolders] = useState({ documents: [], folders: [] });
    const [isRequestFailed, setRequestFailed] = useState(false);
    const [requestErrorMessage, setRequestErrorMessage] = useState();
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        EduAPIFetch("GET", "/api/v1/documents")
            .then(json => {
                setLoading(false);
                setDocumentsAndFolders(json);
            })
            .catch(error => {
                setLoading(false);
                setRequestFailed(true);
                setRequestErrorMessage(error.error ?? "Se ha producido un error");
            })
    }, []);

    const onFilesChanged = (result) => {
        if (result.operation === "folder_added") {
            setDocumentsAndFolders(old => { return { documents: old.documents, folders: old.folders.concat(result.folder) }});
        }
        if (result.operation === "documents_added") {
            setDocumentsAndFolders(old => { return { documents: [...old.documents, ...result.documents], folders: old.folders }});
        }
        if (result.operation === "folder_changed") {
            setDocumentsAndFolders(old => {
                const newFolders = old.folders.map(f => { if (f.id === result.folder.id) return result.folder; else return f });
                return { documents: old.documents, folders: newFolders }
            });
        }
        if (result.operation === "document_changed") {
            setDocumentsAndFolders(old => {
                const newDocuments = old.documents.map(d => { if (d.identifier === result.document.identifier) return result.document; else return d });
                return { documents: newDocuments, folders: old.folders }
            });
        }
        if (result.operation === "files_deleted") {
            setDocumentsAndFolders(old => {
                const newFolders = old.folders.filter(f => !result.removed_folders_ids.includes(f.id));
                const newDocuments = old.documents.filter(d => !result.removed_documents_ids.includes(d.identifier));
                return { documents: newDocuments, folders: newFolders }
            });
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
     * where documents that belong to a folder are.
     * - Orphan documents (e.g.: documents at root level) aren't taken into account
     * - Folders are still not put inside the 'children' attribute (the tree isn't fully built)
     */
    const flatFoldersWithDocumentsInside = () => {
        const allFoldersById = {}
        documentsAndFolders.folders.forEach(f => {
            allFoldersById[f.id] = { ...f, children: [] };
        });
        documentsAndFolders.documents.forEach(d => {
            // d.folder_id is null if the document doesn't belong to a folder (e.g.: is at root level)
            // allFoldersById[d.folder_id] is undefined if the folder containing the document isn't found
            // I'm not sure whether this could ever happen, but I'm leaving that here as that might happen
            // after deletion errors, I believe
            if ((d.folder_id !== null) && (allFoldersById[d.folder_id] !== undefined)) {
                allFoldersById[d.folder_id].children.push({ ...d, type: "document" });
            }
        });
        const allFolders = []
        for (let folderId of Object.keys(allFoldersById)) {
            const f = allFoldersById[folderId]
            allFolders.push({ ...f, type: "folder" });
        }
        return allFolders;
    }

    const buildTree = () => {
        const allFolders = flatFoldersWithDocumentsInside();
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
        // As a final step, add the root-level documents that have noot been taken into
        // consideration yet (see `flatFoldersWithDocumentsInside`)
        documentsAndFolders.documents.forEach(d => {
            if (d.folder_id === null) {
                tree.push({ ...d, type: "document" })
            }
        });
        return tree;
    }

    return isLoading ?
        <LoadingHUDPage />
        : isRequestFailed ?
            <ErrorPage errorMessage={requestErrorMessage} />
            : <FilesBody myFilesTree={buildTree()}
                onFilesChanged={onFilesChanged} />
}

export default FilesPage;