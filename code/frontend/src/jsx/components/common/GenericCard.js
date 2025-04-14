const GenericCard = (props) => {

    const onClick = () => {
        if (props.onClickWithId !== undefined) {
            props.onClickWithId(props.cardId);
        }
    }

    return <div key={props.cardId} onClick={onClick} className={`card genericCard${props.onClickWithId !== undefined ? " cardClickable" : ""}`} >
        {props.backgroundHoverImage && <img className="genericCardBackgroundHoverImage" src={props.backgroundHoverImage} />}
        <div className="genericCardPreTitle">{props.preTitle}</div>
        <div className="genericCardTitle">{props.title}</div>
        <div className="genericCardFooter">{props.footer}</div>
    </div>
}

export default GenericCard;