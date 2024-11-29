import { useState } from "react";
import EduAPIFetch from "../../../client/EduAPIFetch";
import LoadingHUD from "../common/LoadingHUD";

const CreatePostTabForm = (props) => {
    const UNIT_UNASSIGNED = -1;
    // TO-DO: Add post type (regular vs. task)
    const [formTitle, setFormTitle] = useState("");
    const [formContent, setFormContent] = useState("");
    const [formUnitId, setFormUnitId] = useState(UNIT_UNASSIGNED);
    const [formTaskDueDate, setFormTaskDueDate] = useState();
    const [isLoading, setLoading] = useState(false);

    const onSubmitCreatePost = (event) => {
        event.preventDefault();
        setLoading(true);
        let body = {
            title: formTitle,
            content: formContent
        }
        if (formUnitId !== UNIT_UNASSIGNED) {
            body["unit_id"] = formUnitId;
        }
        EduAPIFetch("POST", `/api/v1/classes/${props.classId}/posts`, body)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    props.onPostAdded();
                    setFormTitle("");
                    setFormContent("");
                } else {
                    props.onPostAdded("Se ha producido un error");
                }
                props.onDismiss();
            })
            .catch(error => {
                setLoading(false);
                props.onPostAdded(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }

    return <div className="createPostFormContainer">
        <form onSubmit={onSubmitCreatePost}>
            <div className="postFormFirstRowInputsContainer">
                <div className="formInputSelect">
                    <select name="unit"
                        value={formUnitId}
                        onChange={e => { setFormUnitId(e.target.value); }} >
                        <option value={UNIT_UNASSIGNED}>Sin tema</option>
                        {props.units.map(g => {
                            return <option value={g.id}>{g.name}</option>
                        })}
                    </select>
                </div>
                <div className="formInput"> { /* FIX-ME: Label animation doesn't collapse (since field it's not required, apparently) */}
                    <input className="formInputCreatePostTitle" type="text" value={formTitle}
                        onChange={e => { setFormTitle(e.target.value) }}
                        onFocus={e => { e.target.placeholder = "Autores del siglo XVII"; }}
                        onBlur={e => { e.target.placeholder = ""; }} required />
                    <div className="underline"></div>
                    <label htmlFor="">Título</label>
                </div>
            </div>
            <div className="formTextArea">
                <textarea placeholder="¡Acordaos de tomaros las cosas con calma! Estamos aquí para aprender :)"
                    value={formContent}
                    onChange={e => { setFormContent(e.target.value) }}
                    onFocus={e => { e.target.placeholder = "Los autores del siglo XVII eran..."; }}
                    required />
            </div>
            <div className="formSubmit">
                <input type="submit" value="Publicar" />
            </div>
            {isLoading && <div className="dialogHUDCentered"><LoadingHUD /></div>}
        </form>
    </div>
}

export default CreatePostTabForm;