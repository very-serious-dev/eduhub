import { useContext, useEffect, useState } from "react";
import EduAPIFetch from "../../../client/EduAPIFetch";
import LoadingHUD from "../common/LoadingHUD";
import { FeedbackContext, ThemeContext } from "../../main/GlobalContainer";
import UserCard from "../common/UserCard";
import SearchUsersSubDialog from "./SearchUsersSubDialog";
import AreYouSureDialog from "./AreYouSureDialog";
import { accent, accentForeground, pointableSecondary, primary } from "../../../util/Themes";

const ClassParticipantsDialog = (props) => {
    const [isLoading, setLoading] = useState(false);
    const [isLoadingDelete, setLoadingDelete] = useState(false);
    const [areYouSureDeleteUsername, setAreYouSureDeleteUsername] = useState(undefined);
    const [showAddParticipant, setShowAddParticipant] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const setFeedback = useContext(FeedbackContext);
    const theme = useContext(ThemeContext);

    useEffect(() => {
        if (!props.show) { return; }
        setLoading(true);
        EduAPIFetch("GET", `/api/v1/classes/${props.classroom.id}/users`)
            .then(json => {
                setLoading(false);
                setTeachers(json.users.filter(u => { return u.roles.includes("teacher") }));
                setStudents(json.users.filter(u => { return u.roles.includes("student") }));
            })
            .catch(error => {
                setLoading(false);
                setFeedback({ type: "error", message: error.error ?? "Se ha producido un error" });
                props.onDismiss();
            })
    }, [props.show, refreshKey]);

    const onRemoveUserClicked = (username) => {
        setAreYouSureDeleteUsername(username);
    }

    const onRemoveUserActionConfirmed = () => {
        if (isLoadingDelete) { return; }
        setLoadingDelete(true);
        EduAPIFetch("DELETE", `/api/v1/classes/${props.classroom.id}/users/${areYouSureDeleteUsername}`)
            .then(json => {
                setLoadingDelete(false);
                setAreYouSureDeleteUsername(undefined); // Dismisses Are you sure? dialog
                if (json.success === true) {
                    setFeedback({ type: "success", message: "Usuario eliminado de la clase" });
                } else {
                    setFeedback({ type: "error", message: "Se ha producido un error" });
                }
                setRefreshKey(x => x + 1);
            })
            .catch(error => {
                setLoadingDelete(false);
                setAreYouSureDeleteUsername(undefined); // Dismisses Are you sure? dialog
                setFeedback({ type: "error", message: error.error ?? "Se ha producido un error" });
            })
    }

    const onUserAdded = (errorMessage) => {
        setRefreshKey(x => x + 1)
        if (errorMessage === undefined || errorMessage === "") {
            setFeedback({ type: "success", message: "Usuario(s) añadido(s) con éxito" });
        } else {
            setFeedback({ type: "error", message: errorMessage });
        }
    }

    const userCardForUser = (user) => {
        if (props.shouldShowEditButton) {
            return <UserCard user={user} onDeleteWithUsername={onRemoveUserClicked} />
        } else {
            return <UserCard user={user} />
        }
    }

    return props.show === true ?
        areYouSureDeleteUsername !== undefined ?
            <AreYouSureDialog onActionConfirmed={onRemoveUserActionConfirmed}
                onDismiss={() => { setAreYouSureDeleteUsername(undefined); }}
                isLoading={isLoadingDelete}
                dialogMode="DELETE"
                warningMessage={`¿Deseas eliminar a ${areYouSureDeleteUsername} de la clase?`} />
            : showAddParticipant ?
                <SearchUsersSubDialog addUsersUrl={`/api/v1/classes/${props.classroom.id}/users`}
                    dialogTitle={`Añadir participantes a ${props.classroom.name}`}
                    onUserAdded={onUserAdded}
                    onDismiss={() => { setShowAddParticipant(false) }}
                    usersToIgnore={[]} />
                : <div className="popupOverlayBackground" onClick={props.onDismiss}>
                    <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
                        <div className="card dialogBackground overflowScrollableDialog">
                            <div className="dialogTitle">Participantes</div>
                            {isLoading && <div className="loadingHUDCentered"><LoadingHUD /></div>}
                            <div className={accentForeground(theme)}>💼 Profesores</div>
                            <div className={`classDetailSectionUnderline ${accent(theme)}`} />
                            <div className="participantsContainer">
                                {teachers && teachers.length > 0 ? teachers.map(u => userCardForUser(u)) : <div className="emptyParticipants">No hay docentes asignados</div>}
                            </div>
                            <div className={accentForeground(theme)}>📗 Estudiantes</div>
                            <div className={`classDetailSectionUnderline ${accent(theme)}`} />
                            <div className="participantsContainer">
                                {students && students.length > 0 ? students.map(u => userCardForUser(u)) : <div className="emptyParticipants">No hay estudiantes asignados</div>}
                            </div>
                            {props.shouldShowEditButton &&
                                <div className={`card addParticipant pointable ${primary(theme)} ${pointableSecondary(theme)}`}
                                    onClick={() => { setShowAddParticipant(true); }}>
                                    ➕ Añadir participante
                                </div>}
                        </div>
                    </div>
                </div> : <></>

}

export default ClassParticipantsDialog;