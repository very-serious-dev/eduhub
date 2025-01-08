import { useState } from "react";
import FilesBrowser from "../files/FilesBrowser";
import LoadingHUD from "../common/LoadingHUD";

const CreateFolderDialog = (props) => {
    const [formFolderName, setFormFolderName] = useState("");
    const [formFolderId, setFormFolderId] = useState(null);
    const [formFolderPath, setFormFolderPath] = useState("/")
    const [isLoading, setLoading] = useState(false);

    const onSubmitCreateFolder = (event) => {
        event.preventDefault();
    }

    const onFolderSelected = (folderId, folderPath) => {
        setFormFolderId(folderId);
        setFormFolderPath(folderPath);
    }

    return props.show === true ? <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="folderPathPickerContainer">
                    <div className="folderPathPickerTitle">Selecciona la ubicación de la nueva carpeta:</div>
                    <form onSubmit={onSubmitCreateFolder}>
                        <FilesBrowser myFilesTree={props.myFilesTree}
                            onFolderSelected={onFolderSelected}
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
                            <input className="formInputGreyBackground" type="text" value={`${formFolderPath}${formFolderName}${formFolderName.length > 0 ? "/" : ""}`} disabled={true} />
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