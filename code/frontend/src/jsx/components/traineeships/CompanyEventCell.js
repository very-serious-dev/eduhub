
import { useContext, useState } from "react";
import { footNoteDateAuthor, beautifullyDisplayDateTime } from "../../../util/Formatter";
import AreYouSureDialog from "../dialogs/AreYouSureDialog";
import { EduAPIFetch } from "../../../client/APIFetch";

const CompanyEventCell = (props) => {
    const [showAreYouSureDelete, setShowAreYouSureDelete] = useState(false);
    const [isLoading, setLoading] = useState(false);

    const tagContent = (eventType) => {
        switch (eventType) {
            case 'other': return "Nota"
            case 'meeting': return "Reunión presencial"
            case 'virtual_meeting': return "Reunión virtual / llamada"
        }
    }

    const tagCss = (eventType) => {
        switch (eventType) {
            case 'other': return "companyEventTypeTagNote"
            case 'meeting': return "companyEventTypeTagMeeting"
            case 'virtual_meeting': return "companyEventTypeTagVirtualMeeting"
        }
    }

    const shouldDisplayParticipants = () => {
        return props.event.type === 'meeting' || props.event.type === 'virtual_meeting'
    }

    const onDeleteEvent = () => {
        if (isLoading) { return; }
        setLoading(true);

        EduAPIFetch("DELETE", `/api/v1/events/${props.event.id}`)
            .then(json => {
                setLoading(false);
                setShowAreYouSureDelete(false);
                if (json.success === true) {
                    props.onEventDeleted();
                } else {
                    props.onEventDeleted("Se ha producido un error");
                }
            })
            .catch(error => {
                setLoading(false);
                setShowAreYouSureDelete(false);
                props.onEventDeleted(error.error ?? "Se ha producido un error");
            })
    }

    return <>
        {showAreYouSureDelete && <AreYouSureDialog onDismiss={() => { setShowAreYouSureDelete(false); }}
            dialogMode="DELETE"
            warningMessage="¿Seguro que quieres eliminar este evento? Esta acción no se puede deshacer"
            isLoading={isLoading}
            onActionConfirmed={onDeleteEvent} />}
        <div className="companyEventTypeCellContainer">
            <div className="companyEventDeleteButton pointable" onClick={() => { setShowAreYouSureDelete(true) }}>❌</div>
            {props.event.type === 'interested_about_next_traineeship_period' ?
                <div className="companyEventCellInterestedNextPeriod">
                    <div className="companyEventCellInterestedNextPeriodTitle">📈 Interesados en próxima convocatoria</div>
                    <div className="companyEventCellInterestedNextPeriodDatetime">Fecha y hora: {beautifullyDisplayDateTime(props.event.date_time, true)}</div>
                </div>
                : <div className="card" key={props.event.id}>
                    <div className={`companyEventTypeTag ${tagCss(props.event.type)}`}>{tagContent(props.event.type)}</div>
                    <div className="companyEventCellDatetime">Fecha y hora: {beautifullyDisplayDateTime(props.event.date_time, true)}</div>
                    {shouldDisplayParticipants() && <div>Participantes: {props.event.participants}</div>}
                    <div className="companyEventCellDescription">{props.event.description}</div>
                    <div className="companyEventCellAuthorCreatedAt">{footNoteDateAuthor(props.event.created_at, props.event.author)}</div>
                </div>}
        </div>
    </>

}

export default CompanyEventCell;