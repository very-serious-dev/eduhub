import { useContext, useState } from "react";
import ClassParticipantsDialog from "../dialogs/ClassParticipantsDialog";
import AddParticipantToClassDialog from "../dialogs/AddParticipantToClassDialog";
import { FeedbackContext } from "../../main/GlobalContainer";
import ClassDetailBodyUnitItem from "./ClassDetailBodyUnitItem";
import CreateEditDeleteUnitDialog from "../dialogs/CreateEditDeleteUnitDialog";
import PostsBoard from "../posts/PostsBoard";

const ClassDetailBody = (props) => {
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, PARTICIPANTS, ADD_PARTICIPANT, CREATE_EDIT_UNIT
    const [unitForPopup, setUnitForPopup] = useState({id: undefined, name: undefined});
    const setFeedback = useContext(FeedbackContext);

    const onUserAdded = (errorMessage) => {
        if (errorMessage === undefined || errorMessage === "") {
            setFeedback({type: "success", message: "Usuario(s) añadido(s) con éxito"});
        } else {
            setFeedback({type: "error", message: errorMessage});
        }
    }

    const onUnitAddedOrEditedOrDeleted = (errorMessage) => {
        if (errorMessage === undefined || errorMessage === "") {
            setFeedback({type: "success", message: "Operación realizada con éxito"});
            props.onShouldRefresh();
        } else {
            setFeedback({type: "error", message: errorMessage});
        }
    }

    return <>
    <CreateEditDeleteUnitDialog show={popupShown === "CREATE_EDIT_UNIT"}
        classId={props.classData.id}
        unit={unitForPopup}
        onOperationDone={onUnitAddedOrEditedOrDeleted}
        onDismiss={() => {setPopupShown("NONE"); setUnitForPopup({id: undefined, name: undefined})}}/>
    <ClassParticipantsDialog show={popupShown === "PARTICIPANTS"}
        classId={props.classData.id}
        shouldShowEditButton={props.classData.shouldShowEditButton}
        onWantsToAddParticipant={() => {setPopupShown("ADD_PARTICIPANT")}} 
        onDismiss={() => {setPopupShown("NONE")}}/>
    <AddParticipantToClassDialog show={popupShown === "ADD_PARTICIPANT"} 
        classId={props.classData.id}
        classroomName={props.classData.name}
        onUserAdded={onUserAdded}
        onDismiss={() => { setPopupShown("NONE") }} />
    <div className="classDetailBodyContainer">
        <div className="classDetailBodyColumn1">
            <PostsBoard classData={props.classData} />
        </div>
        <div className="classDetailBodyColumn2">
            <div>
                <div className="classDetailSectionTitle">💼 Próximas entregas</div>
                <div className="classDetailSectionUnderline" />
                <p>
                    No hay entregas próximas
                </p>
            </div>
            <div>
                <div className="classDetailSectionTitle">📚 Temario</div>
                <div className="classDetailSectionUnderline" />
                <div>
                    { props.classData.units.length > 0 ?
                        props.classData.units.map(u => {
                            return <ClassDetailBodyUnitItem
                                    unit={u} 
                                    editable={props.classData.shouldShowEditButton}
                                    onEdit={unit => {
                                         setPopupShown("CREATE_EDIT_UNIT");
                                         setUnitForPopup(unit) }} /> }) 
                        : <p>No hay temas</p> }
                </div>
                { props.classData.shouldShowEditButton === true &&
                    <div className="card classDetailBubbleButton" onClick={() => { setPopupShown("CREATE_EDIT_UNIT"); }}>➕ Añadir tema</div>}
            </div>
            <div>
                <div className="classDetailSectionTitle">👤 Participantes</div>
                <div className="classDetailSectionUnderline" />
                <div className="card classDetailBubbleButton" onClick={() => { setPopupShown("PARTICIPANTS"); }}>Ver participantes</div> 
            </div>
        </div>
    </div>
    </>

}

export default ClassDetailBody;