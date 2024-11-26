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
        <div className="classDetailEntrySubItem">{props.entry.author}</div>
        <div>{addLineBreaks(props.entry.content)}</div>
        <div className="classDetailEntrySubItem">{props.entry.published_date}</div>
    </div>
}

export default PostsBoardEntry;