import { useContext, useEffect, useState } from "react";
import EduAPIFetch from "../../../client/EduAPIFetch";
import LoadingHUD from "../common/LoadingHUD";
import GenericCard from "../common/GenericCard";
import CreateClassDialog from "../dialogs/CreateClassDialog";
import EditClassOrParticipantsDialog from "../dialogs/EditClassOrParticipantsDialog";
import AddTeacherToClassDialog from "../dialogs/AddTeacherToClassDialog";
import AddStudentToClassDialog from "../dialogs/AddParticipantToClassDialog";
import { FeedbackContext } from "../../main/GlobalContainer";

const AdminBodyClasses = (props) => {
    const [classes, setClasses] = useState([]);
    const [newlyCreatedClasses, setNewlyCreatedClasses] = useState(0); // refresh key
    const [isRequestFailed, setRequestFailed] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, ADD_CLASS, MENU_PARTICIPANTS_OR_EDIT, EDIT_CLASS, CLASS_PARTICIPANTS
    const [classIdForPopup, setClassIdForPopup] = useState();
    const setFeedback = useContext(FeedbackContext);

    useEffect(() => {
        const options = {
            method: "GET",
            credentials: "include"
        };
        EduAPIFetch("/api/v1/admin/classes", options)
            .then(json => {
                setLoading(false);
                setClasses(json.classes);
            })
            .catch(error => {
                setLoading(false);
                setRequestFailed(true);
            })
    }, [newlyCreatedClasses]);

    const onClassAdded = (errorMessage) => {
        if (errorMessage === undefined) {
            setFeedback({type: "success", message: "Nueva clase creada con éxito"});
            setNewlyCreatedClasses(value => value + 1);
            {/* TO-DO: Possible optimization: Instead of triggering a /admin/home refresh,
                manually set a +1. In the end, this just aims to keep the left panel
                number updated
                */}
            props.onShouldRefresh();
        } else {
            setFeedback({type: "error", message: errorMessage});
        }
    }

    const onTeacherOrStudentAddedToClass = (errorMessage) => {
        if (errorMessage === undefined || errorMessage === "") {
            setFeedback({type: "success", message: "Añadido con éxito"});
        } else {
            setFeedback({type: "error", message: errorMessage});
        }
    }

    return isLoading ?
        <LoadingHUD /> :
        <>
            <div>
                <div className="card adminAddButtonHeader" onClick={() => { setPopupShown("ADD_CLASS") }}>➕ Añadir nueva clase</div>
            </div>
            <CreateClassDialog show={popupShown === "ADD_CLASS"}
                onDismiss={() => { setPopupShown("NONE") }}
                onClassAdded={onClassAdded}
                groups={props.groups} />
            <EditClassOrParticipantsDialog show={popupShown === "MENU_PARTICIPANTS_OR_EDIT"} 
                onDismiss={() => { setPopupShown("NONE") }}
                onEditClicked={() => { setPopupShown("EDIT_CLASS") }}
                onParticipantsClicked={() => { setPopupShown("CLASS_PARTICIPANTS") }} />
                {/* 
            <AddTeacherToClassDialog show={popupShown === "ADD_TEACHER_TO_CLASS"} 
                classroom={classes.find( c => {return c.id === classIdForPopup})}
                onTeacherAdded={onTeacherOrStudentAddedToClass}
                onDismiss={() => { setPopupShown("NONE") }} />
            <AddStudentToClassDialog show={popupShown === "ADD_STUDENT_TO_CLASS"} 
                classroom={classes.find( c => {return c.id === classIdForPopup})}
                onStudentAdded={onTeacherOrStudentAddedToClass}
                onDismiss={() => { setPopupShown("NONE") }} />*/}
            {isRequestFailed ? <div>¡Vaya! Algo ha fallado 😔</div>
                : <div className="adminSubpanelList">
                    {classes.map(c => {
                        return <GenericCard cardId={c.id}
                            preTitle={""}
                            title={c.name}
                            footer={c.group}
                            onClickWithId={id => { setClassIdForPopup(id); setPopupShown("MENU_PARTICIPANTS_OR_EDIT")}} />
                    })}
                </div>
            }

        </>
}

export default AdminBodyClasses;