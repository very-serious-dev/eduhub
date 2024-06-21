const GenericCard = (props) => {
    return <div className="card genericCard" key={props.key}>
        <div className="genericCardPreTitle">{props.preTitle}</div>
        <div className="genericCardTitle">{props.title}</div>
        <div className="genericCardFooter">{props.footer}</div>
    </div>
}

export default GenericCard;