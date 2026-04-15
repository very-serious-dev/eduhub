import { useContext, useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import { EduAPIFetch } from "../../../client/APIFetch";
import AreYouSureDialog from "./AreYouSureDialog";
import { accent, accentFormLabel, pointableSecondary, primary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";
import TextAreaWithLimit from "../common/TextAreaWithLimit";
import { useNavigate } from "react-router";

const CreateEditDeleteCompanyDialog = (props) => {
    const [formName, setFormName] = useState(props.company?.name ?? "");
    const [formCif, setFormCif] = useState(props.company?.cif ?? "");
    const [formOverview, setFormOverview] = useState(props.company?.overview ?? "");
    const [formAddress, setFormAddress] = useState(props.company?.address ?? "");
    const [formCompanyType, setFormCompanyType] = useState(props.company?.type ?? "unspecified");
    const [isLoading, setLoading] = useState(false);
    const [showAreYouSurePopup, setShowAreYouSurePopup] = useState(false);
    const theme = useContext(ThemeContext);
    const navigate = useNavigate();

    const isEditingCompany = () => { return props.company?.id !== undefined }

    const onSubmitAddOrEditCompany = (event) => {
        if (isLoading) { return; }
        event.preventDefault();
        setLoading(true);
        const httpMethod = isEditingCompany() ? "PUT" : "POST"
        const url = isEditingCompany() ?
            `/api/v1/companies/${props.company.id}`
            : `/api/v1/companies`
        const requestBody = {
            name: formName,
            cif: formCif,
            overview: formOverview,
            address: formAddress,
            type: formCompanyType
        }
        EduAPIFetch(httpMethod, url, requestBody)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    props.onOperationDone();
                    setFormName("");
                    setFormCif("");
                    setFormOverview("");
                    setFormAddress("");
                    setFormCompanyType("unspecified");
                } else {
                    props.onOperationDone("Se ha producido un error");
                }
                props.onDismiss();
            })
            .catch(error => {
                setLoading(false);
                props.onOperationDone(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }

    const onDeleteCompany = (event) => {
        if (isLoading) { return; }
        event.preventDefault();
        setLoading(true);
        setShowAreYouSurePopup(false);
        EduAPIFetch("DELETE", `/api/v1/companies/${props.company.id}`)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    props.onOperationDone();
                    navigate("/traineeships")
                } else {
                    props.onOperationDone("Se ha producido un error");
                }
                props.onDismiss();
            })
            .catch(error => {
                setLoading(false);
                props.onOperationDone(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }

    return showAreYouSurePopup ? <AreYouSureDialog onActionConfirmed={onDeleteCompany}
        onDismiss={() => { setShowAreYouSurePopup(false); }}
        isLoading={isLoading}
        dialogMode="DELETE"
        warningMessage={`¿Deseas eliminar la empresa? Será archivada y sólo un administrador podrá restaurarla`} />
        : <div className="popupOverlayBackground" onClick={props.onDismiss}>
            <div className="popup" onClick={e => { e.stopPropagation(); }}>
                <div className="card dialogBackground">
                    <div className="dialogTitle">{isEditingCompany() ? "Modificar empresa" : "Nueva empresa"}</div>
                    <form onSubmit={onSubmitAddOrEditCompany}>
                        <div className="formInputContainer">
                            <input type="text" value={formName}
                                className={`formInput ${primary(theme)}`}
                                onChange={e => { setFormName(e.target.value) }}
                                onFocus={e => { e.target.placeholder = "Software House S.L."; }}
                                onBlur={e => { e.target.placeholder = ""; }}
                                maxLength={50}
                                required />
                            <div className={`underline ${accent(theme)}`} />
                            <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Nombre</label>
                        </div>
                        <div className="formInputContainer">
                            <input type="text" value={formCif}
                                className={`formInput ${primary(theme)}`}
                                onChange={e => { setFormCif(e.target.value) }}
                                onFocus={e => { e.target.placeholder = "B12345678"; }}
                                onBlur={e => { e.target.placeholder = ""; }}
                                maxLength={10}
                                required />
                            <div className={`underline ${accent(theme)}`} />
                            <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">CIF</label>
                        </div>
                        <div className="formInputContainer">
                            <input type="text" value={formAddress}
                                className={`formInput ${primary(theme)}`}
                                onChange={e => { setFormAddress(e.target.value) }}
                                onFocus={e => { e.target.placeholder = "Calle de XXXXX, 123, 28080 Madrid"; }}
                                onBlur={e => { e.target.placeholder = ""; }}
                                maxLength={200}
                                required />
                            <div className={`underline ${accent(theme)}`} />
                            <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Dirección</label>
                        </div>
                        <div className="formInputSelectContainer selectWithTopMargin">
                            <select name="companyType"
                                value={formCompanyType}
                                className={`formInputSelect ${primary(theme)}`}
                                onChange={e => { setFormCompanyType(e.target.value); }}>
                                <option value="unspecified">No especificado</option>
                                <option value="software">DAM/DAW 💻</option>
                                <option value="accounting">ADF/ASD 📊</option>
                                <option value="both">DAM/DAW y ADF/ASD 💻📊</option>
                            </select>
                        </div>
                        <TextAreaWithLimit value={formOverview} setValue={setFormOverview} maxLength={300} small={true} placeholder={"Descripción de la empresa, tecnologías, datos relevantes,..."} />
                        <div className="formInputContainer">
                            <input type="submit" className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`} value={isEditingCompany() ? "Modificar" : "Crear"} />
                        </div>
                        {isLoading && <div className="loadingHUDCentered"><LoadingHUD /></div>}
                    </form>
                    {isEditingCompany() && <div className="formSecondSubmit formSecondSubmitDestructive">
                        <button onClick={() => { setShowAreYouSurePopup(true); }}>❌ Eliminar empresa</button>
                    </div>}
                </div>
            </div>
        </div>
}

export default CreateEditDeleteCompanyDialog;