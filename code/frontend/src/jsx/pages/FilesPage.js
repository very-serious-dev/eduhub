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
    const [refreshKey, setRefreshKey] = useState(0);

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
    }, [refreshKey]);

    const onFilesChanged = () => {
        setRefreshKey(x => x + 1);
    }

    const findAllChildrenAndRecursivelyInsertInto = (folder, remainingFoldersMutable) => {
        if (remainingFoldersMutable.length === 0) { return; }
        for (let i = remainingFoldersMutable.length - 1; i >= 0; i--) {
            if (remainingFoldersMutable[i].parent_folder_id === folder.id) {
                const childFolder = remainingFoldersMutable.splice(i, 1);
                folder.children.push(childFolder);
            }
        }
        for (const child of folder.children) {
            findAllChildrenAndRecursivelyInsertInto(child, remainingFoldersMutable);
        }
    }

    const flatFoldersWithDocumentsInside = () => {
        const allFoldersById = {}
        documentsAndFolders.folders.forEach(f => {
            allFoldersById[f.id] = { ...f, children: [] };
        });
        documentsAndFolders.documents.forEach(d => {
            allFoldersById[d.folder_id].children.push(d);
        });
        return Object.entries(allFoldersById);
    }

    const documentsTree = () => {
        const allFolders = flatFoldersWithDocumentsInside();
        const tree = [];
        const remainingNonRootFolders = []
        for (const folder of allFolders) {
            if (folder.parent_folder_id) {
                remainingNonRootFolders.push(folder);
            } else {
                tree.push(folder)
            }
        }
        for (const rootFolder of tree) {
            findAllChildrenAndRecursivelyInsertInto(rootFolder, remainingNonRootFolders);
        }
        return tree;
    }

    return isLoading ?
        <LoadingHUDPage />
        : isRequestFailed ?
            <ErrorPage errorMessage={requestErrorMessage} />
            : <FilesBody tree={documentsTree()} onFilesChanged={onFilesChanged} />
}

export default FilesPage;