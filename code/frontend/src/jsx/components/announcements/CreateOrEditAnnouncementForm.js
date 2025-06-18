import { useContext, useState } from "react";
import { EduAPIFetch } from "../../../client/APIFetch";
import LoadingHUD from "../common/LoadingHUD";
import FilePicker from "../common/FilePicker";
import { DocuAPIFetch } from "../../../client/APIFetch";
import { accent, accentFormLabel, borderPrimary, pointableSecondary, primary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";
import { textAreaDefaultPlaceholder } from "../../../util/Formatter";

const CreateOrEditAnnouncementForm = (props) => {
    const [formTitle, setFormTitle] = useState(props.announcementBeingEdited ? props.announcementBeingEdited.title : "");
    const [formContent, setFormContent] = useState(props.announcementBeingEdited ? props.announcementBeingEdited.content : "");
    const [attachedFilesReady, setAttachedFilesReady] = useState(props.announcementBeingEdited ? props.announcementBeingEdited.files : []);
    const [isLoading, setLoading] = useState(false);
    const theme = useContext(ThemeContext);

    const onSubmitCreateOrEditAnnouncement = (event) => {
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
        // - If we are creating a new announcement, all of them must be uploaded to DocuREST who will baptise them with identifiers
        // - If we are editing an announcement maybe none, some or all have already been uploaded (this is, they
        //   come from props.announcementBeingEdited.files) in which case they already have an identifier
        //   We don't need to reupload them to DocuREST!
        //   @see CreateOrEditPostForm (same logic)
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
                        onBlur={e => { e.target.placeholder = ""; }} required />
                    <div className={`underline ${accent(theme)}`}></div>
                    <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Título</label>
                </div>
            </div>
            <textarea value={formContent}
                className={`formTextArea bigText ${borderPrimary(theme)}`}
                placeholder={textAreaDefaultPlaceholder}
                onChange={e => { setFormContent(e.target.value) }}
                onFocus={e => { e.target.placeholder = "Las fotos serán el próximo jueves. Acordaos de:\n\n- Tener dinero para pagar al fotógrafo\n- ¡Venir con una sonrisa! (a pesar de las notas)"; }}
                onBlur={e => { e.target.placeholder = textAreaDefaultPlaceholder; }} required />
            <FilePicker attachedFilesReady={attachedFilesReady} setAttachedFilesReady={setAttachedFilesReady} />
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