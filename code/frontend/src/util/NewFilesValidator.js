const assertValidFilesErrorMessage = (newFiles, alreadyAddedFiles) => {
    const MAX_SIZE = { nBytes: 1024 * 1024 * 50, humanReadable: "50 MB" } // @see docu_rest/settings.py DATA_UPLOAD_MAX_MEMORY_SIZE
    const MAX_ATTACHMENTS = 5;

    if (newFiles.some(f => alreadyAddedFiles.some(afr => f.name === afr.name))) {
        return "Ya has adjuntado un fichero con ese nombre";
    }
    if (alreadyAddedFiles.length + newFiles.length > MAX_ATTACHMENTS) {
        return `No se pueden añadir más de ${MAX_ATTACHMENTS} ficheros`;
    }
    if (newFiles.some(f => f.name.length > 150)) {
        return "Los nombres de fichero no pueden superar 150 caracteres";
    }
    const alreadyAttachedFilesSize = alreadyAddedFiles.reduce((acc, f) => acc + f.size, 0)
    const newFilesSize = newFiles.reduce((acc, f) => acc + f.size, 0)
    if (alreadyAttachedFilesSize + newFilesSize >= MAX_SIZE.nBytes) {
        return `No se puede exceder ${MAX_SIZE.humanReadable} entre todos los ficheros`;
    }
    return null; // Everything OK
}

const assertValidAttachmentsErrorMessage = (newAttachments, alreadyAddedAttachments) => {
    if (newAttachments.some(na => na.type === "questionnaire")) {
        if (alreadyAddedAttachments.some(aaa => aaa.type === "questionnaire")) {
            return "Sólo se puede adjuntar 1 formulario";
        }
    }
    const newFiles = newAttachments.filter(na => na.type === "document");
    const alreadyAddedFiles = alreadyAddedAttachments.filter(na => na.type === "document");
    return assertValidFilesErrorMessage(newFiles, alreadyAddedFiles);
}

export { assertValidAttachmentsErrorMessage }