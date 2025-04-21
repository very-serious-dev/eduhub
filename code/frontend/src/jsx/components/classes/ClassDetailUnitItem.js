import { useContext } from "react";
import { pointablePrimary, pointableSecondary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";

const ClassDetailUnitItem = (props) => {
    const theme = useContext(ThemeContext);

    const onClick = () => {
        props.onFilterByUnit(props.unit.name)
    }

    const onEdit = (event) => {
        event.stopPropagation();
        props.onEdit(props.unit);
    }

    return <div key={props.unit.id}
                className={`classDetailSectionSubitem sectionSubitemPaddingTopBottomMedium pointable ${pointableSecondary(theme)}`}
                onClick={onClick}>{props.unit.name}
                { props.editable === true &&
                    <div className={`classDetailSectionSubitemEditBtn ${pointablePrimary(theme)}`}
                        onClick={onEdit}>⚙️</div> }
            </div>   
}

export default ClassDetailUnitItem;