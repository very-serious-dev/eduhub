import { useContext, useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import { EduAPIFetch } from "../../../client/APIFetch";
import { accent, accentFormLabel, pointableSecondary, primary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";
import TextAreaWithLimit from "../common/TextAreaWithLimit";

const CreateCompanyEventDialog = (props) => {
    const [formEventType, setFormEventType] = useState("other");
    const [formLocalDate, setFormLocalDate] = useState();
    const [formParticipants, setFormParticipants] = useState("");
    const [formDetail, setFormDetail] = useState("");
    const [isLoading, setLoading] = useState(false);
    const theme = useContext(ThemeContext);


    const onSubmitAddCompanyEvent = (event) => {
        if (isLoading) { return; }
        event.preventDefault();
        setLoading(true);
        const requestBody = {

        }
        EduAPIFetch("POST", `/api/v1/companies/${props.companyId}/events`, requestBody)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    props.onOperationDone();
                    setFormLocalDate();
                    setFormParticipants("");
                    setFormDetail("");
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

    return <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">Añadir evento</div>
                <br></br>
                <form onSubmit={onSubmitAddCompanyEvent}>
                    <div className="formInputSelectContainer">
                        <select name="type"
                            value={formEventType}
                            className={`formInputSelect ${primary(theme)}`}
                            onChange={e => { setFormEventType(e.target.value); }} >
                            <option value="meeting">Reunión presencial</option>
                            <option value="virtual_meeting">Reunión virtual / Llamada</option>
                            <option value="interested_about_next_traineeship_period">Interesados en próxima convocatoria</option>
                            <option value="added_contact_details">Datos de contacto</option>
                            <option value="other">Nota</option>
                        </select>
                    </div>
                    <hr></hr>
                    {(formEventType === "meeting" || formEventType === "virtual_meeting" ||
                        formEventType === "interested_about_next_traineeship_period") &&
                        <>
                            <div className="createCompanyEventFormDate">Fecha del evento</div>
                            <div className="formInputContainer">
                                <input className={`formInput formInputCreatePostTaskDate ${primary(theme)}`}
                                    type="datetime-local"
                                    value={formLocalDate}
                                    onChange={e => { setFormLocalDate(e.target.value ?? "") }}
                                    required />
                            </div>
                        </>}
                    {(formEventType === "meeting" || formEventType === "virtual_meeting") &&
                        <div className="formInputContainer">
                            <input type="text" value={formParticipants}
                                className={`formInput ${primary(theme)}`}
                                onChange={e => { setFormParticipants(e.target.value) }}
                                onFocus={e => { e.target.placeholder = "Profesores: Alice, Bob. Empresa: Charlie. Alumnos: Dwayne."; }}
                                onBlur={e => { e.target.placeholder = ""; }}
                                maxLength={50}
                                required />
                            <div className={`underline ${accent(theme)}`} />
                            <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Participantes</label>
                        </div>}
                    {(formEventType === "meeting" || formEventType === "virtual_meeting" ||
                        formEventType === "added_contact_details" || formEventType === "other") &&
                        <TextAreaWithLimit value={formDetail} setValue={setFormDetail} maxLength={2000} small={true} placeholder={"Escribe aquí todos los detalles relevantes..."} />}
                    <div className="formInputContainer">
                        <input type="submit" className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`} value={"Crear"} />
                    </div>
                    {isLoading && <div className="loadingHUDCentered"><LoadingHUD /></div>}
                </form>
            </div>
        </div>
    </div>
}

export default CreateCompanyEventDialog;