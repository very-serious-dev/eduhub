const ClassDetailUnitItem = (props) => {
    const onClick = () => {
        props.onFilterByUnit(props.unit.name)
    }

    const onEdit = (event) => {
        event.stopPropagation();
        props.onEdit(props.unit);
    }

    return <div key={props.unit.id}
                className="classDetailSectionSubitem sectionSubitemPaddingTopBottomMedium"
                onClick={onClick}>{props.unit.name}
                { props.editable === true &&
                    <div className="classDetailSectionSubitemEditBtn"
                        onClick={onEdit}>⚙️</div> }
            </div>   
}

export default ClassDetailUnitItem;