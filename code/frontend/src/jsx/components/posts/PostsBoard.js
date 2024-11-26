import PostsBoardEntry from "./PostsBoardEntry";

const PostsBoard = (props) => {

    return <div className="postsBoardContainer">
        <div className="card postsBoardPublishButton">➕ Nueva publicación</div>
        {props.classData.posts.map(p => <PostsBoardEntry post={p} />)}
    </div>
}

export default PostsBoard;