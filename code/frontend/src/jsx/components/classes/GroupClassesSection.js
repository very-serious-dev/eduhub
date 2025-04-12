import { useNavigate } from "react-router-dom";
import GenericCard from "../common/GenericCard";
import { useState } from "react";
import AnnouncementsDialog from "../dialogs/AnnouncementsDialog";

const GroupClassesSection = (props) => {
    const [showAnnouncementsDialog, setShowAnnouncementsDialog] = useState(false);

    const navigate = useNavigate();

    const onClickClass = (id) => {
        navigate(`/classes/${id}`);
    }

    return <>
        {showAnnouncementsDialog &&
            <AnnouncementsDialog groupTag={props.group}
                onDismiss={() => { setShowAnnouncementsDialog(false); }} />}
        <div className="classesSectionContainer">
            <div className="classesSectionTitle">{props.group}</div>
            <div className="classesSectionAnnouncementsButton"
                onClick={() => { setShowAnnouncementsDialog(true); }}>
                📢 Tablón de anuncios
            </div>
            <div className="classesSectionTitleUnderline"></div>
            <div className="classesSectionInnerContainer">
                {props.classes.map(c => {
                    return <GenericCard additionalCssClass="classClickableGenericCard"
                        cardId={c.id}
                        title={c.name}
                        footer={c.group}
                        onClickWithId={onClickClass}
                        skirtingBoardColor={c.color} />
                    {/* TODO: replace color by theme, appropriately*/ }
                })}
            </div>
        </div></>
}

export default GroupClassesSection;