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
            // FIX-ME: Find better and smoother collapsing behaviour
            // This works wrong if there are no entries and you scroll down
            // with right pane populated (several units [temas])
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
        <div className={`classDetailHeader ${isHeaderCollapsed ? "cdhCollapsed" : "cdhExpanded"}`}
            style={isHeaderCollapsed ? { backgroundColor: props.classData.color }: {}}>
            <img className={`classDetailHeaderImage ${isHeaderCollapsed ? "cdhImgCollapsed" : "cdhImgExpanded"}`} src="/header.jpg" />
            <div className={`classDetailHeaderTitle ${isHeaderCollapsed ? "cdhTitleCollapsed" : "cdhTitleExpanded"}`}>{props.classData.name}</div>
            <div className="classDetailHeaderCloseIcon" onClick={() => { navigate(-1);}}>✖</div>
            { props.classData.should_show_edit_button === true && 
              <div className="classDetailHeaderEditIcon" onClick={() => { setShowEditClassPopup(true); }}>Editar</div> }
        </div>
        <div className={isHeaderCollapsed ? "classDetailBodyOuterContainerExpanded" : "classDetailBodyOuterContainerShrunk"}>
            <ClassDetailBody classData={props.classData} onShouldRefresh={props.onShouldRefresh}/>
        </div>
    </>
}

export default ClassDetailBodyWithHeader;