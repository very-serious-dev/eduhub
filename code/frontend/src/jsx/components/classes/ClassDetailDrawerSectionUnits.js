import ClassDetailDrawerSectionTitle from "./ClassDetailDrawerSectionTitle";
import ClassDetailUnitItem from "./ClassDetailUnitItem";

const ClassDetailDrawerSectionUnits = (props) => {
    return <div>
        <ClassDetailDrawerSectionTitle title="📚 Temario" />
        <div>
            {props.classData.units.length > 0 ?
                props.classData.units.map(u => {
                    return <ClassDetailUnitItem unit={u}
                        editable={props.classData.shouldShowEditButton}
                        onEdit={props.onClickEditUnit} />
                })
                : <p>No hay temas</p>}
        </div>
        {props.classData.shouldShowEditButton === true &&
            <div className="card classDetailBubbleButton" onClick={props.onClickNewUnit}>
                ➕ Añadir tema
            </div>}
    </div>
}

export default ClassDetailDrawerSectionUnits;