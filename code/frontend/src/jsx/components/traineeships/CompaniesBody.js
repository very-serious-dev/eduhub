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

    const sortedExtendedCompanies = () => {
        const sortedCompanies = [...props.companiesData.companies] // FIXME: Is a copy really necessary?
        sortedCompanies.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
        return sortedCompanies.map(c => {
            return { ...c, recentInterest: props.companiesData.interested_in_next_traineeship_period_events.some(e => e.company_id === c.id) }
        });
    }

    return <div>
        {showAddCompanyPopup && <CreateEditDeleteCompanyDialog onDismiss={() => { setShowAddCompanyPopup(false) }}
            onOperationDone={onCompanyAdded} />}
        <div className="companiesList">
            {sortedExtendedCompanies().map(company => (
                <GenericCard cardId={company.id}
                    title={company.name}
                    preTitle={company.overview.substring(0, 120)}
                    footer={company.recentInterest ? "⚡ Interés reciente en prácticas" : ""}
                    onClickWithId={onCompanyClicked} />
            ))}
        </div>
        <div className="card floatingCardAddNew pointable" onClick={() => { setShowAddCompanyPopup(true) }}>➕ Añadir empresa</div>

    </div>
}

export default CompaniesBody;