import { footNoteForDateAndAuthor } from "../../../util/Formatter";
import PostsBoardEntryFile from "./PostsBoardEntryFile";

const PostsBoardEntry = (props) => {
    const addLineBreaks = (str) => {
        return str.split('\n').map(subStr => <>{subStr}<br/></>);
    }

    const footNote = () => {
        const date = new Date(props.post.publication_date);
        return `${props.post.author}, ${date.toLocaleDateString()} (${date.getHours()}:${date.getMinutes()})`
    }

    return <div className="card classDetailEntry">
        {props.post.unitName && <div className="classDetailEntryUnit">{props.post.unitName}</div>}
        <div className="classDetailEntryTitle">{props.post.title}</div>
        <div className="classDetailEntryContent">{addLineBreaks(props.post.content)}</div>
        <div className="classDetailEntryFiles">
            {props.post.files.map(f => <PostsBoardEntryFile file={f} />)}
        </div>
        <div className="classDetailEntryFootNote">
            {footNoteForDateAndAuthor(props.post.publication_date, props.post.author)}
        </div>
    </div>
}

export default PostsBoardEntry;