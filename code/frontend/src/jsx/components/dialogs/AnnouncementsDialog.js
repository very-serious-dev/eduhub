import { useContext, useEffect, useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import EduAPIFetch from "../../../client/EduAPIFetch";
import { FeedbackContext } from "../../main/GlobalContainer";
import CreateAnnouncementDialog from "./CreateAnnouncementDialog";
import AnnouncementCell from "../announcements/AnnouncementCell";
import EditAnnouncementDialog from "./EditAnnouncementDialog";

const AnnouncementsDialog = (props) => {
    const [announcements, setAnnouncements] = useState([]);
    const [canCreateAnnouncement, setCanCreateAnnouncement] = useState(false);
    const [showCreateOrEdit, setShowCreateOrEdit] = useState(false);
    const [announcementBeingEdited, setAnnouncementBeingEdited] = useState(undefined);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isLoading, setLoading] = useState(false);
    const setFeedback = useContext(FeedbackContext);

    useEffect(() => {
        EduAPIFetch("GET", `/api/v1/groups/${props.groupTag}/announcements`)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    setAnnouncements(json.announcements);
                    setCanCreateAnnouncement(json.can_create_announcements);
                } else {
                    setFeedback({ type: "error", message: "Se ha producido un error" });
                }
            })
            .catch(error => {
                setLoading(false);
                setFeedback({ type: "error", message: error.error ?? "Se ha producido un error" });
            })
    }, [refreshKey]);

    const onEditAnnouncement = (announcement) => {
        setShowCreateOrEdit(true);
        setAnnouncementBeingEdited(announcement);
    }

    return showCreateOrEdit ?
        announcementBeingEdited === undefined ?
            <CreateAnnouncementDialog groupTag={props.groupTag}
                onDismiss={() => { setShowCreateOrEdit(false) }}
                onFinished={() => { setRefreshKey(x => x + 1) }} />
            : <EditAnnouncementDialog announcement={announcementBeingEdited}
                onDismiss={() => { setShowCreateOrEdit(false); setAnnouncementBeingEdited(undefined); }}
                onFinished={() => { setRefreshKey(x => x + 1) }} />
            : <div className="popupOverlayBackground" onClick={props.onDismiss}>
            <div className="popup" onClick={e => { e.stopPropagation(); }}>
                <div className="card dialogBackground overflowScrollableDialog">
                    <div className="dialogTitle">Tablón de anuncios de {props.groupTag}</div>
                    <div className="announcementsHeaderIcon">📢</div>
                    {isLoading && <div className="dialogHUDCentered"><LoadingHUD /></div>}
                    {announcements.length === 0 && <div className="noAnnouncements">No hay anuncios todavía</div>}
                    {announcements.map(a => <AnnouncementCell announcement={a} showEdit={canCreateAnnouncement} onEditAnnouncement={onEditAnnouncement} />)}
                    {(!isLoading && canCreateAnnouncement) &&
                        <div className="announcementButtonFooter">
                            <div className="card floatingCardAddNew" onClick={() => { setShowCreateOrEdit(true) }}>➕ Nuevo anuncio</div>
                        </div>}
                </div>
            </div>
        </div>
}

export default AnnouncementsDialog;