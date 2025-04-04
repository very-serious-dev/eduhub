const FilesEmptyFolderTabContent = (props) => {
    return <div className="emptyFolderTab">
        {`🍂 ${props.isEmptyRoot ? "No hay ningún contenido aquí": "Carpeta vacía"}`}
        </div>
}

export default FilesEmptyFolderTabContent;