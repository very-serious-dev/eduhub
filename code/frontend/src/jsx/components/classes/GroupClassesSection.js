import { useNavigate } from "react-router-dom";
import GenericCard from "../common/GenericCard";
import { useState } from "react";
import AnnouncementsDialog from "../dialogs/AnnouncementsDialog";
import { GetCachedPosts, GetLastKnownClassUpdateTimestamp, GetLastKnownGroupAnnouncementTimestamp, SetLastKnownClassUpdateTimestamp, SetLastKnownGroupAnnouncementTimestamp } from "../../../client/ClientCache";

const GroupClassesSection = (props) => {
    const [showAnnouncementsDialog, setShowAnnouncementsDialog] = useState(false);

    const navigate = useNavigate();

    const onClickClass = (id) => {
        navigate(`/classes/${id}`);
    }

    const onClickAnnouncements = () => {
        setShowAnnouncementsDialog(true); 
        SetLastKnownGroupAnnouncementTimestamp(props.groupTag, new Date(props.latestUpdate).getTime())
    }

    const groupSmallRedDotIfNeeded = () => {
        if (props.latestUpdate !== "never") {
            const latestKnownUpdateTimestamp = GetLastKnownGroupAnnouncementTimestamp(props.groupTag)
            const latestRealUpdateTimestamp = new Date(props.latestUpdate).getTime()
            if (latestKnownUpdateTimestamp < latestRealUpdateTimestamp) {
                return <div className="announcementsSmallRedDot" />
            }
        }
    }

    const classSmallRedDotIfNeeded = (classroom) => {
        if (classroom.latestUpdate !== "never") {
            const cachedPosts = GetCachedPosts(classroom.id)
            const latestKnownUpdateTimestamp = cachedPosts.length > 0 ? new Date(cachedPosts[0].publication_date).getTime() : 0;
            const latestRealUpdateTimestamp = new Date(classroom.latest_update).getTime()
            if (latestKnownUpdateTimestamp < latestRealUpdateTimestamp) {
                return <div className="classSmallRedDot" />
            }
        }
    }

    return <>
        {showAnnouncementsDialog &&
            <AnnouncementsDialog groupTag={props.groupTag}
                onDismiss={() => { setShowAnnouncementsDialog(false); }} />}
        <div className="classesSectionContainer">
            <div className="classesSectionTitle">{props.groupTag}</div>
            <div className="classesSectionAnnouncementsButton"
                onClick={onClickAnnouncements}>
                📢 Tablón de anuncios
                {groupSmallRedDotIfNeeded()}
            </div>
            <div className="classesSectionTitleUnderline"></div>
            <div className="classesSectionInnerContainer">
                {props.classes.map(c => {
                    return <div className="classCellContainerWithRedDot">
                        <GenericCard additionalCssClass="classClickableGenericCard"
                            cardId={c.id}
                            title={c.name}
                            footer={c.group}
                            onClickWithId={onClickClass} />
                        {classSmallRedDotIfNeeded(c)}
                    </div>
                })}
            </div>
        </div></>
}

export default GroupClassesSection;