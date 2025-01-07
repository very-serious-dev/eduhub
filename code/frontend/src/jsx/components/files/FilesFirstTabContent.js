const FilesFirstTabContent = (props) => {
    
    return <div className="firstFilesTab">
        <div className="firstFilesTabTitle">🖥️ Tu unidad</div>
        <div className="firstFilesTabSubtitle">{`${props.foldersCount} ${props.foldersCount === 1 ? "carpeta" : "carpetas"}`}</div>
        <div className="firstFilesTabSubtitle">{`${props.documentsCount} ${props.documentsCount === 1 ? "documento" : "documentos"}`}</div>
    </div>
}

export default FilesFirstTabContent;