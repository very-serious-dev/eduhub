import sizeToHumanReadable from "../../../util/FileSizeToHumanReadable";

const DropFilesAreaItem = (props) => {

    return <div className="dropFilesAreaItem">
        <div className="dropFilesAreaItemTitle">{props.file.name}</div>
        <div className="dropFilesAreaItemSubtitle">{sizeToHumanReadable(props.file.size)}</div>
        <div className="dropFilesAreaItemDeleteButton" onClick={() => { props.onDelete(props.file.name) }}>❌</div>
    </div>
}

export default DropFilesAreaItem;