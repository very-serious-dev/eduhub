import { useNavigate } from "react-router";
import GenericCard from "../common/GenericCard";
import { useState } from "react";
import AnnouncementsDialog from "../dialogs/AnnouncementsDialog";
import { GetCachedPosts, GetLastKnownGroupAnnouncementTimestamp, SetLastKnownGroupAnnouncementTimestamp } from "../../../client/ClientCache";
import { backgroundImageSrc } from "../../../util/Themes";

const GroupClassesSection = (props) => {
    const [showAnnouncementsDialog, setShowAnnouncementsDialog] = useState(false);

    const navigate = useNavigate();

    const onClickClass = (id) => {
        navigate(`/classes/${id}`);
    }

    const onClickAnnouncements = () => {
        setShowAnnouncementsDialog(true);
        SetLastKnownGroupAnnouncementTimestamp(props.group.id, new Date(props.group.latest_update).getTime())
    }

    const groupSmallRedDotIfNeeded = () => {
        if (props.group.latest_update !== "never") {
            const latestKnownUpdateTimestamp = GetLastKnownGroupAnnouncementTimestamp(props.group.id)
            const latestRealUpdateTimestamp = new Date(props.group.latest_update).getTime()
            if (latestKnownUpdateTimestamp < latestRealUpdateTimestamp) {
                return <div className="announcementsSmallRedDot" />
            }
        }
    }

    const classSmallRedDotIfNeeded = (classroom) => {
        if (classroom.latest_update !== "never") {
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
            <AnnouncementsDialog groupId={props.group.id} onDismiss={() => { setShowAnnouncementsDialog(false); }} />}
        <div className="classesSectionContainer">
            <div className="classesSectionTitle">{props.group.name}</div>
            <div className="classesSectionAnnouncementsButton pointable"
                onClick={onClickAnnouncements}>
                📢 Tablón de anuncios
                {groupSmallRedDotIfNeeded()}
            </div>
            <div className="classesSectionTitleUnderline"></div>
            <div className="classesSectionInnerContainer">
                {props.classes.map(c => {
                    return <div className="classCellContainerWithRedDot">
                        <GenericCard backgroundHoverImage={backgroundImageSrc(c.theme)}
                            cardId={c.id}
                            title={c.name}
                            footer={`${props.group.tag} (${props.group.year})`}
                            onClickWithId={onClickClass} />
                        {classSmallRedDotIfNeeded(c)}
                    </div>
                })}
            </div>
        </div></>
}

export default GroupClassesSection;