import { useContext, useEffect, useState } from "react";
import EduAPIFetch from "../../../client/EduAPIFetch";
import LoadingHUD from "../common/LoadingHUD";
import GenericCard from "../common/GenericCard";
import CreateClassDialog from "../dialogs/CreateClassDialog";
import { FeedbackContext } from "../../main/GlobalContainer";
import EditClassDialog from "../dialogs/EditClassDialog";
import ClassParticipantsDialog from "../dialogs/ClassParticipantsDialog";
import OptionsDialog from "../dialogs/OptionsDialog";

const AdminBodyClasses = (props) => {
    const [classes, setClasses] = useState([]);
    const [classesChanged, setClassesChanged] = useState(0); // refresh key
    const [isRequestFailed, setRequestFailed] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, ADD_CLASS, MENU_PARTICIPANTS_OR_EDIT, EDIT_CLASS, PARTICIPANTS
    const [classForPopup, setClassForPopup] = useState({ id: undefined, name: undefined });
    const setFeedback = useContext(FeedbackContext);

    useEffect(() => {
        EduAPIFetch("GET", "/api/v1/admin/classes")
            .then(json => {
                setLoading(false);
                setClasses(json.classes);
            })
            .catch(error => {
                setLoading(false);
                setRequestFailed(true);
            })
    }, [classesChanged]);

    const onClassAdded = (errorMessage) => {
        if (errorMessage === undefined) {
            setFeedback({ type: "success", message: "Nueva clase creada con éxito" });
            setClassesChanged(value => value + 1); // Refresh the list
            {/* TO-DO: Possible optimization: Instead of triggering a /admin/home refresh,
                manually set a +1. In the end, this just aims to keep the left panel
                number updated
                */}
            props.onShouldRefresh();
        } else {
            setFeedback({ type: "error", message: errorMessage });
        }
    }

    const onClassEdited = (errorMessage) => {
        if (errorMessage === undefined) {
            setFeedback({ type: "success", message: "Clase modificada con éxito" });
            setClassesChanged(value => value + 1); // Refresh the list
        } else {
            setFeedback({ type: "error", message: errorMessage });
        }
    }

    const onClassDeleted = (errorMessage) => {
        if (errorMessage === undefined) {
            setFeedback({ type: "success", message: "Clase eliminada con éxito" });
            setClassesChanged(value => value + 1); // Refresh the list
            {/* TO-DO: Possible optimization: Instead of triggering a /admin/home refresh,
                manually set a +1. In the end, this just aims to keep the left panel
                number updated
                */}
            props.onShouldRefresh();
        } else {
            setFeedback({ type: "error", message: errorMessage });
        }
    }

    const onClassClicked = (id) => {
        const classroom = classes.find(c => c.id === id)
        setClassForPopup(classroom);
        setPopupShown("MENU_PARTICIPANTS_OR_EDIT")
    }

    return isLoading ?
        <LoadingHUD /> :
        <>
            <div>
                <div className="adminAddButtonHeader pointable card" onClick={() => { setPopupShown("ADD_CLASS") }}>➕ Añadir nueva clase</div>
            </div>
            {/* TODO: Remove all usages of show prop, and let the boolean flag with &&
              *       decide to not render the stuff beforehand; many usages across the app!*/}
            <CreateClassDialog show={popupShown === "ADD_CLASS"}
                onDismiss={() => { setPopupShown("NONE") }}
                onClassAdded={onClassAdded}
                groups={props.groups} />
            <OptionsDialog show={popupShown === "MENU_PARTICIPANTS_OR_EDIT"}
                onDismiss={() => { setPopupShown("NONE") }}
                options={[
                    {
                        label: "⚙️ Editar",
                        onClick: () => { setPopupShown("EDIT_CLASS") },
                    },
                    {
                        label: "🎓 Participantes",
                        onClick: () => { setPopupShown("PARTICIPANTS") },
                    },
                ]}/>
            <EditClassDialog show={popupShown === "EDIT_CLASS"}
                onDismiss={() => { setPopupShown("NONE") }}
                onClassEdited={onClassEdited}
                onClassDeleted={onClassDeleted}
                classId={classForPopup.id} />
            <ClassParticipantsDialog show={popupShown === "PARTICIPANTS"}
                onDismiss={() => { setPopupShown("NONE") }}
                classroom={classForPopup}
                shouldShowEditButton={true} />
            {isRequestFailed ? <div>¡Vaya! Algo ha fallado 😔</div>
                : <div className="adminSubpanelList">
                    {classes.map(c => {
                        return <GenericCard cardId={c.id}
                            preTitle={""}
                            title={c.name}
                            footer={c.group}
                            onClickWithId={onClassClicked} />
                    })}
                </div>
            }

        </>
}

export default AdminBodyClasses;