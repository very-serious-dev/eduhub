import { useState } from "react";
import ClassUsersDialog from "../dialogs/ClassUsersDialog";
import ClassDetailEntryCard from "./ClassDetailEntryCard";

const ClassDetailBody = (props) => {
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, PARTICIPANTS

    return <>
    <ClassUsersDialog show={popupShown === "PARTICIPANTS"}
        onDismiss={() => {setPopupShown("NONE")}} 
        classId={props.classData.id}/>
    <div className="classDetailBodyContainer">
        <div className="classDetailBodyColumn1">
            {props.classData.entries.map(e => <ClassDetailEntryCard entry={e} />)}
        </div>
        <div className="classDetailBodyColumn2">
            <div>
                <div className="classDetailSectionTitle">👤 Participantes</div>
                <div className="classDetailSectionUnderline" />
                <div className="card seeParticipants" onClick={() => { setPopupShown("PARTICIPANTS"); }}>Ver participantes</div> 
            </div>
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
                <p>
                    No hay temas
                </p>
            </div>
        </div>
    </div>
    </>

}

export default ClassDetailBody;