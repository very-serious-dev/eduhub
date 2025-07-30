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
    const [fullRefreshKey, setFullRefreshKey] = useState(0);

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
    }, [fullRefreshKey]);

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
        if (result.operation === "questionnaire_edited") {
            setMyFiles(old => { return { ...old, questionnaires: old.questionnaires.map(q => result.questionnaire.id === q.id ? result.questionnaire : q) } });
        }
        if (result.operation === "folder_changed") {
            setMyFiles(old => {
                const newFolders = old.folders.map(f => { if (f.id === result.folder.id) return result.folder; else return f });
                return { ...old, folders: newFolders }
            });
        }
        if (result.operation === "document_changed") {
            setMyFiles(old => {
                const newDocuments = old.documents.map(d => {
                    if (d.identifier === result.document.identifier) {
                        const newDocument = result.document;
                        if (result.keep_old_is_protected) { newDocument["is_protected"] = d.is_protected };
                        return newDocument;
                    } else return d;
                });
                return { ...old, documents: newDocuments }
            });
        }
        if (result.operation === "questionnaire_changed") {
            setMyFiles(old => {
                const newQuestionnaires = old.questionnaires.map(q => {
                    if (q.id === result.questionnaire.id) {
                        const newQuestionnaire = result.questionnaire;
                        if (result.keep_old_is_protected) { newQuestionnaire["is_protected"] = q.is_protected };
                        return newQuestionnaire;
                    } else return q;
                });
                return { ...old, questionnaires: newQuestionnaires }
            });
        }
        if (result.operation === "questionnaire_deleted") {
            setMyFiles(old => {
                const newQuestionnaires = old.questionnaires.filter(q => result.removed_questionnaire_id !== q.id);
                return { ...old, questionnaires: newQuestionnaires }
            });
        }
        if (result.operation === "document_deleted") {
            setMyFiles(old => {
                const newDocuments = old.documents.filter(d => result.removed_document_identifier !== d.identifier);
                return { ...old, documents: newDocuments }
            });
        }
        if (result.operation === "files_deleted") {
            // When deleting a folder, backend will CASCADE deletions so we need a full refresh
            setFullRefreshKey(x => x + 1);
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