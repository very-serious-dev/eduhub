import { useNavigate } from "react-router-dom";
import AnimatedButton from "./AnimatedButton";

const MainHeader = (props) => {
    const navigate = useNavigate();

    return <div className="mainPageFlexHeader">
        <img src="/logo.png" />
        <AnimatedButton onClick={() => { navigate("/"); }} text="📚 Clases" />
        <AnimatedButton onClick={() => { navigate("/files"); }} text="📁 Archivos" />
        {props.showAdminLink && <AnimatedButton onClick={() => { navigate("/admin"); }} text="⚙️ Panel de administración" />}
    </div>
}

export default MainHeader;