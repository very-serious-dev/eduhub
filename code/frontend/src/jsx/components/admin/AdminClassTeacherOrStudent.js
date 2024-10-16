const AdminClassTeacherOrStudent = (props) => {
    return props.show === true ? <div className="popupOverlayBackground" onClick={props.onDismiss}>
    <div className="popupForm" onClick={e => { e.stopPropagation(); }}>
        <div className="card dialogBackground">
            <div className="card adminAddTeacherOrStudent" onClick={() => { props.onTeacherClicked() }}>➕💼 Añadir docente</div>
            <div className="card adminAddTeacherOrStudent" onClick={() => { props.onStudentClicked() }}>➕🎓 Añadir estudiante</div>
        </div>
    </div>
</div> : <></>
}

export default AdminClassTeacherOrStudent;