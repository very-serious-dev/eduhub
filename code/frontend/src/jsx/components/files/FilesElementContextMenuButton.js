import { useState } from "react";
import { DocuAPIFetch, EduAPIFetch } from "../../../client/APIFetch";
import FilesPermissionsDialog from "../dialogs/FilesPermissionsDialog";
import AreYouSureDialog from "../dialogs/AreYouSureDialog";
import { getSelfAndSubTreeIds } from "../../../util/FilesBrowserContainerUtil";
import MoveFileDialog from "../dialogs/MoveFileDialog";

const FilesElementContextMenuButton = (props) => {
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, CONTEXT_MENU, SHARE, MOVE, DELETE
    const [isLoadingDelete, setLoadingDelete] = useState(false);

    const onClickContextMenu = (event) => {
        event.stopPropagation();
        setPopupShown("CONTEXT_MENU");
    }

    const elementName = () => {
        if (props.document) { return props.document.name }
        if (props.folder) { return props.folder.name }
        if (props.questionnaire) { return props.questionnaire.title }
    }

    const isProtected = () => {
        if (props.document) { return props.document.is_protected }
        if (props.folder) { return props.folder.isProtected }
        if (props.questionnaire) { return props.questionnaire.is_protected }
    }

    const onDelete = () => {
        setLoadingDelete(true);
        if (props.questionnaire) {
            deleteQuestionnaireFromEduRest();
        } else {
            deleteDocumentOrMaybeUnemptyFolderFromDocuRest();
        }
    }

    const deleteQuestionnaireFromEduRest = () => {
        EduAPIFetch("DELETE", `/api/v1/questionnaires/${props.questionnaire.id}`)
            .then(json => {
                if (json.success === true) {
                    props.onMoveDeleteSuccess(json.result);
                } else {
                    props.onMoveDeleteFail("Se ha producido un error");
                }
                setLoadingDelete(false);
                setPopupShown("NONE");
            })
            .catch(error => {
                setLoadingDelete(false);
                setPopupShown("NONE");
                props.onMoveDeleteFail(error.error ?? "Se ha producido un error");
            })
    }

    const deleteDocumentOrMaybeUnemptyFolderFromDocuRest = () => {
        let body;
        if (props.document) {
            body = { document_ids: props.document.identifier, folder_ids: [], questionnaire_ids: [] }
        } else if (props.folder) {
            body = getSelfAndSubTreeIds(props.folder);
        }
        DocuAPIFetch("DELETE", `/api/v1/documents`, body)
            .then(json => {
                if (json.success === true) {
                    props.onMoveDeleteSuccess(json.result);
                } else {
                    props.onMoveDeleteFail("Se ha producido un error");
                }
                setLoadingDelete(false);
                setPopupShown("NONE");
            })
            .catch(error => {
                setLoadingDelete(false);
                setPopupShown("NONE");
                props.onMoveDeleteFail(error.error ?? "Se ha producido un error");
            })
    }

    return <>
        <img className="filesElementThreeDotsImg pointable"
            onClick={onClickContextMenu} src="./small/three_dots.png"></img>
        {popupShown === "CONTEXT_MENU" && <>
            <div className="popupOverlayBackground" onClick={(e) => { e.stopPropagation(); setPopupShown("NONE"); }} />
            <div className="contextMenu dialogBackground" onClick={e => { e.stopPropagation(); }}>
                <div className="contextMenuItem pointable" onClick={() => { setPopupShown("SHARE") }}>🖐️ Compartir</div>
                <div className="contextMenuItem pointable" onClick={() => { setPopupShown("MOVE") }}>➡️ Mover</div>
                {!isProtected() && <div className="contextMenuItem pointable" onClick={() => { setPopupShown("DELETE") }}>❌ Eliminar</div>}
            </div></>
        }
        {popupShown === "SHARE" && <FilesPermissionsDialog onDismiss={() => { setPopupShown("NONE"); }}
            document={props.document}
            questionnaire={props.questionnaire}
            folder={props.folder}
            title={`"${elementName()}" está compartido  con...`} />}
        {popupShown === "MOVE" && <MoveFileDialog onDismiss={() => { setPopupShown("NONE"); }}
            onSuccess={props.onMoveDeleteSuccess}
            onFail={props.onMoveDeleteFail}
            document={props.document}
            questionnaire={props.questionnaire}
            folder={props.folder}
            filesTree={props.filesTree} />}
        {popupShown === "DELETE" &&
            <AreYouSureDialog onActionConfirmed={onDelete}
                onDismiss={() => { setPopupShown("NONE"); }}
                isLoading={isLoadingDelete}
                dialogMode="DELETE"
                warningMessage={`¿Deseas eliminar "${elementName()}"?${props.folder ? " Todo su contenido será eliminado, y aquello que estaba compartido dejará de ser accesible. Esta acción no se puede deshacer" : " Si estaba compartido, dejará de ser accesible. Esta acción no se puede deshacer"}`} />}
    </>
}

export default FilesElementContextMenuButton;