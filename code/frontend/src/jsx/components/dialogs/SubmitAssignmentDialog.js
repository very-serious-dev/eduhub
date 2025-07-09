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

    const uploadFilesThenSendEduPostRequest = () => {
        setLoading(true);
        // see CreateOrEditPostForm or CreateOrEditAnnouncementForm (same logic)
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
        } else {
            sendEduPostRequest([...filesThatAlreadyExistInDocuREST]);
        }
    }

    const sendEduPostRequest = (attachedFiles = []) => {
        setLoading(true);
        let body = {
            files: attachedFiles
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
        console.log("bruh?")
        if (files.length === 0) {
            sendEduPostRequest();
        } else {
            uploadFilesThenSendEduPostRequest();
        }
    }

    return <>
        {popupShown === "ARE_YOU_SURE_UPLOAD" &&
            <AreYouSureDialog onActionConfirmed={onSubmit}
                onDismiss={() => { setPopupShown("NONE"); }}
                isLoading={isLoading}
                dialogMode="SUBMIT"
                warningMessage="⚠️ Tu entrega es definitiva y no se puede corregir. Asegúrate de revisar los documentos que entregues" />}
        {popupShown === "NONE" && <div className="popupOverlayBackground" onClick={props.onDismiss}>
            <div className="popup widePopup popupAllowOverflowY" onClick={e => { e.stopPropagation(); }}>
                <div className="card dialogBackground">
                    <div className="dialogTitle">Entregar tarea</div>
                    <form onSubmit={(event) => { event.preventDefault(); setPopupShown("ARE_YOU_SURE_UPLOAD"); }}>
                        <TextAreaWithLimit value={formComment} setValue={setFormComment} maxLength={1000} small={true} allowEmptyContent={true} />
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