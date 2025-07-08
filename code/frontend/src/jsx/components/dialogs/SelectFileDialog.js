import { useContext, useEffect, useState } from "react";
import { FeedbackContext, ThemeContext } from "../../main/GlobalContainer";
import MyFilesFirstTabContent from "../files/MyFilesFirstTabContent";
import { getFolderNamesForFolderIdsPath } from "../../../util/FilesBrowserContainerUtil";
import { EduAPIFetch } from "../../../client/APIFetch";
import { buildTree } from "../../../util/TreeBuilder";
import LoadingHUD from "../common/LoadingHUD";
import FilesBrowser from "../files/FilesBrowser";
import { pointableSecondary, primary } from "../../../util/Themes";

const SelectFileDialog = (props) => { /* Very similar to MoveDocumentOrFolderDialog */
    const [filesTree, setFilesTree] = useState([]);
    const [selectedFolderIdsPath, setSelectedFolderIdsPath] = useState([]);
    const [isLoadingTree, setLoadingTree] = useState(false);
    const theme = useContext(ThemeContext);
    const setFeedback = useContext(FeedbackContext);

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

    /*
        const onSubmitMoveElement = (event) => {
            event.preventDefault();
            setLoading(true);
            let url;
            let body = {}
            if (props.folder) {
                url = `/api/v1/folders/${props.folder.id}${getSelfAndSubTreeIdsForQueryParam(null, props.folder)}`;
                body["parent_folder_id"] = appropriateContainerFolderId();
            } else if (props.document) {
                url = `/api/v1/documents/${props.document.identifier}`;
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
        }*/

    const firstTabView = () => {
        return <div>
            <MyFilesFirstTabContent myFilesTree={filesTree}
                isSelected={true}
                onRootClicked={() => { setSelectedFolderIdsPath([]); }} />
        </div>
    }

    const targetFolderPath = getFolderNamesForFolderIdsPath(selectedFolderIdsPath, filesTree);

    return <div className="popupOverlayBackground" onClick={(e) => { e.stopPropagation(); props.onDismiss() }}>
        <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">Seleccionar archivo</div>
                {isLoadingTree ? <div className="loadingHUDCentered"><LoadingHUD /></div>
                    : <form onSubmit={() => { alert("TO-DO") }}>
                        <div className="dialogScrollableFixedHeightSection">
                            <FilesBrowser filesTree={filesTree}
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
                    </form>}
            </div>
        </div>
    </div>

}

export default SelectFileDialog;