import { useState } from "react"

const TabbedActivity = (props) => {
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);

    const firstTabOffset = () => {
        return `${-props.tabContentWidthPercentage * selectedTabIndex}%`
    }

    const tabContentWidth = () => {
        return `${props.tabContentWidthPercentage}%`
    }

    return <div className="tabbedActivityOuterContainer">
        {props.showTitles &&
            <div className="tabbedActivityHeader">
                {props.tabs.map((t, idx) => {
                    return <div className={`tabbedActivityHeaderItem${selectedTabIndex === idx ? " tabHeaderItemActive" : ""}`}
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
    </div>
}

export default TabbedActivity;