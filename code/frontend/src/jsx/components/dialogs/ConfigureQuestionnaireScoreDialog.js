import { useContext, useState } from "react";
import { ThemeContext } from "../../main/GlobalContainer";
import { accent, accentFormLabel, pointableSecondary, primary } from "../../../util/Themes";

const ConfigureQuestionnaireScoreDialog = (props) => {
    const [formTotalScore, setFormTotalScore] = useState("")
    const [formIncorrectAmount, setFormIncorrectAmount] = useState("")
    const theme = useContext(ThemeContext);

    const onSubmit = (event) => {
        event.preventDefault();
        const evaluableQuestions = props.questions.filter(question => {
            return question.type == "choices" && question.choices.some(choice => choice.is_correct)
        });
        const scorePerCorrectAnswer = formTotalScore / evaluableQuestions.length;
        let penaltyPerIncorrectAnswer;
        if (formIncorrectAmount < 0.00001) { /* float? */
            penaltyPerIncorrectAnswer = 0;
        } else {
            penaltyPerIncorrectAnswer = scorePerCorrectAnswer / formIncorrectAmount;
        }
        props.onScoreConfigured(scorePerCorrectAnswer, penaltyPerIncorrectAnswer);
        props.onDismiss();
    }

    return <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">Configurar puntuaciones</div>
                <form onSubmit={onSubmit}>
                    <div className="configureQuestionnaireScoreDialogText">¿Cuál es la puntuación total que se debe distribuir entre todas las preguntas tipo <i>test</i> con respuesta correcta?</div>
                    <div className="formInputContainer">
                        <input type="number" value={formTotalScore}
                            min={0}
                            step={.01}
                            className={`formInput ${primary(theme)}`}
                            onChange={e => { setFormTotalScore(e.target.value) }}
                            onFocus={e => { e.target.placeholder = "10.0"; }}
                            onBlur={e => { e.target.placeholder = ""; }}
                            required
                            autoFocus />
                        <div className={`underline ${accent(theme)}`} />
                        <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Puntuación total</label>
                    </div>
                    <div className="configureQuestionnaireScoreDialogText">Y, ¿cuántas respuestas incorrectas restan una correcta?</div>
                    <div className="formInputContainer">
                        <input type="number" value={formIncorrectAmount}
                            min={0}
                            step={1}
                            className={`formInput ${primary(theme)}`}
                            onChange={e => { setFormIncorrectAmount(e.target.value) }}
                            onFocus={e => { e.target.placeholder = "2"; }}
                            onBlur={e => { e.target.placeholder = ""; }}
                            required />
                        <div className={`underline ${accent(theme)}`} />
                        <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Respuestas incorrectas</label>
                    </div>
                    <div className="hint">Puedes indicar 0 si no quieres que las respuestas incorrectas resten puntuación</div>
                    <div className="formInputContainer">
                        <input type="submit" className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`}
                            value="Distribuir puntuación" />
                    </div>
                </form>
            </div>
        </div>
    </div>
}

export default ConfigureQuestionnaireScoreDialog;