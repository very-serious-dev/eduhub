const FolderElement = (props) => {
    return <div className={`myFilesElementContainer myFilesElementContainerHoverable ${props.selected ? "filesElementSelected" : "filesElementUnselected"}`}
        onClick={() => { props.onFolderClicked(props.id, props.level) }}>
        <div className="myFilesElementTitleContainer">
            <img className="myFilesElementIcon" src="./icon_folder.png"></img>
            <div className="myFilesElementName">{props.name}</div>
        </div>
    </div>
}

export default FolderElement;