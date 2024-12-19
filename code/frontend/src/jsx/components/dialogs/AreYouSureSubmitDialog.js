import LoadingHUD from "../common/LoadingHUD";

const AreYouSureSubmitDialog = (props) => {
    return <div className="popupOverlayBackground" onClick={props.onDismiss}>
    <div className="popup" onClick={e => { e.stopPropagation(); }}>
        <div className="card dialogBackground">
            <p>Tu entrega es definitiva y no se puede corregir. Asegúrate de revisar los documentos que entregues</p>
            <div className="card areYouSureOption" onClick={props.onGoBack}>Volver</div>
            <div className="card areYouSureOption areYouSureOptionDangerouslyConstructive" onClick={props.onActionConfirmed}>⬆️ Entregar</div>
            {props.isLoading && <div className="dialogHUDCentered"><LoadingHUD /></div>}
        </div>
    </div>
</div>
}

export default AreYouSureSubmitDialog;