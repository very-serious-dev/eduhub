import { useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import EduAPIFetch from "../../../client/EduAPIFetch";

const CreatePostDialog = (props) => {
    const [formTitle, setFormTitle] = useState("");
    const [formContent, setFormContent] = useState("");
    const [formUnit, setFormUnit] = useState();
    const [formTaskInstructions, setFormTaskInstructions] = useState();
    const [formTaskDueDate, setFormTaskDueDate] = useState();
    const [isLoading, setLoading] = useState(false);

    const onSubmitCreatePost = (event) => {
        event.preventDefault();
        let body = {
            //
        }
        const options = {
            method: "POST",
            body: JSON.stringify(body),
            credentials: "include"
        };
        setLoading(true);
        EduAPIFetch(`/api/v1/classes/${props.classId}/posts`, options)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    //props.onClassAdded();
                    //setFormName("");
                } else {
                    //props.onClassAdded("Se ha producido un error");
                }
                props.onDismiss();
            })
            .catch(error => {
                setLoading(false);
                //props.onClassAdded(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }

    return props.show === true ? <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <form onSubmit={onSubmitCreatePost}>
                    <div className="formInput">
                        <input type="text" value={formTitle}
                            onChange={e => { setFormTitle(e.target.value) }}
                            onFocus={e => { e.target.placeholder = "Autores del siglo XVII"; }}
                            onBlur={e => { e.target.placeholder = ""; }}
                            required />
                        <div className="underline"></div>
                        <label htmlFor="">Título</label>
                    </div>
                    {/* WORK FROM HERE*/}
                    <div className="formInputSelect createClassSelect">
                        <select name="group"
                            value={formGroup}
                            onChange={e => { setFormGroup(e.target.value); }} >
                                {props.groups.length > 0 ?
                                props.groups.map(g => {
                                    return <option value={g.tag}>{g.tag}</option>
                                }) :
                                <option value={NOT_VALID}>-- No existen grupos. ¡Crea uno! --</option>
                            }
                        </select>
                    </div>
                    <div className="formSubmit">
                        <input type="submit" value="Publicar" />
                    </div>
                    {isLoading && <div className="dialogHUDCentered"><LoadingHUD /></div>}
                </form>
            </div>
        </div>
    </div> : <></>
}

export default CreateClassDialog;