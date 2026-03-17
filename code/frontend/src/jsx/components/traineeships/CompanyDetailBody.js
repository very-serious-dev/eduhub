import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import CreateEditDeleteCompanyDialog from "../dialogs/CreateEditDeleteCompanyDialog";
import { FeedbackContext } from "../../main/GlobalContainer";
import CreateCompanyEventDialog from "../dialogs/CreateCompanyEventDialog";
import { footNoteDateAuthor, beautifullyDisplayDateTime } from "../../../util/Formatter";
import CompanyEventCell from "./CompanyEventCell";

const CompanyDetailBody = (props) => {
    const navigate = useNavigate();
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, EDIT_COMPANY, ADD_EVENT
    const setFeedback = useContext(FeedbackContext);

    const onOperationDone = (errorMessage) => {
        if (errorMessage === undefined) {
            setFeedback({ type: "success", message: "Completado con éxito" });
            props.onShouldRefresh();
        } else {
            setFeedback({ type: "error", message: errorMessage });
        }
    }

    return <>
        {popupShown == "EDIT_COMPANY" && <CreateEditDeleteCompanyDialog company={props.companyData.company}
            onDismiss={() => { setPopupShown("NONE") }}
            onOperationDone={onOperationDone} />}
        {popupShown == "ADD_EVENT" && <CreateCompanyEventDialog companyId={props.companyData.company.id}
            onDismiss={() => { setPopupShown("NONE") }}
            onEventCreated={onOperationDone} />}
        <div className="companyDetailMainBody">
            <div className="companyDetailColumn1">
                <div className="companyDetailColumn1GoBack pointable card" onClick={() => { navigate("/traineeships"); }}>⬅️ Volver a empresas</div>
                <div className="companyDetailColumn1MenuItem pointable card" onClick={() => { setPopupShown("ADD_EVENT") }}>➕ Añadir evento</div>
                <div className="companyDetailColumn1MenuItem pointable card" onClick={() => { setPopupShown("EDIT_COMPANY") }}>⚙️ Editar empresa</div>
                <div className="companyDetailColumn1ContactsContainer">
                    <div className="companyDetailSectionTitle">📞 Contactos</div>
                    {props.companyData.events.filter(e => e.type === 'contact_details').map(e => <p>{e.description}</p>)}
                </div>
            </div>
            <div className="companyDetailColumn2">
                <div className="companyDetailInfoContainer">
                    <div className="companyDetailInfoTitle">{props.companyData.company.name}</div>
                    <div className="companyDetailInfoCif">CIF: {props.companyData.company.cif}</div>
                    <div className="companyDetailInfoAddress">{props.companyData.company.address}</div>
                    <p>{props.companyData.company.overview}</p>
                </div>

                <div className="companyDetailEventsContainer">
                    {/* TO-DO: Print this a little bit prettier */}
                {props.companyData.events.filter(e => e.type !== 'contact_details').map(e => {
                    return <CompanyEventCell event={e}/>
                })}
                </div>
            </div>
        </div>
    </>
}

export default CompanyDetailBody;