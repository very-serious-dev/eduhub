import { useEffect, useState } from "react";
import LoadingHUDPage from "./LoadingHUDPage";
import ErrorPage from "./ErrorPage";
import { EduAPIFetch } from "../../client/APIFetch";
import FilesBody from "../components/files/FilesBody";
import { buildTree } from "../../util/TreeBuilder";

const FilesPage = () => {
    const [myFiles, setMyFiles] = useState({ documents: [], folders: [] });
    const [sharedFiles, setSharedFiles] = useState({ documents: [], folders: [] });
    const [isRequestFailed, setRequestFailed] = useState(false);
    const [requestErrorMessage, setRequestErrorMessage] = useState();
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        document.title = "Mis archivos";
    }, []);

    useEffect(() => {
        EduAPIFetch("GET", "/api/v1/documents")
            .then(json => {
                setLoading(false);
                setMyFiles(json.my_files);
                setSharedFiles(json.shared_with_me);
            })
            .catch(error => {
                setLoading(false);
                setRequestFailed(true);
                setRequestErrorMessage(error.error ?? "Se ha producido un error");
            })
    }, []);

    const onMyFilesChanged = (result) => {
        if (result.operation === "folder_added") {
            setMyFiles(old => { return { documents: old.documents, folders: old.folders.concat(result.folder) } });
        }
        if (result.operation === "documents_added") {
            setMyFiles(old => { return { documents: [...old.documents, ...result.documents], folders: old.folders } });
        }
        if (result.operation === "folder_changed") {
            setMyFiles(old => {
                const newFolders = old.folders.map(f => { if (f.id === result.folder.id) return result.folder; else return f });
                return { documents: old.documents, folders: newFolders }
            });
        }
        if (result.operation === "document_changed") {
            setMyFiles(old => {
                const newDocuments = old.documents.map(d => { if (d.identifier === result.document.identifier) return result.document; else return d });
                return { documents: newDocuments, folders: old.folders }
            });
        }
        if (result.operation === "files_deleted") {
            setMyFiles(old => {
                const newFolders = old.folders.filter(f => !result.removed_folders_ids.includes(f.id));
                const newDocuments = old.documents.filter(d => !result.removed_documents_ids.includes(d.identifier));
                return { documents: newDocuments, folders: newFolders }
            });
        }
    }

    return isLoading ?
        <LoadingHUDPage />
        : isRequestFailed ?
            <ErrorPage errorMessage={requestErrorMessage} />
            : <FilesBody myFilesTree={buildTree(myFiles)}
                sharedFilesTree={buildTree(sharedFiles)}
                onMyFilesChanged={onMyFilesChanged} />
}

export default FilesPage;