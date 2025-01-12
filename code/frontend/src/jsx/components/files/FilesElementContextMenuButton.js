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

    // TODO: Implement deleting non-empty folders by traversing them and
    // removing all subitems 
    // 
    // Pending tasks:
    // - Maximum number of files/documents/hard disk space per user
    // - Sharing files and folders
    
    const onDelete = () => {
        setLoadingDelete(true);
        if (props.folderId) {
            sendEduAPIDeleteRequest();
        } else if (props.documentId) {
            DocuAPIFetch("DELETE", `/api/v1/documents/${props.documentId}`, {})
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
        if (props.folderId) {
            url = `/api/v1/folders/${props.folderId}`;
        } else if (props.documentId) {
            url = `/api/v1/documents/${props.documentId}`;
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