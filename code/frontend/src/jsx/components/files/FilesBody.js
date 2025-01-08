import { useState } from "react";
import FilesBrowser from "./FilesBrowser";
import CreateFolderOrUploadFileDialog from "../dialogs/CreateFolderOrUploadFileDialog";
import CreateFolderDialog from "../dialogs/CreateFolderDialog";

const FilesBody = (props) => {
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, CREATE_OR_UPLOAD, CREATE_FOLDER

    // TODO: use props.onFilesChanged ??

    return <div>
        <CreateFolderOrUploadFileDialog show={popupShown === "CREATE_OR_UPLOAD"}
            onDismiss={() => { setPopupShown("NONE") }} 
            onCreateFolderClicked={() => {setPopupShown("CREATE_FOLDER")}}
            onUploadDocumentsClicked={() => {}}/>
        <CreateFolderDialog show={popupShown === "CREATE_FOLDER"}
            onDismiss={() => { setPopupShown("NONE") }} 
            myFilesTree={props.myFilesTree}
            foldersCount={props.foldersCount}
            documentsCount={props.documentsCount} />
        <FilesBrowser myFilesTree={props.myFilesTree}
            foldersCount={props.foldersCount}
            documentsCount={props.documentsCount}
            canClickFiles={true} />
        <div className="card floatingCardAddNew" onClick={() => { setPopupShown("CREATE_OR_UPLOAD") }}>➕ Nuevo</div>
    </div>
}

export default FilesBody;