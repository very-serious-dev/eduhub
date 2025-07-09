import { useState } from "react";
import CreateOrEditPostForm from "../posts/CreateOrEditPostForm";
import { EduAPIFetch } from "../../../client/APIFetch";
import AreYouSureDialog from "./AreYouSureDialog";

const EditPostDialog = (props) => {
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, ARE_YOU_SURE_DELETE
    const [isLoadingDelete, setLoadingDelete] = useState(false);

    const onDeletePost = () => {
        setLoadingDelete(true);
        EduAPIFetch("POST", `/api/v1/posts/${props.post.id}/amendments`, { post_type: "amend_delete" })
            .then(json => {
                setLoadingDelete(false);
                if (json.success === true) {
                    props.onFinished();
                } else {
                    props.onFinished("Se ha producido un error");
                }
                props.onDismiss();
            })
            .catch(error => {
                setLoadingDelete(false);
                props.onFinished(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }

    return <>
        {popupShown === "ARE_YOU_SURE_DELETE" &&
            <AreYouSureDialog onActionConfirmed={onDeletePost}
                onDismiss={() => { setPopupShown("NONE"); }}
                isLoading={isLoadingDelete}
                dialogMode="DELETE"
                warningMessage={`¿Deseas eliminar esta publicación?`} />}
        {popupShown === "NONE" &&
            <div className="popupOverlayBackground" onClick={e => { e.stopPropagation(); props.onDismiss() }}>
                <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
                    <div className="card dialogBackground">
                        <CreateOrEditPostForm postType="amend_edit"
                            classIdForPostCreation={null}
                            postBeingEdited={props.post}
                            units={props.units}
                            titlePlaceholder="Nuevo título"
                            contentPlaceholder="Edita aquí el contenido"
                            submitText="Publicar modificación"
                            showDatePicker={props.post.kind === "assignment"}
                            showDeleteButton={true}
                            showCreateQuestionnaire={props.post.kind === "assignment"}
                            onDeleteClicked={() => { setPopupShown("ARE_YOU_SURE_DELETE"); }}
                            onFinished={props.onFinished}
                            onDismiss={props.onDismiss} />
                    </div>
                </div>
            </div>}
    </>
}

export default EditPostDialog;