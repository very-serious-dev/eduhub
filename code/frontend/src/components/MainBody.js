import MainBodyClasses from "./classes/MainBodyClasses";
import MainBodyFiles from "./files/MainBodyFiles";
import MainBodyMessages from "./messages/MainBodyMessages";

const MainBody = () => {
    return <div className="mainBody">
        <div className="mainBodyColumn1">
            <MainBodyClasses />
        </div>
        <div className="mainBodyColumn2">
            <MainBodyMessages />
            <MainBodyFiles />
        </div>
    </div>
}

export default MainBody;