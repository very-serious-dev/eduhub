const AdminClassAddTeacher = (props) => {
    return props.show === true ? <div className="popupOverlayBackground" onClick={props.onDismiss}>
    <div className="popupForm" onClick={e => { e.stopPropagation(); }}>
        <div className="card adminFormBackground">
            Under construction
        </div>
    </div>
</div> : <></>
}

export default AdminClassAddTeacher;