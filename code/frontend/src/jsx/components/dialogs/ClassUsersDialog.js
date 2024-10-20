import { useContext, useEffect, useState } from "react";
import EduAPIFetch from "../../../client/EduAPIFetch";
import LoadingHUD from "../common/LoadingHUD";
import { FeedbackContext } from "../../main/GlobalContainer";
import UserCard from "../common/UserCard";

const ClassUsersDialog = (props) => {
    const [isLoading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const setFeedback = useContext(FeedbackContext);

    useEffect(() => {
        if (!props.show) { return; }
        setLoading(true);
        const options = {
            method: "GET",
            credentials: "include"
        };
        EduAPIFetch(`/api/v1/classes/${props.classId}/users`, options)
            .then(json => {
                setLoading(false);
                setTeachers(json.teachers);
                setStudents(json.students);
            })
            .catch(error => {
                setLoading(false);
                setFeedback({type: "error", message: error.error ?? "Se ha producido un error"});
                props.onDismiss();
            })
    }, [props.show]);

    return  props.show === true ? <div className="popupOverlayBackground" onClick={props.onDismiss}>
    <div className="popupScreen" onClick={e => { e.stopPropagation(); }}>
        <div className="card dialogBackground">
            <div className="dialogTitle">Participantes</div>
            {isLoading && <div className="dialogScreenHUDCentered"><LoadingHUD /></div>}
            <div className="classDetailSectionTitle">💼 Profesores</div>
            <div className="classDetailSectionUnderline" />
            <div className="participantsContainer">
                {teachers && teachers.length > 0 ? teachers.map(u => <UserCard user={u} />) : <div className="emptyParticipants">No hay docentes asignados</div>}
            </div>
            <div className="classDetailSectionTitle">📗 Estudiantes</div>
            <div className="classDetailSectionUnderline" />
            <div className="participantsContainer">
                {students && students.length > 0 ? students.map(u => <UserCard user={u} />) : <div className="emptyParticipants">No hay estudiantes asignados</div>}
            </div>
        </div>
    </div>
</div> : <></>

}

export default ClassUsersDialog;