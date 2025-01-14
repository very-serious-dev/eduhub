import { useState } from "react";
import MoveDocumentOrFolderDialog from "../dialogs/MoveDocumentOrFolderDialog";
import AreYouSureDeleteDialog from "../dialogs/AreYouSureDeleteDialog";
import DocuAPIFetch from "../../../client/DocuAPIFetch";
import EduAPIFetch from "../../../client/EduAPIFetch";

const FilesElementContextMenuButton = (props) => {
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, CONTEXT_MENU, MOVE, DELETE
    const [isLoadingDelete, setLoadingDelete] = useState(false);

    const onClickContextMenu = (event) => {
        event.stopPropagation();
        setPopupShown("CONTEXT_MENU");
    }

    const traverseTreeAndAccumulateDocuments = (folder, mutableAccumulatedDocumentIds) => {
        if (folder.children.length > 0) {
            for (const child of folder.children) {
                if (child.type === "document") {
                    mutableAccumulatedDocumentIds.push(child.identifier);
                } else if (child.type === "folder") {
                    traverseTreeAndAccumulateDocuments(child, mutableAccumulatedDocumentIds);
                }
            }
        }
    }

    const getDocumentIds = () => {
        if (props.document) { return [ props.document.identifier ] }
        if (props.folder) {
            const documentIds = []
            traverseTreeAndAccumulateDocuments(props.folder, documentIds);
            return documentIds;
        }
    }

    // TODO: Pending tasks:
    // - Maximum number of files/documents/hard disk space per user
    // - Sharing files and folders

    const onDelete = () => {
        setLoadingDelete(true);
        const documentIds = getDocumentIds();
        if (documentIds.length === 0) {
            sendEduAPIDeleteRequest();
        } else {
            DocuAPIFetch("DELETE", `/api/v1/documents`, { ids: documentIds })
                .then(json => {
                    if (json.success === true) {
                        sendEduAPIDeleteRequest();
                    } else {
                        setLoadingDelete(false);
                        setPopupShown("NONE");
                        props.onMoveDeleteFail("Se ha producido un error");
                    }
                })
                .catch(error => {
                    setLoadingDelete(false);
                    setPopupShown("NONE");
                    props.onMoveDeleteFail(error.error ?? "Se ha producido un error");
                })
        }
    }

    const sendEduAPIDeleteRequest = () => {
        setLoadingDelete(true);
        let url;
        if (props.folder) {
            url = `/api/v1/folders/${props.folder.id}`;
        } else if (props.document) {
            url = `/api/v1/documents/${props.document.id}`;
        }
        EduAPIFetch("DELETE", url, {})
            .then(json => {
                setLoadingDelete(false);
                if (json.success === true) {
                    props.onMoveDeleteSuccess(json.result);
                } else {
                    props.onMoveDeleteFail("Se ha producido un error");
                }
                setPopupShown("NONE");
            })
            .catch(error => {
                setLoadingDelete(false);
                setPopupShown("NONE");
                props.onMoveDeleteFail(error.error ?? "Se ha producido un error");
            })
    }

    return <>
        <img className="filesElementThreeDotsImg"
            onClick={onClickContextMenu} src="./three_dots.png"></img>
        {popupShown === "CONTEXT_MENU" && <>
            <div className="popupOverlayBackground" onClick={() => { setPopupShown("NONE"); }} />
            <div className="contextMenu dialogBackground" onClick={e => { e.stopPropagation(); }}>
                <div className="contextMenuItem" onClick={() => { setPopupShown("MOVE") }}>➡️ Mover</div>
                <div className="contextMenuItem" onClick={() => { setPopupShown("DELETE") }}>❌ Eliminar</div>
            </div></>
        }
        <MoveDocumentOrFolderDialog show={popupShown === "MOVE"}
            onDismiss={() => { setPopupShown("NONE"); }}
            onSuccess={props.onMoveDeleteSuccess}
            onFail={props.onMoveDeleteFail}
            folderId={props.folderId}
            documentId={props.documentId}
            myFilesTree={props.myFilesTree} />
        {popupShown === "DELETE" && <AreYouSureDeleteDialog show={popupShown === "DELETE"}
            onDismiss={() => { setPopupShown("NONE"); }}
            onActionConfirmed={onDelete}
            isLoading={isLoadingDelete} />}
    </>
}

export default FilesElementContextMenuButton;