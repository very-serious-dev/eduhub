import { useState } from "react";
import AreYouSureSubmitDialog from "./AreYouSureSubmitDialog";
import DropFilesArea from "../common/DropFilesArea";
import EduAPIFetch from "../../../client/EduAPIFetch";
import DocuAPIFetch from "../../../client/DocuAPIFetch";

const SubmitAssignmentDialog = (props) => {
    const [formComment, setFormComment] = useState("");
    const [filesReadyToUpload, setFilesReadyToUpload] = useState([]);
    const [showAreYouSurePopup, setShowAreYouSurePopup] = useState(false);
    const [isLoading, setLoading] = useState(false);

    const uploadFilesThenSendEduRequest = () => {
        setLoading(true);
        DocuAPIFetch("POST", "/api/v1/documents", { files: filesReadyToUpload })
            .then(json => {
                if (json.success === true) {
                    sendEduRequest(json.uploaded_files);
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
        <AreYouSureSubmitDialog onActionConfirmed={onSubmit}
            onGoBack={() => { setShowAreYouSurePopup(false);}}
            onDismiss={() => { setShowAreYouSurePopup(false); props.onDismiss(); }}
            isLoading={isLoading} />
        : <div className="popupOverlayBackground" onClick={props.onDismiss}>
            <div className="popup" onClick={e => { e.stopPropagation(); }}>
                <div className="card dialogBackground">
                    <div className="dialogTitle">Entregar tarea</div>
                    <form onSubmit={() => { setShowAreYouSurePopup(true); }}>
                        <DropFilesArea filesReadyToUpload={filesReadyToUpload} setFilesReadyToUpload={setFilesReadyToUpload} />
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