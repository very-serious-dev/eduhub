import { useContext } from "react";
import { accent, pointableSecondary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";
import { useNavigate } from "react-router";

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
            </div>
        </div>
        {sortedQuestions().map(q => {
            // TODO: show questions and answers from students
            return <div></div>
        })}
    </div>
}

export default QuestionnaireBodyTeacherOverview;