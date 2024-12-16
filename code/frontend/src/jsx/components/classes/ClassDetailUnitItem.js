const ClassDetailUnitItem = (props) => {
    const onClick = () => {
        alert("To-Do")
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
                        onClick={onEdit}>
                        Editar
                    </div> }
            </div>   
}

export default ClassDetailUnitItem;