import { useContext, useState } from "react";
import FilePicker from "../common/FilePicker";
import { EduAPIFetch } from "../../../client/APIFetch";
import { DocuAPIFetch } from "../../../client/APIFetch";
import AreYouSureDialog from "./AreYouSureDialog";
import { borderPrimary, pointableSecondary, primary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";

const SubmitAssignmentDialog = (props) => {
    const [formComment, setFormComment] = useState("");
    const [filesReadyToUpload, setFilesReadyToUpload] = useState([]);
    const [showAreYouSurePopup, setShowAreYouSurePopup] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const theme = useContext(ThemeContext);

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
        let body = {
            files: uploadedFiles
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
            <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
                <div className="card dialogBackground">
                    <div className="dialogTitle">Entregar tarea</div>
                    <form onSubmit={() => { setShowAreYouSurePopup(true); }}>
                        <textarea value={formComment}
                            className={`formTextArea smallText ${borderPrimary(theme)}`}
                            onChange={e => { setFormComment(e.target.value) }}
                            placeholder="Sobre esta entrega, quiero comentar que..." />
                        <FilePicker attachedFilesReady={filesReadyToUpload} setAttachedFilesReady={setFilesReadyToUpload} />
                        <div className="formInputContainer">
                            <input type="submit" className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`} value="Entregar" disabled={formComment === "" && filesReadyToUpload.length === 0} />
                        </div>
                    </form>
                </div>
            </div>
        </div> : <></>
}

export default SubmitAssignmentDialog;