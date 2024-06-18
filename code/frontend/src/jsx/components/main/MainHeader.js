import { useNavigate } from "react-router-dom";
import AnimatedButton from "../common/AnimatedButton";

// Reused in Admin page
const MainHeader = (props) => {
    const navigate = useNavigate();

    return <div className="mainPageFlexHeader">
        <img src="/logo.png" />
        {props.showAdminLink && <div className="headerAdminLinkButtonContainer">
            <AnimatedButton onClick={() => { navigate("/admin"); }} text="Panel de administración" />
        </div>}
    </div>
}

export default MainHeader;