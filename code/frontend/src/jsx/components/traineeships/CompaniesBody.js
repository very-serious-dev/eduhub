import { useState, useContext } from "react";
import CreateEditDeleteCompanyDialog from "../dialogs/CreateEditDeleteCompanyDialog";
import { FeedbackContext } from "../../main/GlobalContainer";


const CompaniesBody = (props) => {
    const [showAddCompanyPopup, setShowAddCompanyPopup] = useState(false);
    const setFeedback = useContext(FeedbackContext);

    const onCompanyAdded = (errorMessage) => {
        if (errorMessage === undefined) {
            setFeedback({ type: "success", message: "Nueva empresa creada con éxito" });
            props.onShouldRefresh();
        } else {
            setFeedback({ type: "error", message: errorMessage });
        }
    }
    return <div>
        {showAddCompanyPopup && <CreateEditDeleteCompanyDialog onDismiss={() => { setShowAddCompanyPopup(false) }}
            onOperationDone={onCompanyAdded}/>}
        {props.companiesData.companies.map(company => (
            <div key={company.id}>
                <h2>{company.name}</h2>
                <p>{company.overview}</p>
                <p>{company.address}</p>
            </div>
        ))}
        <div className="card floatingCardAddNew pointable" onClick={() => { setShowAddCompanyPopup(true) }}>➕ Añadir compañía</div>

    </div>
}

export default CompaniesBody;