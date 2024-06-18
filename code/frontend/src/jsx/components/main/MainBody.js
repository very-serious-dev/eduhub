import MainBodyClasses from "./classes/MainBodyClasses";
import MainBodyFiles from "./files/MainBodyFiles";
import MainBodyMessages from "./messages/MainBodyMessages";

const MainBody = (props) => {
    return <div className="mainPageFlexBody">
        <div className="mainBody">
            <div className="mainBodyColumn1">
                <MainBodyClasses classes={props.classes} />
            </div>
            <div className="mainBodyColumn2">
                <MainBodyMessages />
                <MainBodyFiles />
            </div>
        </div>
    </div>
}

export default MainBody;