
import { footNoteDateAuthor, beautifullyDisplayDateTime } from "../../../util/Formatter";

const CompanyEventCell = (props) => {

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

    return props.event.type === 'interested_about_next_traineeship_period' ?
        <div className="companyEventCellInterestedNextPeriod">
            <div className="companyEventCellInterestedNextPeriodTitle">📈 Interesados en próxima convocatoria</div>
            <div className="companyEventCellInterestedNextPeriodDatetime">Fecha y hora: {beautifullyDisplayDateTime(props.event.date_time, true)}</div>
        </div>
        : <div className="card companyEventTypeCellContainer" key={props.event.id}>
            <div className={`companyEventTypeTag ${tagCss(props.event.type)}`}>{tagContent(props.event.type)}</div>
            <div className="companyEventCellDatetime">Fecha y hora: {beautifullyDisplayDateTime(props.event.date_time, true)}</div>
            {shouldDisplayParticipants() && <div>Participantes: {props.event.participants}</div>}
            <div className="companyEventCellDescription">{props.event.description}</div>
            <div className="companyEventCellAuthorCreatedAt">{footNoteDateAuthor(props.event.created_at, props.event.author)}</div>
        </div>
}

export default CompanyEventCell;