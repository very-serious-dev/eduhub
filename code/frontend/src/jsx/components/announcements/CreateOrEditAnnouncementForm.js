import { useContext, useState } from "react";
import { EduAPIFetch } from "../../../client/APIFetch";
import LoadingHUD from "../common/LoadingHUD";
import FilePicker from "../common/FilePicker";
import { DocuAPIFetch } from "../../../client/APIFetch";
import { accent, accentFormLabel, pointableSecondary, primary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";
import TextAreaWithLimit from "../common/TextAreaWithLimit";

const CreateOrEditAnnouncementForm = (props) => {
    const [formTitle, setFormTitle] = useState(props.announcementBeingEdited ? props.announcementBeingEdited.title : "");
    const [formContent, setFormContent] = useState(props.announcementBeingEdited ? props.announcementBeingEdited.content : "");
    const [files, setFiles] = useState(props.announcementBeingEdited ? props.announcementBeingEdited.files : [])
    const [isLoading, setLoading] = useState(false);
    const theme = useContext(ThemeContext);

    const onSubmitCreateOrEditAnnouncement = (event) => {
        event.preventDefault();

        if (files.length === 0) {
            sendEduPostRequest();
        } else {
            uploadFilesThenSendEduPostRequest();
        }
    }

    const uploadFilesThenSendEduPostRequest = () => {
        setLoading(true);
        // see CreateOrEditPostForm or SubmitAssignmentDialog (same logic)
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
            files: attachedFiles
        }
        let url, method;
        if (props.announcementBeingEdited) {
            method = "PUT";
            url = `/api/v1/announcements/${props.announcementBeingEdited.id}`;
        } else {
            method = "POST";
            url = `/api/v1/groups/${props.groupTag}/announcements`;
        }
        EduAPIFetch(method, url, body)
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
        <form onSubmit={onSubmitCreateOrEditAnnouncement}>
            <div className="postFormFirstRowInputsContainer">
                <div className="formInputContainer">
                    <input className={`formInput formInputCreatePostTitle ${primary(theme)}`} type="text" value={formTitle}
                        onChange={e => { setFormTitle(e.target.value) }}
                        onFocus={e => { e.target.placeholder = "Fotos de la graduación"; }}
                        onBlur={e => { e.target.placeholder = ""; }}
                        maxLength={100}
                        required />
                    <div className={`underline ${accent(theme)}`}></div>
                    <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Título</label>
                </div>
            </div>
            <TextAreaWithLimit value={formContent} setValue={setFormContent} maxLength={3000} small={false} />
            <FilePicker files={files} setFiles={setFiles} showChooseFromMyUnit={true} />
            <div className="formInputContainer">
                <input className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`} type="submit" value={props.submitText} />
            </div>
            {props.showDeleteButton && <div className="formSecondSubmit formSecondSubmitDestructive">
                <button onClick={props.onDeleteClicked}>❌ Eliminar</button>
            </div>}
            {isLoading && <div className="loadingHUDCentered"><LoadingHUD /></div>}
        </form>
    </div>
}

export default CreateOrEditAnnouncementForm;