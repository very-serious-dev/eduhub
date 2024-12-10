import { useState } from "react";

const DropFilesArea = (props) => {
    const MAX_SIZE = {nBytes: 1024*1024*30, humanReadable: "30 Mb"}
    const MAX_ATTACHMENTS = 5;
    const [readyFiles, setReadyFiles] = useState([]);
    const [dropAreaActive, setDropAreaActive] = useState(false);
    const [isReadingFiles, setReadingFiles] = useState(false);

    const onFilesDroped = (event) => {
        event.preventDefault();
        setDropAreaActive(false);
        if (isReadingFiles) { return; }
        // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop#process_the_drop
        const files = event.dataTransfer.items ? [...event.dataTransfer.items].filter(i => i.kind === "file").map(i => i.getAsFile()) : [...event.dataTransfer.files];
        if (files.length === 0) { return; }
        if (readyFiles.length >= MAX_ATTACHMENTS) {
            alert(`No se pueden añadir más de ${MAX_ATTACHMENTS} ficheros`);
            return;
        }
        if ((readyFiles.reduce((accumulated, currentFile) => accumulated + currentFile.size, 0) + files[0].size) >= MAX_SIZE.nBytes) {
            alert(`No se puede exceder ${MAX_SIZE.humanReadable} entre todos los ficheros`);
            return;
        }
        setReadingFiles(true);
        const processedFiles = []
        const reader = new FileReader();
        reader.addEventListener("loadend", () => {
            processedFiles.push({
                name: files[0].name,
                size: files[0].size,
                data: reader.result })
            files.shift(); // Remove files[0], it has been processed
            if (files.length > 0) {
                // There are more files!
                if ((readyFiles.length + processedFiles.length) >= MAX_ATTACHMENTS) {
                    setReadyFiles([...readyFiles, ...processedFiles]);
                    setReadingFiles(false);
                    alert(`No se pueden añadir más de ${MAX_ATTACHMENTS} ficheros`);
                } else {
                    const readyFilesTotalSize = readyFiles.reduce((accumulated, currentFile) => accumulated + currentFile.size, 0);
                    const processedFilesTotalSize = processedFiles.reduce((accumulated, currentFile) => accumulated + currentFile.size, 0);
                    const toBeProcessedFileSize = files[0].size;
                    if ((readyFilesTotalSize + processedFilesTotalSize + toBeProcessedFileSize) > MAX_SIZE.nBytes) {
                        setReadyFiles([...readyFiles, ...processedFiles]);
                        setReadingFiles(false);
                        alert(`No se puede exceder ${MAX_SIZE.humanReadable} entre todos los ficheros`);
                    } else {
                        // Process the next one
                        reader.readAsDataURL(files[0]);
                    }
                }
            } else {
                // No more files, we're done
                setReadyFiles([...readyFiles, ...processedFiles]);
                setReadingFiles(false);
            }
        })
        reader.addEventListener("error", () => {
            alert("Hubo un error cargando los ficheros");
            setReadingFiles(false);
        })
        reader.readAsDataURL(files[0]); // Begin processing files
    }

    const sizeToHumanReadable = (size) => { // https://stackoverflow.com/a/63032680
        const fileSize = size.toString();
        if(fileSize.length < 7) {
            return `${Math.round(+fileSize/1024).toFixed(2)}kb`
        }
        return `${(Math.round(+fileSize/1024)/1000).toFixed(2)}MB`
    }

    return <div className="formFiles">
        <div className="formFilesUploaded">
            {readyFiles.map(f => { return f.name })}
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