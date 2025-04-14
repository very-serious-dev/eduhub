const OptionsDialog = (props) => {
    return props.show === true ? <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                {props.options.map(option => {
                    return <div className="card optionsDialogChoice" onClick={option.onClick}>{option.label}</div>
                })}
            </div>
        </div>
    </div> : <></>
}

export default OptionsDialog;