const FolderElement = (props) => {
    return <div className="myFilesElementContainer"
        onClick={() => { props.onFolderClicked(props.id, props.level) }}>
        {props.name}
    </div>
}

export default FolderElement;