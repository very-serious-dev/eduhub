import { useState } from "react"

const TabbedActivity = (props) => {
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);

    return <div className="tabbedActivityOuterContainer">
        <div className="tabbedActivityHeader">
            {props.tabs.map((t, idx) => {
                return <div className={`tabbedActivityHeaderItem${selectedTabIndex === idx ? " tabHeaderItemActive" : ""}`}
                            onClick={() => {setSelectedTabIndex(idx)}}>{t.title}</div>
            })}
        </div>
        <div className="tabbedActivityContainer">
            {props.tabs.length > 0 ? <>
                { /* Here we display the first tab content and the rest of them
                   * separately. That's because we'll play with the first item
                   * offset (margin-left) to create the carousel effect */ }
                { <div className={`tabbedActivityTabContent firstTab tabSelectedIs${selectedTabIndex}`}>{props.tabs[0].view}</div> }
                { props.tabs.slice(1).map(t => { return <div className={"tabbedActivityTabContent"}>{t.view}</div> }) }
            </>
        : <></>
        }
        </div>
    </div>
}

export default TabbedActivity;