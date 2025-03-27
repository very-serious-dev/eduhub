import { useState } from "react";
import MoveDocumentOrFolderDialog from "../dialogs/MoveDocumentOrFolderDialog";
import AreYouSureDeleteDialog from "../dialogs/AreYouSureDeleteDialog";
import DocuAPIFetch from "../../../client/DocuAPIFetch";
import FilesPermissionsDialog from "../dialogs/FilesPermissionsDialog";

const FilesElementContextMenuButton = (props) => {
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, CONTEXT_MENU, SHARE, MOVE, DELETE
    const [isLoadingDelete, setLoadingDelete] = useState(false);

    const onClickContextMenu = (event) => {
        event.stopPropagation();
        setPopupShown("CONTEXT_MENU");
    }

    const traverseTreeAndAccumulateDocuments = (folder, mutableDocumentIds, mutableFolderIds) => {
        if (folder.children.length > 0) {
            for (const child of folder.children) {
                if (child.type === "document") {
                    mutableDocumentIds.push(child.identifier);
                } else if (child.type === "folder") {
                    traverseTreeAndAccumulateDocuments(child, mutableDocumentIds, mutableFolderIds);
                }
            }
        }
        mutableFolderIds.push(folder.id)
    }

    const getIdsToRemove = () => {
        if (props.document) { return { document_ids: [props.document.identifier], folder_ids: [] } }
        if (props.folder) {
            const documentIds = []
            const folderIds = []
            traverseTreeAndAccumulateDocuments(props.folder, documentIds, folderIds);
            return { document_ids: documentIds, folder_ids: folderIds };
        }
    }

    const onDelete = () => {
        setLoadingDelete(true);
        const body = getIdsToRemove();
        DocuAPIFetch("DELETE", `/api/v1/documents`, body)
            .then(json => {
                if (json.success === true) {
                    props.onMoveDeleteSuccess(json.result);
                } else {
                    setLoadingDelete(false);
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
            <div className="popupOverlayBackground" onClick={(e) => { e.stopPropagation(); setPopupShown("NONE"); }} />
            <div className="contextMenu dialogBackground" onClick={e => { e.stopPropagation(); }}>
                <div className="contextMenuItem" onClick={() => { setPopupShown("SHARE") }}>🖐️ Compartir</div>
                <div className="contextMenuItem" onClick={() => { setPopupShown("MOVE") }}>➡️ Mover</div>
                <div className="contextMenuItem" onClick={() => { setPopupShown("DELETE") }}>❌ Eliminar</div>
            </div></>
        }
        <FilesPermissionsDialog show={popupShown === "SHARE"}
            onDismiss={() => { setPopupShown("NONE"); }}
            folderId={props.folder ? props.folder.id : undefined}
            documentId={props.document ? props.document.identifier : undefined} />
        <MoveDocumentOrFolderDialog show={popupShown === "MOVE"}
            onDismiss={() => { setPopupShown("NONE"); }}
            onSuccess={props.onMoveDeleteSuccess}
            onFail={props.onMoveDeleteFail}
            folderId={props.folder ? props.folder.id : undefined}
            documentId={props.document ? props.document.identifier : undefined}
            myFilesTree={props.myFilesTree} />
        {popupShown === "DELETE" && <AreYouSureDeleteDialog show={popupShown === "DELETE"}
            onDismiss={() => { setPopupShown("NONE"); }}
            onActionConfirmed={onDelete}
            isLoading={isLoadingDelete} />}
    </>
}

export default FilesElementContextMenuButton;