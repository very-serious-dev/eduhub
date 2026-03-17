import { useState, useContext } from "react";
import CreateEditDeleteCompanyDialog from "../dialogs/CreateEditDeleteCompanyDialog";
import { FeedbackContext } from "../../main/GlobalContainer";
import GenericCard from "../common/GenericCard";
import { useNavigate } from "react-router";

const CompaniesBody = (props) => {
    const [showAddCompanyPopup, setShowAddCompanyPopup] = useState(false);
    const setFeedback = useContext(FeedbackContext);
    const navigate = useNavigate();

    const onCompanyAdded = (errorMessage) => {
        if (errorMessage === undefined) {
            setFeedback({ type: "success", message: "Nueva empresa creada con éxito" });
            props.onShouldRefresh();
        } else {
            setFeedback({ type: "error", message: errorMessage });
        }
    }

    const onCompanyClicked = (companyId) => {
        navigate(`/companies/${companyId}`)
    }

    return <div>
        {showAddCompanyPopup && <CreateEditDeleteCompanyDialog onDismiss={() => { setShowAddCompanyPopup(false) }}
            onOperationDone={onCompanyAdded} />}
        <div className="companiesList">
            {props.companiesData.companies.map(company => {
                const companyHasSpecialInterest = props.companiesData.interested_in_next_traineeship_period_events.some(e => e.company_id === company.id);
                return <GenericCard cardId={company.id}
                    title={company.name}
                    preTitle={company.overview.substring(0, 120)}
                    footer={companyHasSpecialInterest ? "⚡ Interés reciente en prácticas" : ""}
                    onClickWithId={onCompanyClicked} />
            })}
        </div>
        <div className="card floatingCardAddNew pointable" onClick={() => { setShowAddCompanyPopup(true) }}>➕ Añadir empresa</div>

    </div>
}

export default CompaniesBody;