import { useContext, useState } from "react";
import GenericCard from "../common/GenericCard";
import CreateGroupDialog from "../dialogs/CreateGroupDialog";
import { FeedbackContext } from "../../main/GlobalContainer";

const AdminBodyGroups = (props) => {
    const [showPopup, setShowPopup] = useState(false);
    const setFeedback = useContext(FeedbackContext);

    const onGroupAdded = (errorMessage) => {
        if (errorMessage === undefined) {
            setFeedback({type: "success", message: "Nuevo grupo creado con éxito"});
            props.onShouldRefresh();
        } else {
            setFeedback({type: "success", message: errorMessage});
        }
    }

    return <div>
        <div>
            <div className="card adminAddButtonHeader" onClick={() => { setShowPopup(true) }}>➕ Añadir nuevo grupo</div>
        </div>
        <CreateGroupDialog show={showPopup}
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