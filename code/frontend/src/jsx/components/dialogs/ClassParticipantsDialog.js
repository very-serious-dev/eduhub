import { useContext, useEffect, useState } from "react";
import EduAPIFetch from "../../../client/EduAPIFetch";
import LoadingHUD from "../common/LoadingHUD";
import { FeedbackContext } from "../../main/GlobalContainer";
import UserCard from "../common/UserCard";
import AreYouSureDialog from "./AreYouSureDialog";

const ClassParticipantsDialog = (props) => {
    const [isLoading, setLoading] = useState(false);
    const [isLoadingDelete, setLoadingDelete] = useState(false);
    const [areYouSureDeleteUsername, setAreYouSureDeleteUsername] = useState();
    const [numDeletedUsers, setNumDeletedUsers] = useState(0); // refresh key
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
                setTeachers(json.users.filter(u => { return u.roles.includes("teacher")}));
                setStudents(json.users.filter(u => { return u.roles.includes("student")}));
            })
            .catch(error => {
                setLoading(false);
                setFeedback({type: "error", message: error.error ?? "Se ha producido un error"});
                props.onDismiss();
            })
    }, [props.show, numDeletedUsers]);

    const onRemoveUserClicked = (username) => {
        setAreYouSureDeleteUsername(username);
    }

    const onRemoveUserActionConfirmed = () => {
        if (isLoadingDelete) { return; }
        const options = {
            method: "DELETE",
            credentials: "include"
        };
        setLoadingDelete(true);
        EduAPIFetch(`/api/v1/classes/${props.classId}/users/${areYouSureDeleteUsername}`, options)
            .then(json => {
                setLoadingDelete(false);
                setAreYouSureDeleteUsername(undefined); // Dismisses Are you sure? dialog
                if (json.success === true) {
                    setFeedback({type: "success", message: "Usuario eliminado de la clase"});
                } else {
                    setFeedback({type: "error", message: "Se ha producido un error"});
                }
                setNumDeletedUsers(numDeletedUsers + 1);
            })
            .catch(error => {
                setLoadingDelete(false);
                setAreYouSureDeleteUsername(undefined); // Dismisses Are you sure? dialog
                setFeedback({type: "error", message: error.error ?? "Se ha producido un error"});
            })
    }


    const userCardForUser = (user) => {
        if (props.shouldShowEditButton) {
            return <UserCard user={user} onDeleteWithUsername={onRemoveUserClicked}/>
        } else {
            return <UserCard user={user} />
        }
    }
    /** TO-DO if props.shouldShowEditButton, display buttons to allow removing users */
    
    return  props.show === true ? 
    areYouSureDeleteUsername !== undefined ? 
    <AreYouSureDialog onDismiss={() => { setAreYouSureDeleteUsername(undefined); }}
        onActionConfirmed={onRemoveUserActionConfirmed}
        isLoading={isLoadingDelete} />
    : <div className="popupOverlayBackground" onClick={props.onDismiss}>
    <div className="popupScreen" onClick={e => { e.stopPropagation(); }}>
        <div className="card dialogBackground">
            <div className="dialogTitle">Participantes</div>
            {isLoading && <div className="dialogScreenHUDCentered"><LoadingHUD /></div>}
            <div className="classDetailSectionTitle">💼 Profesores</div>
            <div className="classDetailSectionUnderline" />
            <div className="participantsContainer">
                {teachers && teachers.length > 0 ? teachers.map(u => userCardForUser(u)) : <div className="emptyParticipants">No hay docentes asignados</div>}
            </div>
            <div className="classDetailSectionTitle">📗 Estudiantes</div>
            <div className="classDetailSectionUnderline" />
            <div className="participantsContainer">
                {students && students.length > 0 ? students.map(u => userCardForUser(u)) : <div className="emptyParticipants">No hay estudiantes asignados</div>}
            </div>
            { props.shouldShowEditButton && <div className="card addParticipant" onClick={props.onWantsToAddParticipant}>➕ Añadir participante</div> }
        </div>
    </div>
</div> : <></>

}

export default ClassParticipantsDialog;