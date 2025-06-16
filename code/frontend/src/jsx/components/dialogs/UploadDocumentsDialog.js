import { useContext, useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import { DocuAPIFetch } from "../../../client/APIFetch";
import DropFilesArea from "../common/DropFilesArea";
import { pointableSecondary, primary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";

const UploadDocumentsDialog = (props) => {
    const [attachedFilesReady, setAttachedFilesReady] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const theme = useContext(ThemeContext);

    const onSubmitUploadFiles = (event) => {
        event.preventDefault();
        setLoading(true);
        const body = {
            filetree_info: {
                must_save_to_filetree: true,
                parent_folder_id: props.parentFolderIdsPath.length > 0 ? props.parentFolderIdsPath.slice(-1)[0] : null
            },
            files: attachedFilesReady
        }
        DocuAPIFetch("POST", "/api/v1/documents", body)
            .then(json => {
                if (json.success === true) {
                    props.onSuccess(json.result);
                } else {
                    props.onFail("Se ha producido un error");
                }
                setLoading(false);
                setAttachedFilesReady([]);
                props.onDismiss();
            })
            .catch(error => {
                setLoading(false);
                setAttachedFilesReady([]);
                props.onFail(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }


    return props.show === true ? <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">Subir archivos</div>
                <form onSubmit={onSubmitUploadFiles}>
                    <DropFilesArea attachedFilesReady={attachedFilesReady} setAttachedFilesReady={setAttachedFilesReady} />
                    <p>Se subirán a la siguiente carpeta:</p>
                    <div className="formInputContainer">
                        <input className="formInput formInputGreyBackground" type="text" value={props.parentFolderStringPath} disabled={true} />
                    </div>
                    <div className="formInputContainer">
                        <input type="submit" className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`} value="Subir documentos" disabled={attachedFilesReady.length === 0}/>
                    </div>
                    {isLoading && <div className="loadingHUDCentered"><LoadingHUD /></div>}
                </form>
            </div>
        </div>
    </div> : <></>
}

export default UploadDocumentsDialog;