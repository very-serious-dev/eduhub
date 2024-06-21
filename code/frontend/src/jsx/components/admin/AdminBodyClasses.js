import { useEffect, useState } from "react";
import EduAPIFetch from "../../../client/EduAPIFetch";
import LoadingHUD from "../common/LoadingHUD";
import AdminAddClassForm from "./AdminAddClassForm";
import GenericCard from "../common/GenericCard";

const AdminBodyClasses = (props) => {
    const [classes, setClasses] = useState([]);
    const [newlyCreatedClasses, setNewlyCreatedClasses] = useState(0); // refresh key
    const [isRequestFailed, setRequestFailed] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [classAddedFeedback, setClassAddedFeedback] = useState(<div />);

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
            setClassAddedFeedback(<div className="adminAddResultMessage successColor">Nueva clase creada con éxito</div>);
            setNewlyCreatedClasses(value => value + 1);
            {/* TO-DO: Possible optimization: Instead of triggering a /admin/home refresh,
                manually set a +1. In the end, this just aims to keep the left panel
                number updated
                */}
            props.onShouldRefresh();
        } else {
            setClassAddedFeedback(<div className="adminAddResultMessage errorColor">{errorMessage}</div>);
        }
    }

    return isLoading ?
        <LoadingHUD /> :
        <>
            <div className="adminSubpanelHeader">
                <div className="card adminAddButtonHeader" onClick={() => { setShowPopup(true) }}>➕ Añadir nueva clase</div>
                {classAddedFeedback}
            </div>
            <AdminAddClassForm show={showPopup}
                onDismiss={() => { setShowPopup(false) }}
                onClassAdded={onClassAdded}
                groups={props.groups} />
            {isRequestFailed ? <div>¡Vaya! Algo ha fallado 😔</div>
                : <div className="adminSubpanelList">
                    {classes.map((c, i) => {
                        return <GenericCard cardId={i}
                            preTitle={""}
                            title={c.name}
                            footer={c.group} />
                    })}
                </div>
            }

        </>
}

export default AdminBodyClasses;