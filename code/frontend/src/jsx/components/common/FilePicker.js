import { useContext, useEffect, useState } from "react";
import FilePickerItem from "./FilePickerItem";
import { pointableSecondary, primary, secondary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";
import { useIsMobile } from "../../../util/Responsive";
import { assertValidAttachmentsErrorMessage, assertValidFilesErrorMessage } from "../../../util/NewFilesValidator";
import SelectFileDialog from "../dialogs/SelectFileDialog";

const FilePicker = (props) => {
    const [isReadingFiles, setReadingFiles] = useState(false);
    const [showSelectFileFromMyDrive, setShowSelectFileFromMyDrive] = useState(false);
    const isMobile = useIsMobile();

    // The drop area is actually 'position: absolute' to fill the parent,
    // but we don't want it to block clicks to other important elements.
    // Thus, we use 'pointer-events: none' which allows clicks to pass through.
    // However, this prevents 'drop' events from happening, too.
    // So we added in useEffect code that keeps dropAreaActivable=true while
    // the user is dragging over the window, in order to allow pointer-events.
    // In that state, you can drop to the drop area.
    // On the other hand, the dropAreaActive state only tells you that something
    // being dragged has entered the drop area (ready to be dropped)
    const [dropAreaActivable, setDropAreaActivable] = useState(false);
    const [dropAreaActive, setDropAreaActive] = useState(false);

    // <input type="file"/> keeps the user-selected files under .files property.
    // However, we can't handle that 'state' from React, so in here we just use
    // the <input> as a dummy picker clear the .files property after every
    // selection. The real selected files information is kept up-to-date with
    // props.setAttachments
    const [refreshKeyClearInputFiles, setRefreshKeyClearInputFiles] = useState(0);
    const theme = useContext(ThemeContext);

    useEffect(() => {
        let timer;
        const handleWindowDragOver = (e) => {
            setDropAreaActivable(true);
            clearTimeout(timer);
            timer = setTimeout(() => { setDropAreaActivable(false); }, 100);
        };
        window.addEventListener('dragover', handleWindowDragOver);
        return () => {
            window.removeEventListener('dragover', handleWindowDragOver);
        };
    }, []);

    const onFilesPickerChanged = (event) => {
        setRefreshKeyClearInputFiles(x => x + 1);
        processNewlySelectedFiles([...event.target.files]);
    }

    const onFilesDroped = (event) => {
        event.preventDefault();
        setDropAreaActive(false);
        // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop#process_the_drop
        const files = event.dataTransfer.items ? [...event.dataTransfer.items].filter(i => i.kind === "file").map(i => i.getAsFile()) : [...event.dataTransfer.files];
        if (files.length === 0) { return; }
        processNewlySelectedFiles(files);
    }

    const processNewlySelectedFiles = (newFiles) => {
        const newFileReader = () => {
            const reader = new FileReader();
            reader.addEventListener("error", () => {
                alert("Hubo un error cargando el fichero");
                setReadingFiles(false);
            });
            return reader;
        }

        const onFileLoadEnd = (reader, file, remainingFiles) => {
            if (reader.result !== null) {
                const data = reader.result.split(',');
                const newFile = {
                    name: file.name,
                    size: file.size,
                    mime_type: data[0].replace("data:", "").replace(";base64", ""),
                    data: data[1],
                    type: "document"
                }
                props.setAttachments(old => [...old, newFile]);
            } else {
                alert("Sólo se pueden subir archivos")
            }
            if (remainingFiles.length > 0) {
                const reader = newFileReader();
                reader.addEventListener("loadend", (event) => {
                    onFileLoadEnd(event.target, remainingFiles[0], remainingFiles.slice(1))
                });
                reader.readAsDataURL(remainingFiles[0]);
            } else {
                setReadingFiles(false);
            }
        }

        setReadingFiles(true);
        let errorMessage = assertValidAttachmentsErrorMessage(newFiles, props.attachments);
        if (errorMessage !== null) {
            alert(errorMessage);
            setReadingFiles(false);
            return;
        }
        const reader = newFileReader();
        reader.addEventListener("loadend", (event) => {
            onFileLoadEnd(event.target, newFiles[0], newFiles.slice(1))
        });
        reader.readAsDataURL(newFiles[0]);
    }

    const onRemoveReadyItem = (attachment) => {
        if (attachment.type === "document") {
            props.setAttachments(old => {
                const oldQuestionnaires = old.filter(a => a.type === "questionnaire");
                const oldFiles = old.filter(a => a.type === "file");
                return [...oldQuestionnaires, ...oldFiles.filter(f => f.name !== attachment.name)]
            })
        }
        if (attachment.type === "questionnaire") {
            props.setAttachments(old => {
                const oldQuestionnaires = old.filter(a => a.type === "questionnaire");
                const oldFiles = old.filter(a => a.type === "file");
                return [...oldFiles, ...oldQuestionnaires.filter(q => q.title !== attachment.title)]
            })
        }
    }

    const onDocumentSelectedFromMyDrive = (document) => {
        let errorMessage = assertValidAttachmentsErrorMessage([document], props.attachments);
        if (errorMessage !== null) {
            alert(errorMessage);
            return;
        }
        // TODO Select questionnaire?
        props.setAttachments(f => [...f, { ...document, type: "document" }]);
        setShowSelectFileFromMyDrive(false);
    }

    return <>
        {showSelectFileFromMyDrive && <SelectFileDialog onDocumentSelected={onDocumentSelectedFromMyDrive} onDismiss={() => { setShowSelectFileFromMyDrive(false) }} />}
        {isReadingFiles ? <div>Cargando...</div>
            : <div className="formFiles">
                <div className="filePickerInputContainer">
                    <label className={`filePickerInputLabel pointable ${primary(theme)} ${pointableSecondary(theme)}`}>
                        <input type="file" key={refreshKeyClearInputFiles} multiple={true} onChange={onFilesPickerChanged} />
                        Subir archivos
                    </label>
                    {!isMobile && " ó ⬇️📄 arrástralos desde tu ordenador. "}
                    {props.showChooseFromMyUnit && <>También puedes <div className={`filePickerRoundButton pointable ${primary(theme)} ${pointableSecondary(theme)}`}
                        onClick={() => { setShowSelectFileFromMyDrive(true) }}>
                        Seleccionar&nbsp;archivos&nbsp;de&nbsp;tu&nbsp;unidad
                    </div></>}
                </div>
                <div className="formFilesAttached">
                    {props.attachments.map(a => <FilePickerItem attachment={a} onDelete={onRemoveReadyItem} />)}
                </div>
                { /* This drop area has 'position: absolute' and will fill the topmost ancestor with 'position: relative' */}
                <div className={`filePickerDropArea ${dropAreaActivable ? "dropAreaActivable" : "dropAreaInactive"}`}
                    onDragOver={e => { e.preventDefault() }}
                    onDragEnter={e => { setDropAreaActive(true) }}
                    onDragLeave={e => { setDropAreaActive(false) }}
                    onDrop={onFilesDroped} >
                    <div className={`dropAreaBackground ${dropAreaActive ? `${secondary(theme)} dropAreaBackgroundActive` : primary(theme)}`} />
                </div>
            </div>}
    </>
}

export default FilePicker;