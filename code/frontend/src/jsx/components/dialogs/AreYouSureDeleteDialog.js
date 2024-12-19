import LoadingHUD from "../common/LoadingHUD";

const AreYouSureDeleteDialog = (props) => {
    return <div className="popupOverlayBackground" onClick={props.onDismiss}>
    <div className="popup" onClick={e => { e.stopPropagation(); }}>
        <div className="card dialogBackground">
            <div className="card areYouSureOption" onClick={props.onDismiss}>No</div>
            <div className="card areYouSureOption areYouSureOptionDestructive" onClick={props.onActionConfirmed}>🗑️ Sí</div>
            {props.isLoading && <div className="dialogHUDCentered"><LoadingHUD /></div>}
        </div>
    </div>
</div>
}

export default AreYouSureDeleteDialog;