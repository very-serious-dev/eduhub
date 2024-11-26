const PostsBoardEntry = (props) => {
    const addLineBreaks = (str) =>
        str.split('\n').map((subStr) => {
          return (
            <>
              {subStr}
              <br />
            </>
          );
        });
      

    return <div className="card classDetailEntry">
        <div className="classDetailEntrySubItem">{props.post.title}</div>
        <div>{addLineBreaks(props.post.content)}</div>
        <div className="classDetailEntrySubItem">{props.post.publication_date}</div>
    </div>
}

export default PostsBoardEntry;