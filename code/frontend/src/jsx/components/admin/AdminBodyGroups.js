import { useContext, useState } from "react";
import GenericCard from "../common/GenericCard";
import CreateGroupDialog from "../dialogs/CreateGroupDialog";
import { FeedbackContext } from "../../main/GlobalContainer";
import OptionsDialog from "../dialogs/OptionsDialog";
import AnnouncementsDialog from "../dialogs/AnnouncementsDialog";

const AdminBodyGroups = (props) => {
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, CREATE_GROUP, OPTIONS, ANNOUNCEMENTS
    const [groupTagForPopup, setGroupTagForPopup] = useState();
    const setFeedback = useContext(FeedbackContext);

    const onGroupAdded = (errorMessage) => {
        if (errorMessage === undefined) {
            setFeedback({ type: "success", message: "Nuevo grupo creado con éxito" });
            props.onShouldRefresh();
        } else {
            setFeedback({ type: "success", message: errorMessage });
        }
    }

    const onGroupClicked = (groupTag) => {
        setGroupTagForPopup(groupTag);
        setPopupShown("OPTIONS");
    }

    return <div>
        <div>
            <div className="adminAddButtonHeader pointable card" onClick={() => { setPopupShown("CREATE_GROUP") }}>➕ Añadir nuevo grupo</div>
        </div>
        {popupShown === "CREATE_GROUP" && <CreateGroupDialog onDismiss={() => { setPopupShown("NONE") }}
            onGroupAdded={onGroupAdded} />}
        {popupShown === "OPTIONS" && <OptionsDialog onDismiss={() => { setPopupShown("NONE") }}
            options={[
                {
                    label: "📢 Ver tablón de anuncios",
                    onClick: () => { setPopupShown("ANNOUNCEMENTS"); }
                }
            ]} />}
        {popupShown === "ANNOUNCEMENTS" &&
            <AnnouncementsDialog groupTag={groupTagForPopup}
                onDismiss={() => { setPopupShown("NONE"); }} />}
        <div className="adminSubpanelList">
            {props.groups.map(g => {
                return <GenericCard cardId={g.tag}
                    preTitle={g.tag}
                    title={g.name}
                    footer={`Tutor: ${g.tutor.name} ${g.tutor.surname}`}
                    onClickWithId={onGroupClicked} />
            })}
        </div>
    </div>
}

export default AdminBodyGroups;