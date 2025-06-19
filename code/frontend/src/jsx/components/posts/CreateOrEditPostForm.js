import { useContext, useState } from "react";
import { EduAPIFetch } from "../../../client/APIFetch";
import LoadingHUD from "../common/LoadingHUD";
import FilePicker from "../common/FilePicker";
import { DocuAPIFetch } from "../../../client/APIFetch";
import { accent, accentFormLabel, pointableSecondary, primary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";
import TextAreaWithLimit from "../common/TextAreaWithLimit";

const CreateOrEditPostForm = (props) => {
    const TODAY = new Date().toISOString().split("T")[0];
    const UNIT_UNASSIGNED = -1;
    const [formTitle, setFormTitle] = useState(props.postBeingEdited ? props.postBeingEdited.title : "");
    const [formContent, setFormContent] = useState(props.postBeingEdited ? props.postBeingEdited.content : "");
    const [formUnitId, setFormUnitId] = useState(props.postBeingEdited ? props.postBeingEdited.unit_id : UNIT_UNASSIGNED);
    const [formAssignmentDueDate, setFormAssignmentDueDate] = useState(props.postBeingEdited ? props.postBeingEdited.assignment_due_date : TODAY);
    const [attachedFilesReady, setAttachedFilesReady] = useState(props.postBeingEdited ? props.postBeingEdited.files : []);
    const [isLoading, setLoading] = useState(false);
    const theme = useContext(ThemeContext);

    const onSubmitCreateOrEditPost = (event) => {
        event.preventDefault();

        if (attachedFilesReady.length === 0) {
            sendEduPostRequest();
        } else {
            uploadFilesThenSendEduPostRequest();
        }
    }

    const uploadFilesThenSendEduPostRequest = () => {
        setLoading(true);
        // `attachedFilesReady` are those in the drop area. Bear in mind that:
        // - If we are creating a new post, all of them must be uploaded to DocuREST who will baptise them with identifiers
        // - If we are editing a post maybe none, some or all have already been uploaded (this is, they
        //   come from props.postBeingEdited.files) in which case they already have an identifier
        //   We don't need to reupload them to DocuREST! We just need to put them in the amendment json body 
        //   with their identifiers; so that EduREST knows that they aren't being modified.
        //   The files that are new need to be uploaded previously to DocuREST, of course
        const newFilesThatMustBeUploaded = attachedFilesReady.filter(f => f.identifier === undefined);
        const filesThatAlreadyExistInDocuREST = attachedFilesReady.filter(f => f.identifier !== undefined);
        const body = {
            filetree_info: {
                must_save_to_filetree: false
            },
            files: newFilesThatMustBeUploaded
        }
        if (newFilesThatMustBeUploaded.length > 0) {
            DocuAPIFetch("POST", "/api/v1/documents", body)
                .then(json => {
                    if ((json.success === true) && (json.result.operation === "documents_added")) {
                        sendEduPostRequest([...json.result.documents, ...filesThatAlreadyExistInDocuREST]);
                    } else {
                        setLoading(false);
                        props.onFinished("Se ha producido un error");
                        props.onDismiss();
                    }
                })
                .catch(error => {
                    setLoading(false);
                    props.onFinished(error.error ?? "Se ha producido un error");
                    props.onDismiss();
                })
        } else {
            sendEduPostRequest([...filesThatAlreadyExistInDocuREST]);
        }
    }

    const sendEduPostRequest = (attachedFiles = []) => {
        setLoading(true);
        let body = {
            title: formTitle,
            content: formContent,
            files: attachedFiles,
            post_type: props.postType
        }
        if (formUnitId !== UNIT_UNASSIGNED) {
            body["unit_id"] = formUnitId;
        }
        if (props.showDatePicker && formAssignmentDueDate !== "") {
            body["assignment_due_date"] = formAssignmentDueDate;
        }
        let url;
        if (props.postBeingEdited) {
            url = `/api/v1/posts/${props.postBeingEdited.id}/amendments`;
        } else {
            url = `/api/v1/classes/${props.classIdForPostCreation}/posts`;
        }
        EduAPIFetch("POST", url, body)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    props.onFinished();
                    setFormTitle("");
                    setFormContent("");
                } else {
                    props.onFinished("Se ha producido un error");
                }
                props.onDismiss();
            })
            .catch(error => {
                setLoading(false);
                props.onFinished(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }


    return <div className="createOrEditPostFormContainer">
        <form onSubmit={onSubmitCreateOrEditPost}>
            <div className="postFormFirstRowInputsContainer">
                <div className="formInputSelectContainer">
                    <select name="unit"
                        value={formUnitId}
                        className={`formInputSelect ${primary(theme)}`}
                        onChange={e => { setFormUnitId(e.target.value); }} >
                        <option value={UNIT_UNASSIGNED}>Sin tema</option>
                        {props.units.map(g => {
                            return <option value={g.id}>{g.name}</option>
                        })}
                    </select>
                </div>
                {props.showDatePicker &&
                    <div className="formInputContainer formInputDivCreatePostTaskDate">
                        <input className={`formInput formInputCreatePostTaskDate ${primary(theme)}`}
                            type="date"
                            min={TODAY}
                            value={formAssignmentDueDate}
                            onChange={e => { setFormAssignmentDueDate(e.target.value) }} />
                    </div>}
                <div className="formInputContainer">
                    <input className={`formInput formInputCreatePostTitle ${primary(theme)}`} type="text" value={formTitle}
                        onChange={e => { setFormTitle(e.target.value) }}
                        maxLength={100}
                        required />
                    <div className={`underline ${accent(theme)}`} />
                    <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Título</label>
                </div>
            </div>
            <TextAreaWithLimit value={formContent} setValue={setFormContent} maxLength={3000} small={false} />
            <FilePicker attachedFilesReady={attachedFilesReady} setAttachedFilesReady={setAttachedFilesReady} />
            <div className="formInputContainer">
                <input type="submit" className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`} value={props.submitText} />
            </div>
            {props.showDeleteButton && <div className="formSecondSubmit formSecondSubmitDestructive">
                <button onClick={props.onDeleteClicked}>❌ Eliminar</button>
            </div>}
            {isLoading && <div className="loadingHUDCentered"><LoadingHUD /></div>}
        </form>
    </div>
}

export default CreateOrEditPostForm;