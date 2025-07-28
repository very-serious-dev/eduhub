import { useContext } from "react";
import { ThemeContext } from "../../main/GlobalContainer";
import { tertiary } from "../../../util/Themes";

const QuestionnaireTextQuestionAnswers = (props) => {
    const theme = useContext(ThemeContext);

    return <div className="card questionnaireQuestionContainer" key={`question${props.questionIndex + 1}`}>
        <div className="questionnaireQuestionTopRightContainer">
            <div className={`questionnaireQuestionTopRightQuestionNumber ${tertiary(theme)}`}>Pregunta {props.question.number}</div>
        </div>
        <div>{props.question.title}</div>
        {props.allAnswers.length === 0 && <div>No hay respuestas registradas para esta pregunta</div>}
        {props.allAnswers.map((answer, idx) => {
            return <div className="allSubmitsAnswerContainer" key={`answer${idx}`}>
                <div>{answer.answer}</div>
                <div className="allSubmitsAnswerAuthorContainer">
                    <div className="allSubmitsAnswerAuthorFullName">{`${answer.author.name} ${answer.author.surname}`}</div>
                    <div className="allSubmitsAnswerAuthorUsername">{`(${answer.author.username})`}</div>
                </div>
            </div>
        })}
    </div>

}

export default QuestionnaireTextQuestionAnswers;