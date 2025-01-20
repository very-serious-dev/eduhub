import GetRolesFromCookie from "../../../client/GetRolesFromCookie";
import { getElementsCount } from "../../../util/FilesBrowserContainerUtil";

const FilesFirstTabContent = (props) => {
    const filesCount = getElementsCount(props.tree);
    const isTeacher = GetRolesFromCookie().includes("teacher") === true

    const MAX_DOCUMENTS = isTeacher ? 2000 : 200
    const MAX_FOLDERS = isTeacher ? 500 : 50
    const MAX_STORAGE_TEACHER_GB = 20
    const MAX_STORAGE_STUDENT_GB = 1

    const Gb = 1024 * 1024 * 1024;
    const max_storage = isTeacher ? MAX_STORAGE_TEACHER_GB * Gb : MAX_STORAGE_STUDENT_GB * Gb

    return <div>
        <div className={`filesFirstTabElement myFilesElementContainerHoverable ${props.selectedRoot === "MY_FILES" ? "filesElementSelected" : "filesElementUnselected"}`}
            onClick={() => { props.onRootClicked("MY_FILES") }}>
            <div className="filesFirstTabTitle">🖥️ Tu unidad</div>
            <div className="filesFirstTabSubtitle">{Math.round(filesCount.nBytes / max_storage).toFixed(2)}% usado de {isTeacher ? MAX_STORAGE_TEACHER_GB : MAX_STORAGE_STUDENT_GB}GB</div>
            <div className="filesFirstTabSubtitle">{filesCount.nDocuments}/{MAX_DOCUMENTS} documentos</div>
            <div className="filesFirstTabSubtitle">{filesCount.nFolders}/{MAX_FOLDERS} carpetas</div>
        </div>
    </div>
}

export default FilesFirstTabContent;