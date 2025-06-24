import { useContext, useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import { EduAPIFetch } from "../../../client/APIFetch";
import { accent, accentFormLabel, pointableSecondary, primary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";

const CreateFolderDialog = (props) => {
    const [formFolderName, setFormFolderName] = useState("");
    const [isLoading, setLoading] = useState(false);
    const theme = useContext(ThemeContext);

    const onSubmitCreateFolder = (event) => {
        event.preventDefault();
        setLoading(true);
        let body = {
            name: formFolderName,
            parent_folder_id: props.parentFolderId
        }
        EduAPIFetch("POST", "/api/v1/folders", body)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    props.onSuccess(json.result);
                    setFormFolderName("");
                } else {
                    props.onFail("Se ha producido un error");
                }
                props.onDismiss();
            })
            .catch(error => {
                setLoading(false);
                props.onFail(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }

    return <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">Crear carpeta</div>
                <form onSubmit={onSubmitCreateFolder}>
                    <div className="formInputContainer">
                        <input type="text" value={formFolderName}
                            className={`formInput ${primary(theme)}`}
                            onChange={e => { setFormFolderName(e.target.value) }}
                            onFocus={e => { e.target.placeholder = "Mi carpeta"; }}
                            onBlur={e => { e.target.placeholder = ""; }}
                            maxLength={50}
                            required />
                        <div className={`underline ${accent(theme)}`} />
                        <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Nombre de carpeta</label>
                    </div>
                    <div className="formInputContainer">
                        <input type="submit" className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`} value="Crear carpeta" />
                    </div>
                    {isLoading && <div className="loadingHUDCentered"><LoadingHUD /></div>}
                </form>
            </div>
        </div>
    </div>
}

export default CreateFolderDialog;