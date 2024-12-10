const DropFilesAreaItem = (props) => {

    const sizeToHumanReadable = (size) => { // https://stackoverflow.com/a/63032680
        const fileSize = size.toString();
        if (fileSize.length < 7) {
            return `${Math.round(+fileSize / 1024).toFixed(2)}kb`
        }
        return `${(Math.round(+fileSize / 1024) / 1000).toFixed(2)}MB`
    }

    return <div className="dropFilesAreaItem">
        <div className="dropFilesAreaItemTitle">{props.file.name}</div>
        <div className="dropFilesAreaItemSubtitle">{sizeToHumanReadable(props.file.size)}</div>
        <div className="dropFilesAreaItemDeleteButton" onClick={() => { props.onDelete(props.file.name) }}>❌</div>
    </div>
}

export default DropFilesAreaItem;