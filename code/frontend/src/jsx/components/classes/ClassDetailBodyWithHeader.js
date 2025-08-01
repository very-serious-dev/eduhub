import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ClassDetailBody from "./ClassDetailBody";
import EditClassDialog from "../dialogs/EditClassDialog";
import { FeedbackContext, ThemeContext } from "../../main/GlobalContainer";
import { accent, bannerImageSrc, pointableSecondary } from "../../../util/Themes";
import { useIsMobile } from "../../../util/Responsive";
import ClassInfoDialog from "../dialogs/ClassInfoDialog";

const ClassDetailBodyWithHeader = (props) => {
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, EDIT_CLASS, CLASS_INFO
    const [amountScrolled, setAmountScrolled] = useState(0);
    const [searchedText, setSearchedText] = useState("");
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const setFeedback = useContext(FeedbackContext);
    const theme = useContext(ThemeContext);
    const EXPANDED_HEADER_HEIGHT = 200;
    const COLLAPSED_HEADER_HEIGHT = isMobile ? 120 : 60;

    useEffect(() => {
        const handleScroll = (e) => {
            setAmountScrolled(e.target.scrollingElement.scrollTop);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const onClassEdited = (errorMessage) => {
        if (errorMessage === undefined) {
            setFeedback({ type: "success", message: "Clase modificada con éxito" });
            props.onShouldRefresh();
        } else {
            setFeedback({ type: "error", message: errorMessage });
        }
    }

    const onClassDeleted = (errorMessage) => {
        if (errorMessage === undefined) {
            setFeedback({ type: "success", message: "Clase eliminada con éxito" });
            navigate("/");
        } else {
            setFeedback({ type: "error", message: errorMessage });
        }
    }

    const headerHeight = () => {
        return Math.min(EXPANDED_HEADER_HEIGHT, Math.max(EXPANDED_HEADER_HEIGHT - amountScrolled, COLLAPSED_HEADER_HEIGHT));
    }

    return <>
        {popupShown === "EDIT_CLASS" &&
            <EditClassDialog name={props.classData.name}
                onDismiss={() => { setPopupShown("NONE"); }}
                onClassEdited={onClassEdited}
                onClassDeleted={onClassDeleted}
                shouldShowEvaluationCriteria={true}
                evaluationCriteria={props.classData.evaluation_criteria}
                classId={props.classData.id} />}
        {popupShown === "CLASS_INFO" &&
            <ClassInfoDialog name={props.classData.name}
                groupTag={props.classData.group_tag}
                evaluationCriteria={props.classData.evaluation_criteria}
                onDismiss={() => { setPopupShown("NONE") }} />}
        <div className="classDetailHeader" style={{ height: headerHeight() }}>
            <img className="classDetailHeaderImage" src={bannerImageSrc(theme)} />
            <div className="classDetailHeaderTitleSearchContainer">
                <div className="classDetailHeaderTitle">{props.classData.name}</div>
                <form className="classDetailHeaderSearchForm" onSubmit={(e) => { e.preventDefault(); }}>
                    <input type="text"
                        placeholder="🔎 Buscar..."
                        value={searchedText}
                        onChange={e => { setSearchedText(e.target.value); }}
                        required />
                    <div className={`underline ${accent(theme)}`} />
                </form>
            </div>
            <div className="classDetailHeaderTopIcons">
                {props.classData.should_show_teacher_options === true &&
                    <div className={`classDetailHeaderIcon pointable ${pointableSecondary(theme)}`} onClick={() => { setPopupShown("EDIT_CLASS"); }}>⚙️</div>}
                <div className={`classDetailHeaderIcon pointable ${pointableSecondary(theme)}`} onClick={() => { setPopupShown("CLASS_INFO") }}>📋</div>
                <div className={`classDetailHeaderIcon pointable ${pointableSecondary(theme)}`} onClick={() => { navigate(-1); }}>✖️</div>
            </div>
        </div>
        <div style={{ marginTop: EXPANDED_HEADER_HEIGHT }}>
            <ClassDetailBody classData={props.classData}
                searchedText={searchedText}
                onFilterPostsByUnit={(unitName => { setSearchedText(unitName); })}
                onShouldRefresh={props.onShouldRefresh} />
        </div>
    </>
}

export default ClassDetailBodyWithHeader;