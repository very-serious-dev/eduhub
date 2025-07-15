import { useContext, useEffect, useState } from "react";
import { EduAPIFetch } from "../../../client/APIFetch";
import LoadingHUD from "../common/LoadingHUD";
import FilePicker from "../common/FilePicker";
import { DocuAPIFetch } from "../../../client/APIFetch";
import { accent, accentFormLabel, pointableSecondary, primary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";
import TextAreaWithLimit from "../common/TextAreaWithLimit";
import { assertValidAttachmentsErrorMessage } from "../../../util/NewFilesValidator";

const CreateOrEditPostForm = (props) => {
    const TODAY_23_59 = `${new Date().toISOString().split("T")[0]}T23:59`;
    const UNIT_UNASSIGNED = -1;
    const [formTitle, setFormTitle] = useState(props.postBeingEdited ? props.postBeingEdited.title : "");
    const [formContent, setFormContent] = useState(props.postBeingEdited ? props.postBeingEdited.content : "");
    const [formUnitId, setFormUnitId] = useState(props.postBeingEdited ? props.postBeingEdited.unit_id : UNIT_UNASSIGNED);
    const [formAssignmentLocalDueDate, setFormAssignmentLocalDueDate] = useState(TODAY_23_59);
    const [attachments, setAttachments] = useState(props.postBeingEdited ? props.postBeingEdited.attachments : []);
    const [isLoading, setLoading] = useState(false);
    const theme = useContext(ThemeContext);

    useEffect(() => {
        setFormAssignmentLocalDueDate(postBeingEditedDueDateLocalTime() ?? TODAY_23_59);
    }, []);

    useEffect(() => {
        if (!props.showCreateQuestionnaire) { return; }

        const newQuestionnaireChannel = new BroadcastChannel("new_questionnaire");
        newQuestionnaireChannel.onmessage = (event) => {
            if (event.data.operation === "questionnaire_added") {
                const newQuestionnaire = { ...event.data.questionnaire, type: "questionnaire" };
                const errorMessage = assertValidAttachmentsErrorMessage([newQuestionnaire], attachments);
                if (errorMessage !== null) {
                    alert(errorMessage);
                    return;
                }
                setAttachments(old => [...old, newQuestionnaire])
            }
        }
        return () => { newQuestionnaireChannel.close() }
    }, []);

    const onSubmitCreateOrEditPost = (event) => {
        event.preventDefault();
        if (formTitle.includes(',') || formTitle.includes('"')) {
            alert("Las publicaciones no pueden contener comas (,) o comillas (\") en el título");
            return;
        }
        if (attachments.length === 0) {
            sendEduPostRequest();
        } else {
            uploadFilesThenSendEduPostRequest();
        }
    }

    const uploadFilesThenSendEduPostRequest = () => {
        setLoading(true);
        // `attachments` are those in the drop area. Bear in mind that:
        // 1) If we are creating a new post:
        //    - They might be fresh uploads or selected from 'My Drive'. 
        //    - For those that are fresh, they must be uploaded to DocuREST who will baptise them with identifiers
        //    - For those selected from 'My Drive', they already have an identifier
        // 2) If we are editing a post:
        //    - Files might be [1] fresh uploads, or [2] previously uploaded or [3] selected from 'My Drive'
        //    - For those that are fresh, they are uploaded to DocuREST first and baptised there
        //    - For [2] or [3], it's basically the same scenario: They already have an identifier and exist inside EduREST
        const files = attachments.filter(a => a.type === "document");
        const questionnaires = attachments.filter(a => a.type === "questionnaire");
        const newFilesThatMustBeUploaded = files.filter(f => f.identifier === undefined);
        const filesThatAlreadyExistInDocuREST = files.filter(f => f.identifier !== undefined);
        if (newFilesThatMustBeUploaded.length > 0) {
            const body = {
                filetree_info: {
                    must_save_to_filetree: false
                },
                files: newFilesThatMustBeUploaded
            }
            DocuAPIFetch("POST", "/api/v1/documents", body)
                .then(json => {
                    if ((json.success === true) && (json.result.operation === "documents_added")) {
                        const newlyUploadedFiles = json.result.documents.map(d => { return { ...d, type: "document" } })
                        sendEduPostRequest([...newlyUploadedFiles, ...filesThatAlreadyExistInDocuREST, ...questionnaires]);
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
            sendEduPostRequest([...filesThatAlreadyExistInDocuREST, ...questionnaires]);
        }
    }

    const sendEduPostRequest = (attachedFilesOrQuestionnaires = []) => {
        setLoading(true);
        let body = {
            title: formTitle,
            content: formContent,
            attachments: attachedFilesOrQuestionnaires,
            post_type: props.postType
        }
        if (formUnitId !== UNIT_UNASSIGNED) {
            body["unit_id"] = formUnitId;
        }
        if (props.showDatePicker) {
            const awareDatetime = new Date(formAssignmentLocalDueDate)
            body["assignment_due_date"] = awareDatetime.toISOString();
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

    const postBeingEditedDueDateLocalTime = () => {
        if (props.postBeingEdited) {
            // https://stackoverflow.com/a/51643788
            const t = new Date(props.postBeingEdited.assignment_due_date);
            const z = t.getTimezoneOffset() * 60 * 1000;
            const tLocal = new Date(t - z);
            return tLocal.toISOString().split('.')[0].slice(0, -3);
        }
    }

    const onCreateNewQuestionnaire = () => {
        window.open("/create-form", "_blank");
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
                            type="datetime-local"
                            value={formAssignmentLocalDueDate}
                            onChange={e => { setFormAssignmentLocalDueDate(e.target.value ?? "") }}
                            required />
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
            <TextAreaWithLimit value={formContent} setValue={setFormContent} maxLength={3000} small={false} extraBig={!props.showCreateQuestionnaire} />
            <FilePicker attachments={attachments} setAttachments={setAttachments} showChooseFromMyUnit={true} />
            {props.showCreateQuestionnaire && <><div className="createOrEditPostSeparatorContainer"><div className={`createOrEditPostSeparator ${primary(theme)}`}></div></div>
                <div className={`createOrEditPostNewQuestionnareButton pointable ${primary(theme)} ${pointableSecondary(theme)}`}
                    onClick={onCreateNewQuestionnaire}>
                    Crear formulario 📝
                </div></>}
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