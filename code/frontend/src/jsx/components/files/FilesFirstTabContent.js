const FilesFirstTabContent = (props) => {

    return <div>
        <div className={`filesFirstTabElement myFilesElementContainerHoverable ${props.selectedRoot === "MY_FILES" ? "filesElementSelected" : "filesElementUnselected"}`}
            onClick={() => { props.onRootClicked("MY_FILES") }}>
            <div className="filesFirstTabTitle">🖥️ Tu unidad</div>
        </div>
    </div>
}

export default FilesFirstTabContent;