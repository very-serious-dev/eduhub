import { useContext, useEffect, useState } from "react";
import { EduAPIFetch } from "../../../client/APIFetch";
import LoadingHUD from "../common/LoadingHUD";
import GenericCard from "../common/GenericCard";
import CreateClassDialog from "../dialogs/CreateClassDialog";
import { FeedbackContext } from "../../main/GlobalContainer";
import EditClassDialog from "../dialogs/EditClassDialog";
import ClassParticipantsDialog from "../dialogs/ClassParticipantsDialog";
import OptionsDialog from "../dialogs/OptionsDialog";

const AdminBodyClasses = (props) => {
    const [classes, setClasses] = useState([]);
    const [isRequestFailed, setRequestFailed] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, ADD_CLASS, MENU_PARTICIPANTS_OR_EDIT, EDIT_CLASS, PARTICIPANTS
    const [classForPopup, setClassForPopup] = useState({ id: undefined, name: undefined });
    const [refreshKey, setRefreshKey] = useState(0);
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
    }, [refreshKey]);

    const onClassAdded = (errorMessage) => {
        if (errorMessage === undefined) {
            setFeedback({ type: "success", message: "Nueva clase creada con éxito" });
            setRefreshKey(x => x + 1);
            props.onShouldRefresh();  // Trigger /admin/home refresh; keep left pane number updated
        } else {
            setFeedback({ type: "error", message: errorMessage });
        }
    }

    const onClassEdited = (errorMessage) => {
        if (errorMessage === undefined) {
            setFeedback({ type: "success", message: "Clase modificada con éxito" });
            setRefreshKey(x => x + 1);
        } else {
            setFeedback({ type: "error", message: errorMessage });
        }
    }

    const onClassDeleted = (errorMessage) => {
        if (errorMessage === undefined) {
            setFeedback({ type: "success", message: "Clase eliminada con éxito" });
            setRefreshKey(x => x + 1);
            props.onShouldRefresh();  // Trigger /admin/home refresh; keep left pane number updated
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
                ]} />
            {popupShown === "EDIT_CLASS" &&
                <EditClassDialog name={classForPopup.name}
                    onDismiss={() => { setPopupShown("NONE") }}
                    onClassEdited={onClassEdited}
                    onClassDeleted={onClassDeleted}
                    shouldShowEvaluationCriteria={false}
                    classId={classForPopup.id} />}
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