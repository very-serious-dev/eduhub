import { useEffect, useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import EduAPIFetch from "../../../client/EduAPIFetch";

const CreateGroupDialog = (props) => {
    const NOT_VALID = "NOT_VALID"
    const [formName, setFormName] = useState("");
    const [formTag, setFormTag] = useState("");
    const [formYear, setFormYear] = useState("");
    const [formTutorUsername, setFormTutorUsername] = useState(NOT_VALID);
    const [availableTeachers, setAvailableTeachers] = useState([]);
    const [isLoadingSubmit, setLoadingSubmit] = useState(false);
    const [isLoadingTeachers, setLoadingTeachers] = useState(false);

    useEffect(() => {
        setLoadingTeachers(true);
        EduAPIFetch("/api/v1/admin/users/teachers", { method: "GET", credentials: "include" })
            .then(json => {
                console.log(json)
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
        event.preventDefault();
        const options = {
            method: "POST",
            body: JSON.stringify({
                name: formName,
                tag: formTag,
                year: formYear,
                tutor_username: formTutorUsername
            }),
            credentials: "include"
        };
        setLoadingSubmit(true);
        EduAPIFetch("/api/v1/admin/groups", options)
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
        <div className="popupForm" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">Nuevo grupo</div>
                <form onSubmit={onSubmitAddGroup}>
                    <div className="formInput">
                        <input type="text" value={formName}
                            onChange={e => { setFormName(e.target.value) }}
                            onFocus={e => { e.target.placeholder = "Bachillerato 1º"; }}
                            onBlur={e => { e.target.placeholder = ""; }}
                            required />
                        <div className="underline"></div>
                        <label htmlFor="">Nombre</label>
                    </div>
                    <div className="formInput">
                        <input type="text" value={formTag}
                            onChange={e => { setFormTag(e.target.value) }}
                            onFocus={e => { e.target.placeholder = "BACH1"; }}
                            onBlur={e => { e.target.placeholder = ""; }}
                            required />
                        <div className="underline"></div>
                        <label htmlFor="">Etiqueta</label>
                    </div>
                    <div className="formInput">
                        <input type="text" value={formYear}
                            onChange={e => { setFormYear(e.target.value) }}
                            onFocus={e => { e.target.placeholder = "24-25"; }}
                            onBlur={e => { e.target.placeholder = ""; }}
                            required />
                        <div className="underline"></div>
                        <label htmlFor="">Año</label>
                    </div>
                    {isLoadingTeachers && <div className="dialogHUDCentered"><LoadingHUD /></div>}
                    <div className="formInputSelect addGroupSelect hidableFormSelectContainer">
                        <select name="tutorUsername"
                            value={formTutorUsername}
                            onChange={e => { setFormTutorUsername(e.target.value); }}
                            className={isLoadingTeachers === true ? "hidableFormSelectHidden" : "hidableFormSelectShown"}>
                            {availableTeachers.length > 0 ?
                                availableTeachers.map(t => {
                                    return <option value={t.username}>{`Tutor: ${t.name} ${t.surname}`}</option>
                                }) :
                                <option value={NOT_VALID}>-- No existen docentes. ¡Crea uno! --</option>
                            }
                        </select>
                    </div>
                    <div className="formSubmit">
                        <input type="submit" value="Crear" disabled={formTutorUsername === NOT_VALID || isLoadingTeachers === true} />
                    </div>
                    {isLoadingSubmit && <div className="dialogHUDCentered"><LoadingHUD /></div>}
                </form>
            </div>
        </div>
    </div> : <></>
}

export default CreateGroupDialog;