import { useState } from "react";
import DropFilesAreaItem from "./DropFilesAreaItem";

const DropFilesArea = (props) => {
    const MAX_SIZE = {nBytes: 1024*1024*30, humanReadable: "30 Mb"}
    const MAX_ATTACHMENTS = 5;
    const [dropAreaActive, setDropAreaActive] = useState(false);
    const [isReadingFiles, setReadingFiles] = useState(false);

    const onFilesDroped = (event) => {
        event.preventDefault();
        setDropAreaActive(false);
        if (isReadingFiles) { return; }
        // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop#process_the_drop
        const files = event.dataTransfer.items ? [...event.dataTransfer.items].filter(i => i.kind === "file").map(i => i.getAsFile()) : [...event.dataTransfer.files];
        if (files.length === 0) { return; }
        if (props.filesReadyToUpload.some(f => f.name === files[0].name)) {
            alert(`Ya has adjuntado un fichero de nombre ${files[0].name}`);
            return;
        }
        if (props.filesReadyToUpload.length >= MAX_ATTACHMENTS) {
            alert(`No se pueden añadir más de ${MAX_ATTACHMENTS} ficheros`);
            return;
        }
        if ((files[0] + props.filesReadyToUpload.reduce((accumulated, currentFile) => accumulated + currentFile.size, 0)) >= MAX_SIZE.nBytes) {
            alert(`No se puede exceder ${MAX_SIZE.humanReadable} entre todos los ficheros`);
            return;
        }
        setReadingFiles(true);
        const processedFiles = []
        const reader = new FileReader();
        reader.addEventListener("loadend", () => {
            const data = reader.result.split(',');
            processedFiles.push({
                name: files[0].name,
                size: files[0].size,
                mime_type: data[0].replace("data:", "").replace(";base64", ""),
                data: data[1] })
            files.shift(); // Remove files[0], it has been processed
            if (files.length > 0) {
                // There are more files!
                if (processedFiles.some(f => f.name === files[0].name)) {
                    props.setFilesReadyToUpload([...props.filesReadyToUpload, ...processedFiles]);
                    setReadingFiles(false);
                    alert(`Ya has adjuntado un fichero de nombre ${files[0].name}`);
                } else if ((props.filesReadyToUpload.length + processedFiles.length) >= MAX_ATTACHMENTS) {
                    props.setFilesReadyToUpload([...props.filesReadyToUpload, ...processedFiles]);
                    setReadingFiles(false);
                    alert(`No se pueden añadir más de ${MAX_ATTACHMENTS} ficheros`);
                } else {
                    const readyFilesTotalSize = props.filesReadyToUpload.reduce((accumulated, currentFile) => accumulated + currentFile.size, 0);
                    const processedFilesTotalSize = processedFiles.reduce((accumulated, currentFile) => accumulated + currentFile.size, 0);
                    const toBeProcessedFileSize = files[0].size;
                    if ((readyFilesTotalSize + processedFilesTotalSize + toBeProcessedFileSize) > MAX_SIZE.nBytes) {
                        props.setFilesReadyToUpload([...props.filesReadyToUpload, ...processedFiles]);
                        setReadingFiles(false);
                        alert(`No se puede exceder ${MAX_SIZE.humanReadable} entre todos los ficheros`);
                    } else {
                        // Process the next one
                        reader.readAsDataURL(files[0]);
                    }
                }
            } else {
                // No more files, we're done
                props.setFilesReadyToUpload([...props.filesReadyToUpload, ...processedFiles]);
                setReadingFiles(false);
            }
        })
        reader.addEventListener("error", () => {
            alert("Hubo un error cargando los ficheros");
            setReadingFiles(false);
        })
        reader.readAsDataURL(files[0]); // Begin processing files
    }

    const onRemoveReadyFile = (fileName) => {
        props.setFilesReadyToUpload(props.filesReadyToUpload.filter(f => f.name !== fileName));
    }

    return <div className="formFiles">
        <div className="formFilesUploaded">
            {props.filesReadyToUpload.map(f => <DropFilesAreaItem file={f} onDelete={onRemoveReadyFile}/>)}
        </div>
        <div className={`formFilesDropableArea${dropAreaActive ? " formFilesDropableAreaActive" : ""}`}
            onDragOver={e => { e.preventDefault() }}
            onDragEnter={e => { setDropAreaActive(true) }}
            onDragLeave={e => { setDropAreaActive(false) }}
            onDrop={onFilesDroped}>
            {isReadingFiles ? "Cargando..." : "⬇️📄 Arrastra un fichero aquí para adjuntarlo" }
        </div>
    </div>

}

export default DropFilesArea;