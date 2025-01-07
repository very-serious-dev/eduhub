const FolderElement = (props) => {
    return <div className={`myFilesElementContainer ${props.selected ? "myFileSelected" : "myFileUnselected"}`}
        onClick={() => { props.onFolderClicked(props.id, props.level) }}>
        <div className="myFilesElementTitleContainer">
            <img className="myFilesElementIcon" src="./icon_folder.png"></img>
            <div className="myFilesElementName">{props.name}</div>
        </div>
    </div>
}

export default FolderElement;