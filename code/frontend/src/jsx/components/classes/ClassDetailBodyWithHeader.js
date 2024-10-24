import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClassDetailBody from "./ClassDetailBody";
import EditClassDialog from "../dialogs/EditClassDialog";
import { FeedbackContext } from "../../main/GlobalContainer";

const ClassDetailBodyWithHeader = (props) => {
    const [isHeaderCollapsed, setHeaderCollapsed] = useState(false);
    const [showEditClassPopup, setShowEditClassPopup] = useState(false);
    const navigate = useNavigate();
    const setFeedback = useContext(FeedbackContext);

    useEffect(() => {
        const handleScroll = (e) => {
            setHeaderCollapsed(document.body.scrollTop > 30 ||
                document.documentElement.scrollTop > 30);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const onClassEdited = (errorMessage) => {
        if (errorMessage === undefined) {
            setFeedback({type: "success", message: "Clase modificada con éxito"});
            props.onShouldRefresh();
        } else {
            setFeedback({type: "error", message: errorMessage});
        }
    }

    const onClassDeleted = (errorMessage) => {
        if (errorMessage === undefined) {
            setFeedback({type: "success", message: "Clase eliminada con éxito"});
            navigate("/");
        } else {
            setFeedback({type: "error", message: errorMessage});
        }
    }

    return <>
        <EditClassDialog show={showEditClassPopup}
                onDismiss={() => { setShowEditClassPopup(false); }}
                onClassEdited={onClassEdited}
                onClassDeleted={onClassDeleted}
                classId={props.classData.id} />
        <div className={`classDetailHeader ${isHeaderCollapsed ? "cdhCollapsed" : "cdhExpanded"}`}>
            <img className={`classDetailHeaderImage ${isHeaderCollapsed ? "cdhImgCollapsed" : "cdhImgExpanded"}`} src="/class_header.png" />
            <div className={`classDetailHeaderTitle ${isHeaderCollapsed ? "cdhTitleCollapsed" : "cdhTitleExpanded"}`}>{props.classData.name}</div>
            <div className="classDetailHeaderCloseIcon" onClick={() => { navigate("/");}}>✖</div>
            { props.classData.shouldShowEditButton === true && 
              <div className="classDetailHeaderEditIcon" onClick={() => { setShowEditClassPopup(true); }}>Editar</div> }
        </div>
        <div className={isHeaderCollapsed ? "classDetailBodyOuterContainerExpanded" : "classDetailBodyOuterContainerShrunk"}>
            <ClassDetailBody classData={props.classData} />
        </div>
    </>
}

export default ClassDetailBodyWithHeader;