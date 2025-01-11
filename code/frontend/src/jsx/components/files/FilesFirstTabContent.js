const FilesFirstTabContent = (props) => {

    return <div>
        <div className={`filesFirstTabElement myFilesElementContainerHoverable ${props.selectedRoot === "MY_FILES" ? "filesElementSelected" : "filesElementUnselected"}`}
            onClick={() => { props.onRootClicked("MY_FILES") }}>
            <div className="filesFirstTabTitle">🖥️ Tu unidad</div>
            {props.foldersCount && <div className="filesFirstTabSubtitle">{`${props.foldersCount} ${props.foldersCount === 1 ? "carpeta" : "carpetas"}`}</div>}
            {props.documentsCount && <div className="filesFirstTabSubtitle">{`${props.documentsCount} ${props.documentsCount === 1 ? "documento" : "documentos"}`}</div>}
        </div>
    </div>
}

export default FilesFirstTabContent;