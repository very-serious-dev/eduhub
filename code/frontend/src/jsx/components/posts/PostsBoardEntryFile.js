import DocuURL from "../../../client/DocuURL";
import { sizeToHumanReadable } from "../../../util/Formatter";

const PostsBoardEntryFile = (props) => {
    const iconImgSrc = (mimeType) => {
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/MIME_types/Common_types
        if (mimeType === "application/pdf") {
            return "/icon_pdf.png";
        } else if (mimeType.includes("video")) {
            return "/icon_vid.png";
        }
        if (mimeType.includes("image")) {
            return "/icon_img.png";
        } else if ((mimeType === "application/msword") ||
                   (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
                   (mimeType === "application/vnd.oasis.opendocument.text")) {
            return "/icon_doc.png";
        } else if ((mimeType === "application/vnd.ms-excel") ||
                   (mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") ||
                   (mimeType === "application/vnd.oasis.opendocument.spreadsheet")) {
            return "/icon_xls.png";
        } else {
            return "/icon_other.png";
        }
    }

    const onClickFile = () => {
        window.open(`${DocuURL}/api/v1/documents/${props.file.identifier}`, "_blank")
    }

    return <div className="classEntryFile" onClick={onClickFile}>
           { /* Creative commons icons license */}
           { /* TO-DO: Show this in the web somewhere: <a href="https://www.flaticon.com/free-icons/doc" title="doc icons">Doc icons created by Dimitry Miroliubov - Flaticon</a>*/}
        <img className="classEntryFileImage" src={iconImgSrc(props.file.mime_type)} />
        <div className="classEntryFileRightContainer">
            <div className="classEntryFileTitle">{props.file.name}</div>
            <div className="classEntryFileSubtitle">{sizeToHumanReadable(props.file.size)}</div>
        </div>
    </div>
}

export default PostsBoardEntryFile;