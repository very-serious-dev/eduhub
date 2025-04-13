import { footNoteDateAuthor, formatPseudoMarkdown } from "../../../util/Formatter";
import SmallFilesListFile from "../common/SmallFilesListFile";
import PostsBoardEntryTopRightContent from "./PostsBoardEntryTopRightContent";

const PostsBoardEntry = (props) => {

    return <div className="card classDetailEntry">
        <PostsBoardEntryTopRightContent post={props.post}
            classUnits={props.classUnits}
            showEdit={props.showEdit}
            onPostsChanged={props.onPostsChanged} />
        <div className="classDetailEntryTitle">{props.post.title}</div>
        <div className="classDetailEntryContent">{formatPseudoMarkdown(props.post.content)}</div>
        <div className="smallFilesList">
            {props.post.files.map(f => <SmallFilesListFile file={f} />)}
        </div>
        <div className="dateAuthorFootNote">
            {footNoteDateAuthor(props.post.publication_date, props.post.author, props.post.modificationDate)}
        </div>
    </div>
}

export default PostsBoardEntry;