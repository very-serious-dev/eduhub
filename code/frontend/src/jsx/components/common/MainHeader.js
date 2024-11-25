import { useNavigate } from "react-router-dom";
import AnimatedButton from "./AnimatedButton";
import { useContext, useState } from "react";
import EduAPIFetch from "../../../client/EduAPIFetch";
import { FeedbackContext } from "../../main/GlobalContainer";

const MainHeader = (props) => {
    const [isLoadingLogout, setLoadingLogout] = useState(false);
    const navigate = useNavigate();
    const setFeedback = useContext(FeedbackContext);

    const onLogout = () => {
        if (isLoadingLogout) { return; }
        const options = {
            method: "DELETE",
            credentials: "include"
        };
        setLoadingLogout(true);
        EduAPIFetch(`/api/v1/sessions`, options)
            .then(json => {
                setLoadingLogout(false);
                if (json.success === true) {
                    navigate("/login");
                    setFeedback({type: "info", message: "Has cerrado tu sesión"});
                } else {
                    setFeedback({type: "error", message: "Se ha producido un error"});
                }
            })
            .catch(error => {
                setLoadingLogout(false);
                setFeedback({type: "error", message: error.error ?? "Se ha producido un error"});
            })
    }

    return <div className="mainPageFlexHeader">
        <img src="/logo.png" />
        { isLoadingLogout ? <p>Cerrando sesión...</p> 
          : <>
            <AnimatedButton onClick={() => { navigate("/"); }} text="📚 Clases" />
            <AnimatedButton onClick={() => { navigate("/files"); }} text="📁 Archivos" />
            {props.showAdminLink && <AnimatedButton onClick={() => { navigate("/admin"); }} text="⚙️ Panel de administración" />}
            <AnimatedButton onClick={onLogout} text="Cerrar sesión" rightAligned={true}/>
        </>}
    </div>
}

export default MainHeader;