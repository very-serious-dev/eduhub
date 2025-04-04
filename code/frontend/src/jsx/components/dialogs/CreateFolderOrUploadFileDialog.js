const CreateFolderOrUploadFileDialog = (props) => {
    return props.show === true ? <div className="popupOverlayBackground" onClick={props.onDismiss}>
    <div className="popup" onClick={e => { e.stopPropagation(); }}>
        <div className="card dialogBackground">
            <div className="card twoOptionsDialogChoice" onClick={() => { props.onCreateFolderClicked() }}>📁 Crear carpeta</div>
            <div className="card twoOptionsDialogChoice" onClick={() => { props.onUploadDocumentsClicked() }}>📄 Subir documentos</div>
        </div>
    </div>
</div> : <></>
}

export default CreateFolderOrUploadFileDialog;