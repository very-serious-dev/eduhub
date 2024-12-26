import { useContext, useState } from "react";
import ClassParticipantsDialog from "../dialogs/ClassParticipantsDialog";
import AddParticipantToClassDialog from "../dialogs/AddParticipantToClassDialog";
import { FeedbackContext } from "../../main/GlobalContainer";
import CreateEditDeleteUnitDialog from "../dialogs/CreateEditDeleteUnitDialog";
import PostsBoard from "../posts/PostsBoard";
import ClassDetailDrawerSectionUnits from "./ClassDetailDrawerSectionUnits";
import ClassDetailDrawerSectionTitle from "./ClassDetailDrawerSectionTitle";
import ClassDetailDrawerSectionAssignments from "./ClassDetailDrawerSectionAssignments";

const ClassDetailBody = (props) => {
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, PARTICIPANTS, ADD_PARTICIPANT, CREATE_EDIT_UNIT
    const [unitForPopup, setUnitForPopup] = useState({ id: undefined, name: undefined });
    const setFeedback = useContext(FeedbackContext);

    const onUserAdded = (errorMessage) => {
        if (errorMessage === undefined || errorMessage === "") {
            setFeedback({ type: "success", message: "Usuario(s) añadido(s) con éxito" });
        } else {
            setFeedback({ type: "error", message: errorMessage });
        }
    }

    const onOperationFinished = (errorMessage) => { // Unit Added Or Edited Or Deleted; Post Created
        if (errorMessage === undefined || errorMessage === "") {
            setFeedback({ type: "success", message: "Completado con éxito" });
            props.onShouldRefresh();
        } else {
            setFeedback({ type: "error", message: errorMessage });
        }
    }

    return <>
        <CreateEditDeleteUnitDialog show={popupShown === "CREATE_EDIT_UNIT"}
            classId={props.classData.id}
            unit={unitForPopup}
            onOperationDone={onOperationFinished}
            onDismiss={() => { setPopupShown("NONE"); setUnitForPopup({ id: undefined, name: undefined }) }} />
        <ClassParticipantsDialog show={popupShown === "PARTICIPANTS"}
            classId={props.classData.id}
            shouldShowEditButton={props.classData.should_show_edit_button}
            onWantsToAddParticipant={() => { setPopupShown("ADD_PARTICIPANT") }}
            onDismiss={() => { setPopupShown("NONE") }} />
        <AddParticipantToClassDialog show={popupShown === "ADD_PARTICIPANT"}
            classId={props.classData.id}
            classroomName={props.classData.name}
            onUserAdded={onUserAdded}
            onDismiss={() => { setPopupShown("NONE") }} />
        <div className="classDetailBodyContainer">
            <div className="classDetailBodyColumn1">
                <PostsBoard classData={props.classData} searchedText={props.searchedText} onPostAdded={onOperationFinished} />
            </div>
            <div className="classDetailBodyColumn2">
                <ClassDetailDrawerSectionAssignments classData={props.classData} />
                <ClassDetailDrawerSectionUnits classData={props.classData}
                    onFilterPostsByUnit={props.onFilterPostsByUnit}
                    onClickEditUnit={unit => { setPopupShown("CREATE_EDIT_UNIT"); setUnitForPopup(unit) }}
                    onClickNewUnit={() => { setPopupShown("CREATE_EDIT_UNIT"); }} />
                <div>
                    <ClassDetailDrawerSectionTitle title="👤 Participantes" />
                    <div className="card classDetailBubbleButton" onClick={() => { setPopupShown("PARTICIPANTS"); }}>Ver participantes</div>
                </div>
            </div>
        </div>
    </>

}

export default ClassDetailBody;