import TabbedActivity from "../common/TabbedActivity";
import CreateOrEditPostForm from "../posts/CreateOrEditPostForm";

const CreatePostDialog = (props) => {

    return <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <TabbedActivity tabs={[
                    {
                        title: "Nueva publicación",
                        view: <CreateOrEditPostForm postType="publication"
                            classIdForPostCreation={props.classId}
                            postBeingEdited={null}
                            units={props.units}
                            submitText="Publicar"
                            showDatePicker={false}
                            showDeleteButton={false}
                            onFinished={props.onFinished}
                            onDismiss={props.onDismiss} />
                    },
                    {
                        title: "Nueva tarea",
                        view: <CreateOrEditPostForm postType="assignment"
                            classIdForPostCreation={props.classId}
                            postBeingEdited={null}
                            units={props.units}
                            submitText="Crear tarea"
                            showDatePicker={true}
                            showDeleteButton={false}
                            onFinished={props.onFinished}
                            onDismiss={props.onDismiss} />
                    }]}
                    tabContentWidthPercentage={100}
                    showTitles={true} />
            </div>
        </div>
    </div>
}

export default CreatePostDialog;