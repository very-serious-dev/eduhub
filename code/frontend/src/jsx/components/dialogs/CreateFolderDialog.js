import { useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import EduAPIFetch from "../../../client/EduAPIFetch";

const CreateFolderDialog = (props) => {
    const [formFolderName, setFormFolderName] = useState("");
    const [isLoading, setLoading] = useState(false);

    const onSubmitCreateFolder = (event) => {
        event.preventDefault();
        setLoading(true);
        let body = {
            // TODO: Max length for all forms according to models.py?
            name: formFolderName
        }
        if (props.parentFolderIdsPath.length > 0) {
            body["parent_folder_id"] = props.parentFolderIdsPath.slice(-1)[0];
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

    return props.show === true ? <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">Crear carpeta</div>
                <form onSubmit={onSubmitCreateFolder}>
                    <div className="formInput">
                        <input type="text" value={formFolderName}
                            onChange={e => { setFormFolderName(e.target.value) }}
                            onFocus={e => { e.target.placeholder = "Mi carpeta"; }}
                            onBlur={e => { e.target.placeholder = ""; }} required />
                        <div className="underline"></div>
                        <label htmlFor="">Nombre de carpeta</label>
                    </div>
                    <div className="formInput">
                        <input className="formInputGreyBackground" type="text" value={`${props.parentFolderStringPath}${formFolderName}${formFolderName.length > 0 ? "/" : ""}`} disabled={true} />
                    </div>
                    <div className="formSubmit">
                        <input type="submit" value="Crear carpeta" />
                    </div>
                    {isLoading && <div className="dialogScreenHUDCentered"><LoadingHUD /></div>}
                </form>
            </div>
        </div>
    </div> : <></>
}

export default CreateFolderDialog;