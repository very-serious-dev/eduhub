import { useContext, useState } from "react";
import EduAPIFetch from "../../../client/EduAPIFetch";
import LoadingHUD from "../common/LoadingHUD";
import DropFilesArea from "../common/DropFilesArea";
import DocuAPIFetch from "../../../client/DocuAPIFetch";
import { FeedbackContext } from "../../main/GlobalContainer";

const CreateOrEditAnnouncementForm = (props) => {
    const [formTitle, setFormTitle] = useState(props.announcementBeingEdited ? props.announcementBeingEdited.title : "");
    const [formContent, setFormContent] = useState(props.announcementBeingEdited ? props.announcementBeingEdited.content : "");
    const [attachedFilesReady, setAttachedFilesReady] = useState(props.announcementBeingEdited ? props.announcementBeingEdited.files : []);
    const [isLoading, setLoading] = useState(false);

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
                <div className="formInput">
                    <input className="formInputCreatePostTitle" type="text" value={formTitle}
                        onChange={e => { setFormTitle(e.target.value) }}
                        onFocus={e => { e.target.placeholder = "Fotos de la graduación"; }}
                        onBlur={e => { e.target.placeholder = ""; }} required />
                    <div className="underline"></div>
                    <label htmlFor="">Título</label>
                </div>
            </div>
            <div className="formTextArea formTextAreaBig">
                <textarea value={formContent}
                    onChange={e => { setFormContent(e.target.value) }}
                    onFocus={e => { e.target.placeholder = "Las fotos serán..."; }}
                    onBlur={e => { e.target.placeholder = ""; }} required />
            </div>
            <DropFilesArea attachedFilesReady={attachedFilesReady} setAttachedFilesReady={setAttachedFilesReady} />
            <div className="formSubmit">
                <input type="submit" value={props.submitText} />
            </div>
            {props.showDeleteButton && <div className="formSecondSubmit formSecondSubmitDestructive">
                <button onClick={props.onDeleteClicked}>❌ Eliminar</button>
            </div>}
            {isLoading && <div className="dialogScreenHUDCentered"><LoadingHUD /></div>}
        </form>
    </div>
}

export default CreateOrEditAnnouncementForm;