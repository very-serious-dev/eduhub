import { useContext } from "react";
import { pointableSecondary, primary } from "../../../util/Themes";
import ClassDetailDrawerSectionTitle from "./ClassDetailDrawerSectionTitle";
import ClassDetailUnitItem from "./ClassDetailUnitItem";
import { ThemeContext } from "../../main/GlobalContainer";

const ClassDetailDrawerSectionUnits = (props) => {
    const theme = useContext(ThemeContext);

    return <div>
        <ClassDetailDrawerSectionTitle title="📚 Temario" />
        <div>
            {props.classData.units.length > 0 ?
                props.classData.units.map(u => {
                    return <ClassDetailUnitItem unit={u}
                        onFilterByUnit={props.onFilterPostsByUnit}
                        editable={props.classData.should_show_edit_button}
                        onEdit={props.onClickEditUnit} />
                })
                : <p>No hay temas</p>}
        </div>
        {props.classData.should_show_edit_button === true &&
            <div className={`card classDetailBubbleButton pointable ${primary(theme)} ${pointableSecondary(theme)}`} onClick={props.onClickNewUnit}>
                ➕ Añadir tema
            </div>}
    </div>
}

export default ClassDetailDrawerSectionUnits;