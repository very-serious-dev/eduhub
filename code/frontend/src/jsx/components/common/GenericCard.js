const GenericCard = (props) => {

    const onClick = () => {
        props.onClickWithId(props.cardId);
    }

    return <div key={props.cardId} onClick={onClick} className={`card genericCard ${props.additionalCssClass ?? ""}`} >
        <div className="genericCardPreTitle">{props.preTitle}</div>
        <div className="genericCardTitle">{props.title}</div>
        <div className="genericCardFooter">{props.footer}</div>
    </div>
}

export default GenericCard;