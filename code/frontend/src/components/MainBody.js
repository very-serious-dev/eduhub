import MainBodyClasses from "./classes/MainBodyClasses";
import MainBodyFiles from "./files/MainBodyFiles";
import MainBodyMessages from "./messages/MainBodyMessages";

const MainBody = () => {
    return <div className="mainBody">
        <div className="mainArea">
            <MainBodyClasses />
        </div>
        <div className="secondaryArea">
            <MainBodyMessages />
            <MainBodyFiles />
        </div>
    </div>
}

export default MainBody;