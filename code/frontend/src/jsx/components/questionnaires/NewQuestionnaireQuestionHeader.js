import { useContext } from "react";
import { ThemeContext } from "../../main/GlobalContainer";
import { accent, accentFormLabel, primary, tertiary } from "../../../util/Themes";

const NewQuestionnaireQuestionHeader = (props) => {
    const theme = useContext(ThemeContext);

    return <>
        <div className="questionnaireNewQuestionTopRightContainer">
            <div className={`questionnaireNewQuestionTopRightQuestionNumber ${tertiary(theme)}`}>Pregunta {props.questionIndex + 1}</div>
            {props.showMoveUp && <div className="questionnaireNewQuestionMove pointable" onClick={() => { props.onMoveUp(props.questionIndex) }}>⬆️</div>}
            {props.showMoveDown && <div className="questionnaireNewQuestionMove pointable" onClick={() => { props.onMoveDown(props.questionIndex) }}>⬇️</div>}
            <div className="questionnaireNewQuestionDelete pointable" onClick={() => { props.onDelete(props.questionIndex) }}>❌</div>
        </div>
        <div className="formInputContainer">
            <input className={`formInput ${primary(theme)}`} type="text" value={props.questionTitle}
                onChange={e => { props.setQuestionTitle(props.questionIndex, e.target.value) }}
                maxLength={500}
                required />
            <div className={`underline ${accent(theme)}`} />
            <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Pregunta</label>
        </div>
    </>
}

export default NewQuestionnaireQuestionHeader;