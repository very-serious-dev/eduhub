import { useContext, useEffect, useState } from "react";
import { FeedbackContext, ThemeContext } from "../../main/GlobalContainer";
import MyFilesFirstTabContent from "../files/MyFilesFirstTabContent";
import { getFolderNamesForFolderIdsPath } from "../../../util/FilesBrowserContainerUtil";
import { EduAPIFetch } from "../../../client/APIFetch";
import { buildTree } from "../../../util/TreeBuilder";
import LoadingHUD from "../common/LoadingHUD";
import FilesBrowser from "../files/FilesBrowser";
import { pointableSecondary, primary } from "../../../util/Themes";

const SelectFileDialog = (props) => {
    const [filesTree, setFilesTree] = useState([]);
    const [selectedFolderIdsPath, setSelectedFolderIdsPath] = useState([]);
    const [isLoadingTree, setLoadingTree] = useState(false);
    const setFeedback = useContext(FeedbackContext);
    const theme = useContext(ThemeContext);

    useEffect(() => {
        setLoadingTree(true);
        EduAPIFetch("GET", "/api/v1/documents?onlyMyFiles=true")
            .then(json => {
                setLoadingTree(false);
                setFilesTree(buildTree(json.my_files));
            })
            .catch(error => {
                setLoadingTree(false);
                setFeedback({ type: "error", message: error.error ?? "Se ha producido un error" });
            })
    }, []);

    const handleDocumentSelected = (document) => {
        props.onDocumentSelected(document)
        props.onDismiss();
    }

    const firstTabView = () => {
        return <div>
            <MyFilesFirstTabContent myFilesTree={filesTree}
                isSelected={true}
                onRootClicked={() => { setSelectedFolderIdsPath([]); }} />
        </div>
    }

    const selectedFolderPath = getFolderNamesForFolderIdsPath(selectedFolderIdsPath, filesTree);

    return <div className="popupOverlayBackground" onClick={(e) => { e.stopPropagation(); props.onDismiss() }}>
        <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">Seleccionar archivo</div>
                <div className="dialogScrollableFixedHeightSection">
                    {isLoadingTree ? <div className="loadingHUDCentered"><LoadingHUD /></div>
                        : <FilesBrowser filesTree={filesTree}
                            selectedFolderIdsPath={selectedFolderIdsPath}
                            setSelectedFolderIdsPath={setSelectedFolderIdsPath}
                            firstTabView={firstTabView()}
                            showUploadOrCreateFolder={false}
                            showContextMenu={false}
                            showAuthor={false}
                            onDocumentSelected={handleDocumentSelected} />}
                </div>
                <div className="formInputContainer">
                    <input className="formInput formInputGreyBackground"
                        type="text"
                        value={`/${selectedFolderPath.join('/')}${selectedFolderPath.length > 0 ? '/' : ''}`} disabled={true} />
                </div>
                <div className={`card areYouSureOption pointable ${primary(theme)} ${pointableSecondary(theme)}`} onClick={props.onDismiss}>Volver</div>
                
            </div>
        </div>
    </div>

}

export default SelectFileDialog;