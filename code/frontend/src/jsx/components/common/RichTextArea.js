const RichTextArea = (props) => {

    const getSelection = () => {
        if (document.getSelection) {
            return document.getSelection()
        }
        return window.getSelection(); 
    }

    const boldClicked = () => {
        const selection = getSelection();
        alert(document.getElementById("richTextArea").innerHTML)
        
    }

    return <div className="richTextAreaParentWithButtons">
                <div id="richTextArea" className="richTextAreaDivContent" contentEditable={true} role="textbox"></div>
                <div className="richTextAreaButtonsContainer" >
                    <div onClick={boldClicked}>B1</div>
                </div>
        </div>}

export default RichTextArea;