import { useContext } from "react"
import { ThemeContext } from "../../main/GlobalContainer"
import { pointableSecondary, primary, tertiary } from "../../../util/Themes";

const ChoicesQuestion = (props) => {
    const theme = useContext(ThemeContext);

    const choices = props.question.choices;
    choices.sort((a, b) => a.number - b.number);

    return <div className="card questionnaireQuestionContainer" key={`question${props.questionIndex + 1}`}>
        <div className="questionnaireQuestionTopRightContainer">
            <div className={`questionnaireQuestionTopRightQuestionNumber ${tertiary(theme)}`}>Pregunta {props.questionIndex + 1}</div>
        </div>
        <div>{props.question.title}</div>
        {choices.map(choice => {
            return <div className="formInputRadio" key={`question${props.questionIndex + 1}choice${choice.number}`}>
                <input type="radio" name={`question${props.questionIndex + 1}`} value={choice.number}
                    onChange={e => { props.setAnswer(props.questionIndex, e.target.value) }}
                    checked={choice.number.toString() === props.answer} />
                <label htmlFor="">{choice.content}</label>
            </div>
        })}
        <button className={`choicesQuestionClearButton pointable ${primary(theme)} ${pointableSecondary(theme)}`}
            onClick={e => { e.preventDefault(); props.setAnswer(props.questionIndex, "") }}
            disabled={props.answer === ""}>
            Borrar
        </button>
    </div>
}

export default ChoicesQuestion;