import { useEffect, useState } from "react";
import AdminAddGroupForm from "./AdminAddGroupForm";
import GroupCard from "../common/GenericCard";
import GenericCard from "../common/GenericCard";

const AdminBodyGroups = (props) => {
    const [showPopup, setShowPopup] = useState(false);
    const [groupAddedFeedback, setGroupAddedFeedback] = useState(<div />);

    const onGroupAdded = (errorMessage) => {
        if (errorMessage === undefined) {
            setGroupAddedFeedback(<div className="adminAddResultMessage successColor">Nuevo grupo creado con éxito</div>);
            props.onShouldRefresh();
        } else {
            setGroupAddedFeedback(<div className="adminAddResultMessage errorColor">{errorMessage}</div>);
        }
    }

    return <div>
        <div>
            <div className="card adminAddButtonHeader" onClick={() => { setShowPopup(true) }}>➕ Añadir nuevo grupo</div>
            {groupAddedFeedback}
        </div>
        <AdminAddGroupForm show={showPopup}
            onDismiss={() => { setShowPopup(false) }}
            onGroupAdded={onGroupAdded} />
        <div className="adminSubpanelList">
            {props.groups.map(g => {
                return <GenericCard cardId={g.tag}
                    preTitle={g.tag}
                    title={g.name}
                    footer={`Tutor: ${g.tutor.name} ${g.tutor.surname}`} />
            })}
        </div>
    </div>
}

export default AdminBodyGroups;