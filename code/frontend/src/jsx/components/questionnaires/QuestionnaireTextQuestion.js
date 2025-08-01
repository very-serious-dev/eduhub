import { useContext } from "react"
import { ThemeContext } from "../../main/GlobalContainer"
import { accent, tertiary } from "../../../util/Themes";

const QuestionnaireTextQuestion = (props) => {
    const theme = useContext(ThemeContext);
    
    return <div className="card questionnaireQuestionContainer" key={`question${props.questionIndex + 1}`}>
        <div className="questionnaireQuestionTopRightContainer">
            <div className={`questionnaireQuestionTopRightQuestionNumber ${tertiary(theme)}`}>Pregunta {props.question.number}</div>
        </div>
        <div>{props.question.title}</div>
        <div className="formInputContainer">
            <input className={`formInput ${props.isSecret ? "formInputSecretText" : ""}`}
                type="text"
                value={props.answer}
                onChange={e => { props.setAnswer(props.questionIndex, e.target.value) }}
                maxLength={500}
                placeholder="Escribe aquí tu respuesta"
                required />
            <div className={`underline ${accent(theme)}`} />
        </div>
    </div>
}

export default QuestionnaireTextQuestion;