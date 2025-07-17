import { useContext } from "react"
import { ThemeContext } from "../../main/GlobalContainer"
import { accent, tertiary } from "../../../util/Themes";

const TextQuestion = (props) => {
    const theme = useContext(ThemeContext);

    return <div className="card questionnaireQuestionContainer">
        <div className="questionnaireQuestionTopRightContainer">
            <div className={`questionnaireQuestionTopRightQuestionNumber ${tertiary(theme)}`}>Pregunta {props.questionIndex + 1}</div>
        </div>
        <div>{props.question.title}</div>
        <div className="formInputContainer">
            <input className="formInput"
                type="text"
                value={props.answer}
                onChange={e => { props.setAnswer(props.questionIndex, e.target.value) }}
                maxLength={50}
                placeholder="Escribe aquí tu respuesta"
                required />
            <div className={`underline ${accent(theme)}`} />
        </div>
    </div>
}

export default TextQuestion;