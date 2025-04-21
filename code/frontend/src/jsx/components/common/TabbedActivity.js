import { useContext, useState } from "react"
import { pointableSecondary, primary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";

const TabbedActivity = (props) => {
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);
    const theme = useContext(ThemeContext);

    const firstTabOffset = () => {
        // When creating a new post inside a class, we let this component handle the selectedTabIndex
        // But when browsing files page, we let the selected tab to be chosen externally
        return `${-props.tabContentWidthPercentage * (props.forcedTabSelectedIndex ?? selectedTabIndex)}%`
    }

    const tabContentWidth = () => {
        return `${props.tabContentWidthPercentage}%`
    }

    return <div className="tabbedActivityOuterContainer">
        {/* When browsing files page, titles aren't shown */}
        {props.showTitles &&
            <div className="tabbedActivityHeader">
                {props.tabs.map((t, idx) => {
                    return <div className={`tabbedActivityHeaderItem pointable ${pointableSecondary(theme)} ${selectedTabIndex === idx ? primary(theme) : ""}`}
                        onClick={() => { setSelectedTabIndex(idx) }}>{t.title}</div>
                })}
            </div>}
        <div className="tabbedActivityContainer">
            {props.tabs.length > 0 ? <>
                { /* Here we display the first tab content and the rest of them
                   * separately. That's because we'll play with the first item
                   * offset (margin-left) to create the carousel effect */ }
                {<div className="tabbedActivityTabContent firstTab"
                    style={{ width: tabContentWidth(), marginLeft: firstTabOffset() }}>
                    {props.tabs[0].view}
                </div>}
                {props.tabs.slice(1).map(t => <div className="tabbedActivityTabContent" style={{ width: tabContentWidth() }}>{t.view}</div>)}
            </>
                : <></>
            }
        </div>
        {props.emptyFooter && /* Simple extra space at the bottom to allow the context menu of
                                 the last element to appear on screen without clipping 
                                 when this TabbedActivity is used for presenting Files */
            <div className="tabbedActivityFilesEmptyFooter"></div>}
    </div>
}

export default TabbedActivity;