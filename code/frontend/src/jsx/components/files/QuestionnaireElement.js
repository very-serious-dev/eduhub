import { useContext } from "react";
import { footNoteDateAuthor, iconImgSrc } from "../../../util/Formatter";
import FilesElementContextMenuButton from "./FilesElementContextMenuButton";
import { ThemeContext } from "../../main/GlobalContainer";
import { pointableSecondary } from "../../../util/Themes";

const QuestionnaireElement = (props) => {
    const theme = useContext(ThemeContext);

    const onClick = (questionnaire) => {
        if (props.onClick) {
            props.onClick(questionnaire)
        }
    }

    const shouldShowContextMenu = () => {
        return props.showContextMenu;
    }

    return <div className={`myFilesElementContainer filesElementUnselected ${props.onClick !== null ? ` pointable ${pointableSecondary(theme)}` : ""}`} onClick={() => { onClick(props.questionnaire) }}>
        {shouldShowContextMenu() && <FilesElementContextMenuButton questionnaire={props.questionnaire}
            filesTree={props.filesTree}
            onMoveDeleteSuccess={props.onMoveDeleteSuccess}
            onMoveDeleteFail={props.onMoveDeleteFail} />}
        <div className="myFilesElementTitleContainer">
            <img className="myFilesElementIcon" src={iconImgSrc(props.questionnaire)}></img>
            <div className="myFilesElementName">{props.questionnaire.title}</div>
        </div>
        {props.questionnaire.is_protected && <div className="myFilesElementSpecialText">🚫 Protegido</div>}
        <div className="myFilesElementSize">📝 Formulario</div>
        <div className="myFilesElementAuthorDate">{`${footNoteDateAuthor(props.questionnaire.created_at, props.showAuthor ? `👤 ${props.questionnaire.author}` : null)}`}</div>
    </div>
}

export default QuestionnaireElement;