import { useContext } from "react";
import { ThemeContext } from "../../main/GlobalContainer";
import { borderPrimary } from "../../../util/Themes";

const TextAreaWithLimit = (props) => {
    const theme = useContext(ThemeContext);

    const defaultPlaceholder = "Escribe aquí...";

    return <div className="textAreaContainer">
        <textarea value={props.value}
            className={`formTextArea ${props.small ? "smallText" : "bigText"} ${borderPrimary(theme)}`}
            placeholder={defaultPlaceholder}
            maxLength={props.maxLength}
            onChange={e => { props.setValue(e.target.value) }}
            onFocus={e => { e.target.placeholder = "Puedes poner texto en *negrita* si lo rodeas con *asteriscos*, o en _cursiva_, si usas _barras bajas_.\nTambién puedes mostrar listas comenzando tus párrafos con un guión:\n- Uno\n- Dos\n- Tres"; }}
            onBlur={e => { e.target.placeholder = defaultPlaceholder; }} required />
            <p className="textAreaCharacterLimit">{props.value.length}/{props.maxLength}</p>
    </div>
}

export default TextAreaWithLimit;