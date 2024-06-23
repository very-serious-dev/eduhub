import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClassDetailBody from "./ClassDetailBody";

const ClassDetailBodyWithHeader = (props) => {
    const [isHeaderCollapsed, setHeaderCollapsed] = useState(false);
    const navigate = useNavigate();

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

    const handleClose = () => {
        navigate("/");
    }

    return <>
        <div className={`classDetailHeader ${isHeaderCollapsed ? "cdhCollapsed" : "cdhExpanded"}`}>
            <img className={`classDetailHeaderImage ${isHeaderCollapsed ? "cdhImgCollapsed" : "cdhImgExpanded"}`} src="/class_header.png" />
            <div className={`classDetailHeaderTitle ${isHeaderCollapsed ? "cdhTitleCollapsed" : "cdhTitleExpanded"}`}>{props.classData.name}</div>
            <div className="classDetailHeaderCloseIcon" onClick={handleClose}>✖</div>
        </div>
        <div className={isHeaderCollapsed ? "classDetailBodyOuterContainerExpanded" : "classDetailBodyOuterContainerShrunk"}>
            <ClassDetailBody classData={props.classData} />
        </div>
    </>
}

export default ClassDetailBodyWithHeader;