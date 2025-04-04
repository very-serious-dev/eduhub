import { useState } from "react";
import DropFilesArea from "../common/DropFilesArea";
import EduAPIFetch from "../../../client/EduAPIFetch";
import DocuAPIFetch from "../../../client/DocuAPIFetch";
import AreYouSureDialog from "./AreYouSureDialog";

const SubmitAssignmentDialog = (props) => {
    const [formComment, setFormComment] = useState("");
    const [filesReadyToUpload, setFilesReadyToUpload] = useState([]);
    const [showAreYouSurePopup, setShowAreYouSurePopup] = useState(false);
    const [isLoading, setLoading] = useState(false);

    const uploadFilesThenSendEduRequest = () => {
        setLoading(true);
        const body = {
            filetree_info: {
                must_save_to_filetree: false
            },
            files: filesReadyToUpload
        }
        DocuAPIFetch("POST", "/api/v1/documents", body)
            .then(json => {
                if ((json.success === true) && (json.result.operation === "documents_added")) {
                    sendEduRequest([...json.result.documents]);
                } else {
                    setLoading(false);
                    setShowAreYouSurePopup(false);
                    props.onSubmitCreated("Se ha producido un error");
                    props.onDismiss();
                }
            })
            .catch(error => {
                setLoading(false);
                setShowAreYouSurePopup(false);
                props.onSubmitCreated(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }

    const sendEduRequest = (uploadedFiles = []) => {
        setLoading(true);
        let body = {}
        if (formComment !== undefined && formComment !== "") {
            body["comment"] = formComment;
        }
        if (uploadedFiles.length > 0) {
            body["files"] = uploadedFiles;
        }
        EduAPIFetch("POST", `/api/v1/assignments/${props.assignmentId}/submits`, body)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    props.onSubmitCreated();
                    setFormComment("");
                    setFilesReadyToUpload([]);
                } else {
                    props.onSubmitCreated("Se ha producido un error");
                }
                setShowAreYouSurePopup(false);
                props.onDismiss();
            })
            .catch(error => {
                setLoading(false);
                setShowAreYouSurePopup(false);
                props.onSubmitCreated(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }

    const onSubmit = () => {
        uploadFilesThenSendEduRequest();
    }

    return props.show === true ? showAreYouSurePopup ?
        <AreYouSureDialog onActionConfirmed={onSubmit}
            onDismiss={() => { setShowAreYouSurePopup(false); }}
            isLoading={isLoading}
            dialogMode="SUBMIT"
            warningMessage="⚠️ Tu entrega es definitiva y no se puede corregir. Asegúrate de revisar los documentos que entregues" />
        : <div className="popupOverlayBackground" onClick={props.onDismiss}>
            <div className="popup" onClick={e => { e.stopPropagation(); }}>
                <div className="card dialogBackground">
                    <div className="dialogTitle">Entregar tarea</div>
                    <form onSubmit={() => { setShowAreYouSurePopup(true); }}>
                        <DropFilesArea attachedFilesReady={filesReadyToUpload} setAttachedFilesReady={setFilesReadyToUpload} />
                        <div className="formTextArea formTextAreaSmall">
                            <textarea value={formComment}
                                onChange={e => { setFormComment(e.target.value) }}
                                placeholder="Sobre esta entrega, quiero comentar que..." />
                            </div>
                        <div className="formSubmit">
                            <input type="submit" value="Entregar" disabled={formComment === "" && filesReadyToUpload.length === 0}/>
                        </div>
                    </form>
                </div>
            </div>
        </div> : <></>
}

export default SubmitAssignmentDialog;