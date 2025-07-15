import { useContext } from "react";
import { ThemeContext } from "../../main/GlobalContainer";
import { primary } from "../../../util/Themes";

const NewQuestionnaireChoicesQuestionScore = (props) => {
    const theme = useContext(ThemeContext);

    return <div className="questionnaireNewQuestionChoiceScoreContainer">
        <span className="questionnaireNewQuestionChoiceScoreText">La respuesta correcta suma: </span>
        <input className={`questionnaireNewQuestionChoiceScoreInput ${primary(theme)}`}
            type="number"
            min={0}
            step={.001}
            value={props.question.correct_answer_score}
            onChange={e => { props.onChangeCorrectAnswerScore(props.questionIndex, e.target.value) }}
            maxLength={6}
            required />
        <span className="questionnaireNewQuestionChoiceScoreText"> puntos. Respuesta incorrecta resta </span>
        <input className={`questionnaireNewQuestionChoiceScoreInput ${primary(theme)}`}
            type="number"
            min={0}
            step={.001}
            value={props.question.incorrect_answer_score}
            onChange={e => { props.onChangeIncorrectAnswerScore(props.questionIndex, e.target.value) }}
            maxLength={6}
            required />
        <span className="questionnaireNewQuestionChoiceScoreText"> puntos.</span>
        <button onClick={(event) => { event.preventDefault(); props.onConfigureScores() }} className="questionnaireNewQuestionChoicesConfigureScoresButton pointable">
            ⚙️ Ajustar
        </button>
    </div>
}

export default NewQuestionnaireChoicesQuestionScore;