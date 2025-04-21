import { footNoteDateAuthor, formatPseudoMarkdown } from "../../../util/Formatter";
import SmallFilesListFile from "../common/SmallFilesListFile";

const AnnouncementCell = (props) => {

    const onEdit = (event) => {
        event.stopPropagation();
        props.onEditAnnouncement(props.announcement);
    }

    return <div className="announcementContainer">
        <div className="announcementTitle">{props.announcement.title}</div>
        {props.showEdit && <div className="announcementTopRightGear pointable" onClick={onEdit}>⚙️</div>}
        <div>{formatPseudoMarkdown(props.announcement.content)}</div>
        <div className="smallFilesList">
            {props.announcement.files.map(f => <SmallFilesListFile file={f} />)}
        </div>
        <div className="dateAuthorFootNote">
            {footNoteDateAuthor(props.announcement.publication_date, props.announcement.author, props.announcement.modification_date)}
        </div>
    </div>
}

export default AnnouncementCell;