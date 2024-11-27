import TabbedActivity from "../common/TabbedActivity";
import CreatePostTabForm from "../posts/CreatePostTabForm";

const CreatePostDialog = (props) => {

    return props.show === true ? <div className="popupOverlayBackground" onClick={props.onDismiss}>
    <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
        <div className="card dialogBackground">
            <TabbedActivity tabs={[
                {
                    title: "Nueva publicación",
                    view: <CreatePostTabForm classId={props.classId}
                            units={props.units}
                            onPostAdded={props.onPostAdded}
                            onDismiss={props.onDismiss} />
                },
                {
                    title: "Nueva tarea",
                    view: <CreatePostTabForm classId={props.classId}
                            units={props.units}
                            onPostAdded={props.onPostAdded}
                            onDismiss={props.onDismiss} />
                },
            ]}/>
        </div>
    </div></div> : <></>
}

export default CreatePostDialog;