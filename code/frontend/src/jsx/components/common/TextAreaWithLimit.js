import { useContext } from "react";
import { ThemeContext } from "../../main/GlobalContainer";
import { borderPrimary } from "../../../util/Themes";

const TextAreaWithLimit = (props) => {
    const theme = useContext(ThemeContext);

    const defaultPlaceholder = "Escribe aquí...";

    return <textarea value={props.value}
        className={`formTextArea ${props.small ? "smallText" : "bigText"} ${borderPrimary(theme)}`}
        placeholder={defaultPlaceholder}
        onChange={e => { props.setValue(e.target.value) }}
        onFocus={e => { e.target.placeholder = "Puedes poner texto en *negrita* si lo rodeas con *asteriscos*, o en _cursiva_, si usas _barras bajas_\n\nTambién puedes mostrar listas comenzando tus párrafos con un guión:\n- Así\n- Por\n- Ejemplo"; }}
        onBlur={e => { e.target.placeholder = defaultPlaceholder; }} required />
}

export default TextAreaWithLimit;