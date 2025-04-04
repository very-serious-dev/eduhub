import { footNoteDateAuthor, formatPseudoMarkdown } from "../../../util/Formatter";
import PostsBoardEntryFile from "./PostsBoardEntryFile";
import PostsBoardEntryTopRightContent from "./PostsBoardEntryTopRightContent";

const PostsBoardEntry = (props) => {

    return <div className="card classDetailEntry">
        <PostsBoardEntryTopRightContent post={props.post}
            classUnits={props.classUnits}
            showEdit={props.showEdit}
            onPostsChanged={props.onPostsChanged} />
        <div className="classDetailEntryTitle">{props.post.title}</div>
        <div className="classDetailEntryContent">{formatPseudoMarkdown(props.post.content)}</div>
        <div className="classDetailEntryFiles">
            {props.post.files.map(f => <PostsBoardEntryFile file={f} />)}
        </div>
        <div className="classDetailEntryFootNote">
            {footNoteDateAuthor(props.post.author, props.post.publication_date, props.post.modificationDate)}
        </div>
    </div>
}

export default PostsBoardEntry;