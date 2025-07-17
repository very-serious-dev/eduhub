import { useContext, useState } from "react";
import { ThemeContext } from "../../main/GlobalContainer";
import { accent, pointableSecondary, primary } from "../../../util/Themes";
import { useNavigate } from "react-router";

const QuestionnaireBodyStudentForm = (props) => {
    const [answers, setAnswers] = useState();
    const navigate = useNavigate();
    const theme = useContext(ThemeContext);

    const onClose = () => {
        // Implement are you sure? dialog
        navigate(-1);
    }

    return <div>
        <div className="classDetailHeaderTopIcons">
            <div className={`classDetailHeaderIcon pointable ${pointableSecondary(theme)}`} onClick={onClose}>✖️</div>
        </div>
        <div className="questionnairePageContainer">
            <div className="questionnaireDetailTitleHeader">
                <div className="questionnaireDetailTitle">{props.questionnaireData.title}</div>
                <div className={`classDetailSectionUnderline ${accent(theme)}`} />
            </div>
            Preguntas
        </div>
    </div>
}

export default QuestionnaireBodyStudentForm;