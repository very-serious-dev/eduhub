import { useContext } from "react";
import { accent, pointableSecondary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";
import { useNavigate } from "react-router";
import QuestionnaireTextQuestionAnswers from "./QuestionnaireTextQuestionAnswers";
import QuestionnaireChoicesQuestionAnswers from "./QuestionnaireChoicesQuestionAnswers";

const QuestionnaireBodyTeacherOverview = (props) => {
    const navigate = useNavigate();
    const theme = useContext(ThemeContext);

    const sortedQuestions = () => {
        const questions = [...props.questionnaireData.questions];
        questions.sort((a, b) => a.number - b.number);
        return questions;
    }

    return <div>
        <div className="classDetailHeaderTopIcons">
            <div className={`classDetailHeaderIcon pointable ${pointableSecondary(theme)}`} onClick={() => { navigate(-1) }}>✖️</div>
        </div>
        <div className="questionnairePageContainer">
            <div className="questionnaireDetailTitleHeader">
                <div className="questionnaireDetailTitle">{props.questionnaireData.title}</div>
                <div className={`classDetailSectionUnderline ${accent(theme)}`} />
                {sortedQuestions().map(question => {
                    const allAnswersForQuestion = props.questionnaireData.submits.reduce((acumAnswers, submit) => {
                        const singleAnswer = submit.answers.find(answer => (answer.type === question.type) && (answer.question_id === question.id));
                        if (singleAnswer) {
                            return [...acumAnswers, { ...singleAnswer, author: submit.author }];
                        }
                        return acumAnswers;
                    }, []);

                    if (question.type === "text") {
                        return <QuestionnaireTextQuestionAnswers question={question} allAnswers={allAnswersForQuestion} />
                    } else if (question.type === "choices") {
                        return <QuestionnaireChoicesQuestionAnswers question={question} allAnswers={allAnswersForQuestion} />
                    } else {
                        return <div>Tipo de pregunta no conocido</div>
                    }
                })}
            </div>
        </div>
    </div>
}

export default QuestionnaireBodyTeacherOverview;