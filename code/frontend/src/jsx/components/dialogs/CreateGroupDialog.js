import { useContext, useEffect, useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import { EduAPIFetch } from "../../../client/APIFetch";
import { accent, accentFormLabel, pointableSecondary, primary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";

const CreateGroupDialog = (props) => {
    const NOT_VALID = "NOT_VALID"
    const [formName, setFormName] = useState("");
    const [formTag, setFormTag] = useState("");
    const [formYear, setFormYear] = useState("");
    const [formTutorUsername, setFormTutorUsername] = useState(NOT_VALID);
    const [availableTeachers, setAvailableTeachers] = useState([]);
    const [isLoadingSubmit, setLoadingSubmit] = useState(false);
    const [isLoadingTeachers, setLoadingTeachers] = useState(false);
    const theme = useContext(ThemeContext);

    useEffect(() => {
        setLoadingTeachers(true);
        EduAPIFetch("GET", "/api/v1/admin/teachers")
            .then(json => {
                setLoadingTeachers(false);
                setAvailableTeachers(json.teachers);
                if (json.teachers.length > 0) {
                    setFormTutorUsername(json.teachers[0].username);
                }
            })
            .catch(error => {
                setLoadingTeachers(false);
                setAvailableTeachers([{ "name": "-- Se produjo un error --", "surname": "", "username": "" }]);
            })
    }, []);

    const onSubmitAddGroup = (event) => {
        if (isLoadingSubmit) { return; }
        event.preventDefault();
        setLoadingSubmit(true);
        const body = {
            name: formName,
            tag: formTag,
            year: formYear,
            tutor_username: formTutorUsername
        };
        EduAPIFetch("POST", "/api/v1/admin/groups", body)
            .then(json => {
                setLoadingSubmit(false);
                if (json.success === true) {
                    props.onGroupAdded();
                    setFormName("");
                    setFormTag("");
                } else {
                    props.onGroupAdded("Se ha producido un error");
                }
                props.onDismiss();
            })
            .catch(error => {
                setLoadingSubmit(false);
                props.onGroupAdded(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }

    return props.show === true ? <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">Nuevo grupo</div>
                <form onSubmit={onSubmitAddGroup}>
                    <div className="formInputContainer">
                        <input type="text" value={formName}
                            className={`formInput ${primary(theme)}`}
                            onChange={e => { setFormName(e.target.value) }}
                            onFocus={e => { e.target.placeholder = "Bachillerato 1º"; }}
                            onBlur={e => { e.target.placeholder = ""; }}
                            required />
                        <div className={`underline ${accent(theme)}`} />
                        <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Nombre</label>
                    </div>
                    <div className="formInputContainer">
                        <input type="text" value={formTag}
                            className={`formInput ${primary(theme)}`}
                            onChange={e => { setFormTag(e.target.value) }}
                            onFocus={e => { e.target.placeholder = "BACH1"; }}
                            onBlur={e => { e.target.placeholder = ""; }}
                            required />
                        <div className={`underline ${accent(theme)}`} />
                        <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Etiqueta</label>
                    </div>
                    <div className="formInputContainer">
                        <input type="text" value={formYear}
                            className={`formInput ${primary(theme)}`}
                            onChange={e => { setFormYear(e.target.value) }}
                            onFocus={e => { e.target.placeholder = "24-25"; }}
                            onBlur={e => { e.target.placeholder = ""; }}
                            required />
                        <div className={`underline ${accent(theme)}`} />
                        <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Año</label>
                    </div>
                    {isLoadingTeachers && <div className="loadingHUDCentered"><LoadingHUD /></div>}
                    <div className="formInputSelectContainer selectWithTopMargin hidableFormSelectContainer">
                        <select name="tutorUsername"
                            value={formTutorUsername}
                            onChange={e => { setFormTutorUsername(e.target.value); }}
                            className={`formInputSelect ${primary(theme)} ${isLoadingTeachers === true ? "hidableFormSelectHidden" : "hidableFormSelectShown"}`}>
                            {availableTeachers.length > 0 ?
                                availableTeachers.map(t => {
                                    return <option value={t.username}>{`Tutor: ${t.name} ${t.surname}`}</option>
                                }) :
                                <option value={NOT_VALID}>-- No existen docentes. ¡Crea uno! --</option>
                            }
                        </select>
                    </div>
                    <div className="formInputContainer">
                        <input type="submit" className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`} value="Crear" disabled={formTutorUsername === NOT_VALID || isLoadingTeachers === true} />
                    </div>
                    {isLoadingSubmit && <div className="loadingHUDCentered"><LoadingHUD /></div>}
                </form>
            </div>
        </div>
    </div> : <></>
}

export default CreateGroupDialog;