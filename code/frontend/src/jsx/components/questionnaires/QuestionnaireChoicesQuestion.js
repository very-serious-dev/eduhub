import { useContext, useState } from "react"
import { ThemeContext } from "../../main/GlobalContainer"
import { pointableSecondary, primary, tertiary } from "../../../util/Themes";

const QuestionnaireChoicesQuestion = (props) => {
    const [secretAnswerText, setSecretAnswerText] = useState("");
    const theme = useContext(ThemeContext);

    const onSecretAnswerTextChanged = (e) => {
        setSecretAnswerText(e.target.value);
        if (e.target.value.length !== 1) { return; }
        const chosenOption = e.target.value.toLowerCase();
        const chosenOptionNumber = "abcdefghijklmnopqrstuvwxyz".indexOf(chosenOption) + 1;
        if ((chosenOptionNumber > 0) && (chosenOptionNumber <= props.question.choices.length)) { 
            props.setAnswer(props.questionIndex, `${chosenOptionNumber}`);
        }
    }

    const letterForNumber = (number) => {
        return "abcdefghijklmnopqrstuvwxyz"[number - 1];
    }

    const choices = props.question.choices;
    choices.sort((a, b) => a.number - b.number);

    return <div className="card questionnaireQuestionContainer" key={`question${props.questionIndex + 1}`}>
        <div className="questionnaireQuestionTopRightContainer">
            <div className={`questionnaireQuestionTopRightQuestionNumber ${tertiary(theme)}`}>Pregunta {props.question.number}</div>
        </div>
        <div>{props.question.title}</div>
        {choices.map(choice => {
            return <div className="formInputRadio" key={`question${props.questionIndex + 1}choice${choice.number}`}>
                <input type="radio" name={`question${props.questionIndex + 1}`} value={choice.number}
                    onChange={e => { props.setAnswer(props.questionIndex, e.target.value) }}
                    checked={!props.isSecret && (choice.number.toString() === props.answer)}
                    disabled={props.isSecret} />
                <label htmlFor=""><b>{letterForNumber(choice.number)})</b> {choice.content}</label>
            </div>
        })}
        {props.isSecret && props.answer !== "" && <div className="hint">👍🏻 Respuesta escogida</div>}
        <button className={`choicesQuestionClearButton pointable ${primary(theme)} ${pointableSecondary(theme)}`}
            onClick={e => { e.preventDefault(); props.setAnswer(props.questionIndex, ""); setSecretAnswerText(""); }}
            disabled={props.answer === ""}>
            Borrar
        </button>
        {props.isSecret && <div className="formInputContainer">
                <input className="formInput formInputSecretText"
                    type="text"
                    value={secretAnswerText}
                    onChange={onSecretAnswerTextChanged}
                    placeholder="Escribe aquí la letra (a, b, c,...) de la opción que quieres escoger" />
                
            </div>}
    </div>
}

export default QuestionnaireChoicesQuestion;