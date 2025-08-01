import { useContext, useState } from "react";
import FilePicker from "../common/FilePicker";
import { EduAPIFetch } from "../../../client/APIFetch";
import { DocuAPIFetch } from "../../../client/APIFetch";
import AreYouSureDialog from "./AreYouSureDialog";
import { pointableSecondary, primary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";
import TextAreaWithLimit from "../common/TextAreaWithLimit";

const SubmitAssignmentDialog = (props) => {
    const [formComment, setFormComment] = useState("");
    const [files, setFiles] = useState([]);
    const [showAreYouSure, setShowAreYouSure] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const theme = useContext(ThemeContext);

    const uploadFilesThenSendEduPostRequest = () => {
        setLoading(true);
        // see CreateOrEditPostForm or CreateOrEditAnnouncementForm (both same logic, but also handling questionnaires)
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
                        setShowAreYouSure(false);
                        props.onSubmitCreated("Se ha producido un error");
                        props.onDismiss();
                    }
                })
                .catch(error => {
                    setLoading(false);
                    setShowAreYouSure(false);
                    props.onSubmitCreated(error.error ?? "Se ha producido un error");
                    props.onDismiss();
                })
        } else {
            sendEduPostRequest([...filesThatAlreadyExistInDocuREST]);
        }
    }

    const sendEduPostRequest = (attachedFiles = []) => {
        setLoading(true);
        let body = {
            attachments: attachedFiles.map(a => { return { ...a, type: "document" } }),
        }
        if (formComment !== undefined && formComment !== "") {
            body["comment"] = formComment;
        }
        EduAPIFetch("POST", `/api/v1/assignments/${props.assignmentId}/submits`, body)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    props.onSubmitCreated();
                    setFormComment("");
                    setFiles([]);
                } else {
                    props.onSubmitCreated("Se ha producido un error");
                }
                setShowAreYouSure(false);
                props.onDismiss();
            })
            .catch(error => {
                setLoading(false);
                setShowAreYouSure(false);
                props.onSubmitCreated(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }

    const onSubmit = () => {
        if (files.length === 0) {
            sendEduPostRequest();
        } else {
            uploadFilesThenSendEduPostRequest();
        }
    }

    return showAreYouSure ?
        <AreYouSureDialog onActionConfirmed={onSubmit}
            onDismiss={() => { setShowAreYouSure(false); }}
            isLoading={isLoading}
            dialogMode="SUBMIT"
            warningMessage="⚠️ Tu entrega es definitiva y no se puede corregir. Asegúrate de revisar los documentos que entregues" />
        : <div className="popupOverlayBackground" onClick={props.onDismiss}>
            <div className="popup widePopup popupAllowOverflowY" onClick={e => { e.stopPropagation(); }}>
                <div className="card dialogBackground">
                    <div className="dialogTitle">Entregar tarea</div>
                    <form onSubmit={(event) => { event.preventDefault(); setShowAreYouSure(true) }}>
                        <TextAreaWithLimit value={formComment} setValue={setFormComment} maxLength={1000} small={true} allowEmptyContent={true} />
                        <FilePicker attachments={files} setAttachments={setFiles} showChooseFromMyUnit={true} />
                        <div className="formInputContainer">
                            <input type="submit" className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`} value="Entregar" disabled={formComment === "" && files.length === 0} />
                        </div>
                    </form>
                </div>
            </div>
        </div>
}

export default SubmitAssignmentDialog;