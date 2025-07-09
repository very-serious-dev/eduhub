import { useState } from "react";
import TabbedActivity from "../common/TabbedActivity";
import CreateOrEditPostForm from "../posts/CreateOrEditPostForm";
import SelectFileDialog from "./SelectFileDialog";

const CreatePostDialog = (props) => {
    const [showSelectFileDialog, setShowSelectFileDialog] = useState(false);
    const [files, setFiles] = useState([]);

    return showSelectFileDialog ?
        <SelectFileDialog files={files} setFiles={setFiles} onDismiss={() => { setShowSelectFileDialog(false) }} />
        : <div className="popupOverlayBackground" onClick={props.onDismiss}>
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
                                showCreateQuestionnaire={false}
                                files={files}
                                setFiles={setFiles}
                                onSelectFileClicked={() => { setShowSelectFileDialog(true) }}
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
                                showCreateQuestionnaire={true}
                                files={files}
                                setFiles={setFiles}
                                onSelectFileClicked={() => { setShowSelectFileDialog(true) }}
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