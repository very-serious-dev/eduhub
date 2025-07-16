import { useEffect, useState } from "react";
import LoadingHUDPage from "./LoadingHUDPage";
import ErrorPage from "./ErrorPage";
import { EduAPIFetch } from "../../client/APIFetch";
import FilesBody from "../components/files/FilesBody";
import { buildTree } from "../../util/TreeBuilder";

const FilesPage = () => {
    const [myFiles, setMyFiles] = useState({ documents: [], folders: [], questionnaires: [] });
    const [sharedFiles, setSharedFiles] = useState({ documents: [], folders: [], questionnaires: [] });
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
            setMyFiles(old => { return { ...old, folders: old.folders.concat(result.folder) } });
        }
        if (result.operation === "documents_added") {
            setMyFiles(old => { return { ...old, documents: [...old.documents, ...result.documents] } });
        }
        if (result.operation === "questionnaire_added") {
            setMyFiles(old => { return { ...old, questionnaires: old.questionnaires.concat(result.questionnaire) } });
        }
        if (result.operation === "folder_changed") {
            setMyFiles(old => {
                const newFolders = old.folders.map(f => { if (f.id === result.folder.id) return result.folder; else return f });
                return { ...old, folders: newFolders }
            });
        }
        if (result.operation === "document_changed") {
            setMyFiles(old => {
                const newDocuments = old.documents.map(d => { if (d.identifier === result.document.identifier) return result.document; else return d });
                return { ...old, documents: newDocuments }
            });
        }
        if (result.operation === "questionnaire_changed") {
            setMyFiles(old => {
                const newQuestionnaires = old.questionnaires.map(q => { if (q.id === result.questionnaire.id) return result.questionnaire; else return q });
                return { ...old, questionnaires: newQuestionnaires }
            });
        }
        if (result.operation === "questionnaire_deleted") {
            setMyFiles(old => {
                const newQuestionnaires = old.questionnaires.filter(q => result.removed_questionnaire_id !== q.id);
                return { ...old, questionnaires: newQuestionnaires }
            });
        }
        if (result.operation === "files_deleted") {
            setMyFiles(old => {
                const newFolders = old.folders.filter(f => !result.removed_folders_ids.includes(f.id));
                const newDocuments = old.documents.filter(d => !result.removed_documents_ids.includes(d.identifier));
                const newQuestionnaires = old.questionnaires.filter(q => !result.removed_questionnaires_ids.includes(q.id));
                return { documents: newDocuments, folders: newFolders, questionnaires: newQuestionnaires }
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