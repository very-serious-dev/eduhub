import CreateOrEditPostForm from "../posts/CreateOrEditPostForm";

const EditPostDialog = (props) => {

    return props.show === true ? <div className="popupOverlayBackground" onClick={e => {e.stopPropagation(); props.onDismiss() }}>
        <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <CreateOrEditPostForm postType="amend_edit"
                    classIdForPostCreation={null}
                    postBeingEdited={props.post}
                    units={props.units}
                    titlePlaceholder="Nuevo título"
                    contentPlaceholder="Edita aquí el contenido"
                    submitText="Modificar"
                    showDatePicker={props.post.kind === "assignment"}
                    onFinished={props.onFinished}
                    onDismiss={props.onDismiss} />
            </div>
        </div></div> : <></>
}

export default EditPostDialog;