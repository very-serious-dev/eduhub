const GenericCard = (props) => {

    const onClick = () => {
        if (props.onClickWithId !== undefined) {
            props.onClickWithId(props.cardId);
        }
    }

    const skirtingBoard = () => {
        return <div style={{ backgroundColor: props.skirtingBoardColor }} className="genericCardSkirtingBoard"></div>
    }

    return <div key={props.cardId} onClick={onClick} className={`card genericCard ${props.additionalCssClass ?? ""} ${props.onClickWithId !== undefined ? "cardClickable" : ""}`} >
        { props.skirtingBoardColor && skirtingBoard() }
        <div className="genericCardPreTitle">{props.preTitle}</div>
        <div className="genericCardTitle">{props.title}</div>
        <div className="genericCardFooter">{props.footer}</div> 
    </div>
}

export default GenericCard;