import { useState } from "react";
import EduAPIFetch from "../../../client/EduAPIFetch";
import LoadingHUD from "../common/LoadingHUD";
import DropFilesArea from "../common/DropFilesArea";
import DocuAPIFetch from "../../../client/DocuAPIFetch";

const CreatePostTabForm = (props) => {
    const TODAY = new Date().toISOString().split("T")[0];
    const UNIT_UNASSIGNED = -1;
    const [formTitle, setFormTitle] = useState("");
    const [formContent, setFormContent] = useState("");
    const [formUnitId, setFormUnitId] = useState(UNIT_UNASSIGNED);
    const [formTaskDueDate, setFormTaskDueDate] = useState(TODAY);
    const [filesReadyToUpload, setFilesReadyToUpload] = useState([]);
    const [isLoading, setLoading] = useState(false);

    const onSubmitCreatePost = (event) => {
        event.preventDefault();
        
        if (filesReadyToUpload.length === 0) {
            sendEduPostRequest();
        } else {
            uploadFilesThenSendEduPostRequest();
        }
    }

    const uploadFilesThenSendEduPostRequest = () => {
        setLoading(true);
        DocuAPIFetch("POST", "/api/v1/documents", { files: filesReadyToUpload })
        .then(json => {
            if (json.success === true) {
                sendEduPostRequest(json.uploaded_files);
            } else {
                setLoading(false);
                props.onPostAdded("Se ha producido un error");
                props.onDismiss();
            }
        })
        .catch(error => {
            setLoading(false);
            props.onPostAdded(error.error ?? "Se ha producido un error");
            props.onDismiss();
        })
    }

    const sendEduPostRequest = (uploadedFiles = []) => {
        setLoading(true);
        let body = {
            title: formTitle,
            content: formContent,
            post_type: props.isTask ? "task" : "publication"
        }
        if (formUnitId !== UNIT_UNASSIGNED) {
            body["unit_id"] = formUnitId;
        }
        if (props.isTask === true) {
            body["task_due_date"] = formTaskDueDate;
        }
        if (uploadedFiles.length > 0) {
            body["files"] = uploadedFiles;
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
                { /* NICE-TO-HAVE: Allow empty task due dates */}
                { props.isTask === true && 
                <div className="formInput formInputDivCreatePostTaskDate">
                    <input className="formInputCreatePostTaskDate"
                        type="date"
                        min={TODAY}
                        value={formTaskDueDate}
                        onChange={e => {setFormTaskDueDate(e.target.value)}} />
                </div> }
                <div className="formInput"> 
                    <input className="formInputCreatePostTitle" type="text" value={formTitle}
                        onChange={e => { setFormTitle(e.target.value) }}
                        onFocus={e => { e.target.placeholder = props.isTask ? "Trabajo sobre la máquina de vapor" : "Filósofos del empirismo"; }}
                        onBlur={e => { e.target.placeholder = ""; }} required />
                    <div className="underline"></div>
                    <label htmlFor="">Título</label>
                </div>
            </div>
            <div className="formTextArea formTextAreaBig">
                <textarea value={formContent}
                    onChange={e => { setFormContent(e.target.value) }}
                    onFocus={e => { e.target.placeholder = props.isTask ? "Se debe subir un PDF sobre el tema de la máquina de vapor, con estos apartados:\n\n1. Año de invención y contexto histórico\n2. Inventor, historia\n3. Funcionamiento de la máquina de vapor\n4. Efecto en la industria y a nivel mundial\n\nHasta 1 punto extra sobre la nota del examen\nSe valorará el formato del documento y la gramática": "Los filósofos empiristas que entran en el examen son:\n\n- John Locke\n- Thomas Hobbes\n- George Berkeley\n- etc."; }}
                    onBlur={e => { e.target.placeholder = ""; }} required />
            </div>
            <DropFilesArea filesReadyToUpload={filesReadyToUpload} setFilesReadyToUpload={setFilesReadyToUpload} />
            <div className="formSubmit">
                <input type="submit" value={props.isTask ? "Crear tarea" : "Publicar"} />
            </div>
            
            {isLoading && <div className="dialogHUDCentered"><LoadingHUD /></div>}
        </form>
    </div>
}

export default CreatePostTabForm;