import { useContext, useState } from "react";
import { pointableSecondary, primary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";
import TextAreaWithLimit from "../common/TextAreaWithLimit";

const AddManyTextQuestionsDialog = (props) => {
    const [formContent, setFormContent] = useState("");
    const theme = useContext(ThemeContext);

    const onSubmit = (e) => {
        e.preventDefault();
        props.onDismiss();
        props.onPlainTextSubmit(formContent);
    }

    return <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">Añadir preguntas desde texto plano</div>
                <form onSubmit={onSubmit}>
                    <TextAreaWithLimit value={formContent} setValue={setFormContent} maxLength={10000} small={false} placeholder={"Pregunta 1\na) Respuesta 1\nb) Respuesta 2\nc) Respuesta 3 (Correcta)\nd) Respuesta 4\n\nPregunta 2\na) Respuesta 1 (Correcta)\nb) Respuesta 2\nc) Respuesta 3\nd) Respuesta 4\n\n¡Es fácil pedir a una IA generativa (e.g.: ChatGPT) preguntas y respuestas con este formato!\nPuedes añadir el número de respuestas que quieras (2, 3, 4, 5,...)\nSi omites (Correcta) ó (Correct) en las respuestas, no se configurará la respuesta correcta autoevaluable"} />
                    <div className="formInputContainer">
                        <input className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`} type="submit" value="Cargar preguntas" />
                    </div>
                </form>
            </div>
        </div>
    </div>
}

export default AddManyTextQuestionsDialog;