import { useContext, useState } from "react";
import { EduAPIFetch } from "../../../client/APIFetch";
import LoadingHUD from "../common/LoadingHUD";
import FilesBrowser from "../files/FilesBrowser";
import { getFolderNamesForFolderIdsPath } from "../../../util/FilesBrowserContainerUtil";
import MyFilesFirstTabContent from "../files/MyFilesFirstTabContent";
import { pointableSecondary, primary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";

const MoveDocumentOrFolderDialog = (props) => {
    const [selectedFolderIdsPath, setSelectedFolderIdsPath] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const theme = useContext(ThemeContext);

    const appropriateContainerFolderId = () => {
        return selectedFolderIdsPath.length > 0 ? selectedFolderIdsPath.slice(-1)[0] : null;
    }

    const onSubmitMoveElement = (event) => {
        event.preventDefault();
        setLoading(true);
        let url;
        let body = {}
        if (props.folderId) {
            url = `/api/v1/folders/${props.folderId}`;
            body["parent_folder_id"] = appropriateContainerFolderId();
        } else if (props.documentId) {
            url = `/api/v1/documents/${props.documentId}`;
            body["folder_id"] = appropriateContainerFolderId();
        }
        EduAPIFetch("PUT", url, body)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    props.onSuccess(json.result);
                    setSelectedFolderIdsPath([]);
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

    const firstTabView = () => {
        return <div>
            <MyFilesFirstTabContent myFilesTree={props.filesTree}
                isSelected={true}
                onRootClicked={() => { setSelectedFolderIdsPath([]); }} />
        </div>
    }

    const targetFolderPath = getFolderNamesForFolderIdsPath(selectedFolderIdsPath, props.filesTree);

    return <div className="popupOverlayBackground" onClick={(e) => { e.stopPropagation(); props.onDismiss() }}>
        <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">Carpeta de destino</div>
                <form onSubmit={onSubmitMoveElement}>
                    <div className="dialogScrollableFixedHeightSection">
                        <FilesBrowser filesTree={props.filesTree}
                            selectedFolderIdsPath={selectedFolderIdsPath}
                            setSelectedFolderIdsPath={setSelectedFolderIdsPath}
                            firstTabView={firstTabView()}
                            showUploadOrCreateFolder={false}
                            showContextMenu={false}
                            showAuthor={false}
                            canClickDocuments={false} />
                    </div>
                    <div className="formInputContainer">
                        <input className="formInput formInputGreyBackground"
                            type="text"
                            value={`/${targetFolderPath.join('/')}${targetFolderPath.length > 0 ? '/' : ''}`} disabled={true} />
                    </div>
                    <div className="formInputContainer">
                        <input type="submit" className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`} value={`Mover a ${targetFolderPath.length > 0 ? `"${targetFolderPath.slice(-1)[0]}/"` : 'la raíz de Tu unidad'}`} />
                    </div>
                    {isLoading && <div className="loadingHUDCentered"><LoadingHUD /></div>}
                </form>
            </div>
        </div>
    </div>
}

export default MoveDocumentOrFolderDialog;