import { useContext, useState } from "react"
import { ThemeContext } from "../../main/GlobalContainer"
import { pointableSecondary, primary, tertiary } from "../../../util/Themes";

const QuestionnaireChoicesQuestion = (props) => {
    const [showSecretAnswerHint, setShowSecretAnswerHint] = useState(false);
    const [secretAnswerText, setSecretAnswerText] = useState("");
    const theme = useContext(ThemeContext);

    const onSecretAnswerTextChanged = (e) => {
        const choicesThatMatch = props.question.choices.filter(choice => choice.content.toLowerCase().includes(e.target.value.toLowerCase()));
        if (choicesThatMatch.length === 1) {
            props.setAnswer(props.questionIndex, `${choicesThatMatch[0].number}`);
            setSecretAnswerText("");
        } else {
            props.setAnswer(props.questionIndex, "");
            setSecretAnswerText(e.target.value);
        }
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
                <label htmlFor="">{choice.content}</label>
            </div>
        })}
        {props.isSecret && props.answer !== "" && <div className="hint">👍🏻 Respuesta escogida</div>}
        <button className={`choicesQuestionClearButton pointable ${primary(theme)} ${pointableSecondary(theme)}`}
            onClick={e => { e.preventDefault(); props.setAnswer(props.questionIndex, "") }}
            disabled={props.answer === ""}>
            Borrar
        </button>
        {props.isSecret && <>
            <div className="formInputContainer">
                <input className="formInput formInputSecretText"
                    type="text"
                    value={secretAnswerText}
                    onChange={onSecretAnswerTextChanged}
                    onFocus={e => { setShowSecretAnswerHint(true); }}
                    onBlur={e => { setShowSecretAnswerHint(false); }}
                    placeholder="Escribe aquí el texto de la opción que quieres escoger" />
                
            </div>
            {showSecretAnswerHint && props.answer === "" && <div className="hint">No necesitas escribir <i>toda</i> la respuesta. Basta con que teclees un trozo de la respuesta lo suficientemente grande para que la diferencie del resto de opciones</div>}
        </>}
    </div>
}

export default QuestionnaireChoicesQuestion;