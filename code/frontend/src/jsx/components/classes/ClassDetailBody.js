import { useContext, useState } from "react";
import ClassParticipantsDialog from "../dialogs/ClassParticipantsDialog";
import { FeedbackContext, ThemeContext } from "../../main/GlobalContainer";
import CreateEditDeleteUnitDialog from "../dialogs/CreateEditDeleteUnitDialog";
import PostsBoard from "../posts/PostsBoard";
import ClassDetailDrawerSectionUnits from "./ClassDetailDrawerSectionUnits";
import ClassDetailDrawerSectionTitle from "./ClassDetailDrawerSectionTitle";
import ClassDetailDrawerSectionAssignments from "./ClassDetailDrawerSectionAssignments";
import { EDU_SERVER } from "../../../client/Servers";
import { pointableSecondary, primary } from "../../../util/Themes";

const ClassDetailBody = (props) => {
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, PARTICIPANTS, CREATE_EDIT_UNIT
    const [unitForPopup, setUnitForPopup] = useState({ id: undefined, name: undefined });
    const setFeedback = useContext(FeedbackContext);
    const theme = useContext(ThemeContext);

    const onOperationFinished = (errorMessage) => { // Unit Added/Edited/Deleted; Post Created/Edited/Deleted
        if (errorMessage === undefined || errorMessage === "") {
            setFeedback({ type: "success", message: "Completado con éxito" });
            props.onShouldRefresh();
        } else {
            setFeedback({ type: "error", message: errorMessage });
        }
    }

    const onClickDownloadScores = () => {
        window.open(`${EDU_SERVER}/api/v1/classes/${props.classData.id}/scores`, "_blank");
    }

    return <>
        {popupShown === "CREATE_EDIT_UNIT" && <CreateEditDeleteUnitDialog classId={props.classData.id}
            unit={unitForPopup}
            onOperationDone={onOperationFinished}
            onDismiss={() => { setPopupShown("NONE"); setUnitForPopup({ id: undefined, name: undefined }) }} />}
        {popupShown === "PARTICIPANTS" && <ClassParticipantsDialog classroom={props.classData}
            shouldShowEditButton={props.classData.should_show_teacher_options}
            onDismiss={() => { setPopupShown("NONE") }} />}
        <div className="classDetailBodyContainer">
            <div className="classDetailBodyColumn1">
                <PostsBoard classData={props.classData} searchedText={props.searchedText} onPostsChanged={onOperationFinished} />
            </div>
            <div className="classDetailBodyColumn2">
                <ClassDetailDrawerSectionAssignments classData={props.classData} />
                <ClassDetailDrawerSectionUnits classData={props.classData}
                    onFilterPostsByUnit={props.onFilterPostsByUnit}
                    onClickEditUnit={unit => { setPopupShown("CREATE_EDIT_UNIT"); setUnitForPopup(unit) }}
                    onClickNewUnit={() => { setPopupShown("CREATE_EDIT_UNIT"); }} />
                <div>
                    <ClassDetailDrawerSectionTitle title="👤 Participantes" />
                    <div className={`card classDetailBubbleButton pointable ${primary(theme)} ${pointableSecondary(theme)}`} onClick={() => { setPopupShown("PARTICIPANTS"); }}>Ver participantes</div>
                </div>
                {props.classData.should_show_teacher_options &&
                    <div>
                        <ClassDetailDrawerSectionTitle title="🎓 Calificaciones" />
                        <div className={`card classDetailBubbleButton pointable ${primary(theme)} ${pointableSecondary(theme)}`} onClick={onClickDownloadScores}>⬇️ Descargar notas</div>
                    </div>}
            </div>
        </div>
    </>

}

export default ClassDetailBody;