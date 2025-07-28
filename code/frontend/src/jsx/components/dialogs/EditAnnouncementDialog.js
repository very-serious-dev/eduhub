import { useState } from "react";
import { EduAPIFetch } from "../../../client/APIFetch";
import AreYouSureDialog from "./AreYouSureDialog";
import CreateOrEditAnnouncementForm from "../announcements/CreateOrEditAnnouncementForm";

const EditAnnouncementDialog = (props) => {
    const [showAreYouSure, setShowAreYouSure] = useState(false);
    const [isLoadingDelete, setLoadingDelete] = useState(false);

    const onDeleteAnnouncement = () => {
        setLoadingDelete(true);
        EduAPIFetch("DELETE", `/api/v1/announcements/${props.announcement.id}`)
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

    return showAreYouSure ?
        <AreYouSureDialog onActionConfirmed={onDeleteAnnouncement}
            onDismiss={() => { setShowAreYouSure(false); }}
            isLoading={isLoadingDelete}
            dialogMode="DELETE"
            warningMessage={`¿Deseas eliminar este anuncio?`} />
        : <div className="popupOverlayBackground" onClick={e => { e.stopPropagation(); props.onDismiss() }}>
            <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
                <div className="card dialogBackground">
                    <CreateOrEditAnnouncementForm
                        groupId={null}
                        announcementBeingEdited={props.announcement}
                        submitText="Publicar modificación"
                        showDeleteButton={true}
                        onDeleteClicked={() => { setShowAreYouSure(true); }}
                        onFinished={props.onFinished}
                        onDismiss={props.onDismiss} />
                </div>
            </div>
        </div>
}

export default EditAnnouncementDialog;