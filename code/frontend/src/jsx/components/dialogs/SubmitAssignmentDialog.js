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
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, ARE_YOU_SURE_UPLOAD
    const [isLoading, setLoading] = useState(false);
    const theme = useContext(ThemeContext);

    const uploadFilesThenSendEduRequest = () => {
        setLoading(true);
        const body = {
            filetree_info: {
                must_save_to_filetree: false
            },
            files: files
        }
        DocuAPIFetch("POST", "/api/v1/documents", body)
            .then(json => {
                if ((json.success === true) && (json.result.operation === "documents_added")) {
                    sendEduRequest([...json.result.documents]);
                } else {
                    setLoading(false);
                    setPopupShown("NONE");
                    props.onSubmitCreated("Se ha producido un error");
                    props.onDismiss();
                }
            })
            .catch(error => {
                setLoading(false);
                setPopupShown("NONE");
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
                    setFiles([]);
                } else {
                    props.onSubmitCreated("Se ha producido un error");
                }
                setPopupShown("NONE");
                props.onDismiss();
            })
            .catch(error => {
                setLoading(false);
                setPopupShown("NONE");
                props.onSubmitCreated(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }

    const onSubmit = () => {
        uploadFilesThenSendEduRequest();
    }

    return <>
        {popupShown === "ARE_YOU_SURE_UPLOAD" &&
            <AreYouSureDialog onActionConfirmed={onSubmit}
                onDismiss={() => { setPopupShown("NONE"); }}
                isLoading={isLoading}
                dialogMode="SUBMIT"
                warningMessage="⚠️ Tu entrega es definitiva y no se puede corregir. Asegúrate de revisar los documentos que entregues" />}
        {popupShown === "NONE" && <div className="popupOverlayBackground" onClick={props.onDismiss}>
            <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
                <div className="card dialogBackground">
                    <div className="dialogTitle">Entregar tarea</div>
                    <form onSubmit={() => { setPopupShown("ARE_YOU_SURE_UPLOAD"); }}>
                        <TextAreaWithLimit value={formComment} setValue={setFormComment} maxLength={1000} small={true} />
                        <FilePicker files={files} setFiles={setFiles} showChooseFromMyUnit={true} />
                        <div className="formInputContainer">
                            <input type="submit" className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`} value="Entregar" disabled={formComment === "" && files.length === 0} />
                        </div>
                    </form>
                </div>
            </div>
        </div>}
    </>
}

export default SubmitAssignmentDialog;