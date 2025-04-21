import { useContext } from "react";
import { pointableSecondary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";

const GenericCard = (props) => {
    const theme = useContext(ThemeContext);

    const onClick = () => {
        if (props.onClickWithId !== undefined) {
            props.onClickWithId(props.cardId);
        }
    }

    return <div key={props.cardId} onClick={onClick} className={`card genericCard ${props.onClickWithId !== undefined ? `${pointableSecondary(theme)} pointable` : ""}`} >
        {props.backgroundHoverImage && <img className="genericCardBackgroundHoverImage" src={props.backgroundHoverImage} />}
        <div className="genericCardPreTitle">{props.preTitle}</div>
        <div className="genericCardTitle">{props.title}</div>
        <div className="genericCardFooter">{props.footer}</div>
    </div>
}

export default GenericCard;