import CreateOrEditAnnouncementForm from "../announcements/CreateOrEditAnnouncementForm";

const CreateAnnouncementDialog = (props) => {

    return <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <CreateOrEditAnnouncementForm
                    groupTag={props.groupTag}
                    announcementBeingEdited={null}
                    submitText="Publicar"
                    showDeleteButton={false}
                    onDeleteClicked={null}
                    onFinished={props.onFinished}
                    onDismiss={props.onDismiss} />
            </div>
        </div>
    </div>
}

export default CreateAnnouncementDialog;