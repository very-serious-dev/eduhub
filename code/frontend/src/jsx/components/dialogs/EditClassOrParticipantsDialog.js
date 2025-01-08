const EditClassOrParticipantsDialog = (props) => {
    return props.show === true ? <div className="popupOverlayBackground" onClick={props.onDismiss}>
    <div className="popup" onClick={e => { e.stopPropagation(); }}>
        <div className="card dialogBackground">
            <div className="card twoOptionsDialogChoice" onClick={() => { props.onEditClicked() }}>Editar</div>
            <div className="card twoOptionsDialogChoice" onClick={() => { props.onParticipantsClicked() }}>🎓 Participantes</div>
        </div>
    </div>
</div> : <></>
}

export default EditClassOrParticipantsDialog;