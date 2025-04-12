import { useContext, useEffect, useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import EduAPIFetch from "../../../client/EduAPIFetch";
import { FeedbackContext } from "../../main/GlobalContainer";

const AnnouncementsDialog = (props) => {
    const [announcements, setAnnouncements] = useState([]);
    const [canCreateAnnouncement, setCanCreateAnnouncement] = useState(false);
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
    }, []);

    const onClickCreateAnnouncement = () => {

    }

    return <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">Tablón de anuncios de {props.groupTag}</div>
                {isLoading && <div className="dialogHUDCentered"><LoadingHUD /></div>}
                {announcements.length === 0 && <div className="noAnnouncements">No hay anuncios todavía</div>}
                {announcements.map(a => <div>{a.title}</div>)}
                {(!isLoading && canCreateAnnouncement) &&
                    <div className="announcementButtonFooter">
                        <div className="card floatingCardAddNew" onClick={onClickCreateAnnouncement}>➕ Nuevo anuncio</div>
                    </div>}
            </div>
        </div>
    </div>
}

export default AnnouncementsDialog;