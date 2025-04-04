import { useState } from "react";
import MoveDocumentOrFolderDialog from "../dialogs/MoveDocumentOrFolderDialog";
import DocuAPIFetch from "../../../client/DocuAPIFetch";
import FilesPermissionsDialog from "../dialogs/FilesPermissionsDialog";
import AreYouSureDialog from "../dialogs/AreYouSureDialog";

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

    const getSelfAndChildrenIds = () => {
        if (props.document) { return { document_ids: [props.document.identifier], folder_ids: [] } }
        if (props.folder) {
            const documentIds = []
            const folderIds = []
            traverseTreeAndAccumulateDocuments(props.folder, documentIds, folderIds);
            return { document_ids: documentIds, folder_ids: folderIds };
        }
    }

    const elementName = () => {
        return props.document ? props.document.name : props.folder.name;
    }

    const onDelete = () => {
        setLoadingDelete(true);
        const body = getSelfAndChildrenIds();
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
        {/* FIXME: right now the cursor: pointer is left on after clicking on the three dots (it shouldn't)*/}
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
            documentId={props.document ? props.document.identifier : undefined}
            folderId={props.folder ? props.folder.id : undefined}
            title={`"${elementName()}" está compartido  con...`}
            subTreeIds={getSelfAndChildrenIds()} />
        <MoveDocumentOrFolderDialog show={popupShown === "MOVE"}
            onDismiss={() => { setPopupShown("NONE"); }}
            onSuccess={props.onMoveDeleteSuccess}
            onFail={props.onMoveDeleteFail}
            folderId={props.folder ? props.folder.id : undefined}
            documentId={props.document ? props.document.identifier : undefined}
            filesTree={props.filesTree} />
        {popupShown === "DELETE" &&
            <AreYouSureDialog onActionConfirmed={onDelete}
                onDismiss={() => { setPopupShown("NONE"); }}
                isLoading={isLoadingDelete}
                dialogMode="DELETE"
                warningMessage={`¿Deseas eliminar "${elementName()}"?${props.folder ? " Todo su contenido será eliminado, y aquello que estaba compartido dejará de ser accesible. Esta acción no se puede deshacer" : " Si estaba compartido, dejará de ser accesible. Esta acción no se puede deshacer"}`} />}
    </>
}

export default FilesElementContextMenuButton;