import { useState } from "react";
import FilesBrowser from "../files/FilesBrowser";
import LoadingHUD from "../common/LoadingHUD";
import EduAPIFetch from "../../../client/EduAPIFetch";

const CreateFolderDialog = (props) => {
    const [formFolderName, setFormFolderName] = useState("");
    const [formParentFolderIdsPath, setFormParentFolderIdsPath] = useState([...props.initialPosition]);
    const [isLoading, setLoading] = useState(false);

    const onSubmitCreateFolder = (event) => {
        event.preventDefault();
        setLoading(true);
        let body = {
            // TODO: Max length for all forms according to models.py?
            name: formFolderName
        }
        if (formParentFolderIdsPath.length > 0) {
            body["parent_folder_id"] = formParentFolderIdsPath.slice(-1)[0];
        }
        EduAPIFetch("POST", "/api/v1/folders", body)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    props.onSuccess(json.result);
                    setFormFolderName("");
                    setFormParentFolderIdsPath([]);
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

    const onFolderPathSelected = (idsPath) => {
        setFormParentFolderIdsPath(idsPath);
    }

    const getPathStringForSelectedFolder = () => {
        let path = "/";
        let subTreeBeingWalked = props.myFilesTree;
        for (let folderId of formParentFolderIdsPath) {
            const folderBeingWalked = subTreeBeingWalked.find(f => f.id === folderId);
            path += `${folderBeingWalked.name}/`;
            subTreeBeingWalked = folderBeingWalked.children;
        }
        return path;
    }

    return props.show === true ? <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="folderPathPickerContainer">
                    <div className="folderPathPickerTitle">Selecciona la ubicación de la nueva carpeta:</div>
                    <form onSubmit={onSubmitCreateFolder}>
                        <FilesBrowser myFilesTree={props.myFilesTree}
                            initialPosition={props.initialPosition}
                            onFolderPathSelected={onFolderPathSelected}
                            foldersCount={props.foldersCount}
                            documentsCount={props.documentsCount}
                            canClickFiles={false} />
                        <div className="formInput">
                            <input type="text" value={formFolderName}
                                onChange={e => { setFormFolderName(e.target.value) }}
                                onFocus={e => { e.target.placeholder = "Mi carpeta"; }}
                                onBlur={e => { e.target.placeholder = ""; }} required />
                            <div className="underline"></div>
                            <label htmlFor="">Nombre de carpeta</label>
                        </div>
                        <div className="formInput">
                            <input className="formInputGreyBackground" type="text" value={`${getPathStringForSelectedFolder()}${formFolderName}${formFolderName.length > 0 ? "/" : ""}`} disabled={true} />
                        </div>
                        <div className="formSubmit">
                            <input type="submit" value="Crear carpeta" />
                        </div>
                        {isLoading && <div className="dialogScreenHUDCentered"><LoadingHUD /></div>}
                    </form>

                </div>
            </div>
        </div>
    </div> : <></>
}

export default CreateFolderDialog;