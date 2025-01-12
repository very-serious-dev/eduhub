import { useState } from "react";
import MoveDocumentOrFolderDialog from "../dialogs/MoveDocumentOrFolderDialog";

const FilesElementContextMenuButton = (props) => {
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, CONTEXT_MENU, MOVE, DELETE

    const onClickContextMenu = (event) => {
        event.stopPropagation();
        setPopupShown("CONTEXT_MENU");
    }

    return <>
        <img className="filesElementThreeDotsImg"
            onClick={onClickContextMenu} src="./three_dots.png"></img>
        {popupShown === "CONTEXT_MENU" && <>
            <div className="popupOverlayBackground" onClick={() => { setPopupShown("NONE"); }} />
            <div className="contextMenu dialogBackground" onClick={e => { e.stopPropagation(); }}>
                <div className="contextMenuItem" onClick={() => {setPopupShown("MOVE")}}>➡️ Mover</div>
                <div className="contextMenuItem">❌ Eliminar</div>
            </div></>
        }
        <MoveDocumentOrFolderDialog show={popupShown === "MOVE"}
            onDismiss={() => { setPopupShown("NONE"); }}
            onSuccess={props.onMoveDeleteSuccess}
            onFail={props.onMoveDeleteFail}
            folderId={props.folderId}
            documentId={props.documentId}
            myFilesTree={props.myFilesTree} />
    </>
}

export default FilesElementContextMenuButton;