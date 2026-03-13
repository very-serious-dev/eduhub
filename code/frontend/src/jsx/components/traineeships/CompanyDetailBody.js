import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import CreateEditDeleteCompanyDialog from "../dialogs/CreateEditDeleteCompanyDialog";
import { FeedbackContext } from "../../main/GlobalContainer";

const CompanyDetailBody = (props) => {
    const navigate = useNavigate();
    const [showEditPopup, setShowEditPopup] = useState(false);
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
        {showEditPopup && <CreateEditDeleteCompanyDialog company={props.companyData.company}
            onDismiss={() => { setShowEditPopup(false) }}
            onOperationDone={onOperationDone} />}
        <div className="companyDetailMainBody">
            <div className="companyDetailColumn1">
                <div className="companyDetailColumn1GoBack pointable card" onClick={() => { navigate("/traineeships"); }}>⬅️ Volver a empresas</div>
                <div className="companyDetailColumn1MenuItem pointable card" onClick={() => { setShowEditPopup(true) }}>⚙️ Editar</div>

            </div>
            <div className="companyDetailColumn2">
                <div className="companyDetailInfoContainer">
                    <div className="companyDetailInfoTitle">{props.companyData.company.name}</div>
                    <div className="companyDetailInfoCif">CIF: {props.companyData.company.cif}</div>
                    <div className="companyDetailInfoAddress">{props.companyData.company.address}</div>
                    <p>{props.companyData.company.overview}</p>
                </div>

                <div>Eventos</div>
            </div>
        </div>
    </>
}

export default CompanyDetailBody;