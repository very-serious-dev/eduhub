import { beautifullyDisplayDate, beautifullyDisplayDateHour } from "../../../util/Formatter";
import PostsBoardEntryFile from "../posts/PostsBoardEntryFile";

const AssignmentSubmitDialog = (props) => {
    return props.show === true ? <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">Detalles de la entrega</div>
                <div className="assignmentSubmitDialogAuthorFullName">{`Entrega de: ${props.author.name} ${props.author.surname}`}</div>
                <div className="assignmentSubmitDialogAuthorUsername">{`(${props.author.username})`}</div>
                {props.submit === undefined ?
                    <div>
                        <div className="assignmentSubmitDialogDate">Fecha de entrega: ❌ No entregado </div>
                    </div>
                    :
                    <>
                        <div className="assignmentSubmitDialogDate">{`Fecha de entrega: ✔️ ${beautifullyDisplayDate(props.submit.submit_date)} (${beautifullyDisplayDateHour(props.submit.submit_date)})`}</div>
                        <div className="assignmentSubmitDialogFilesTitle">Documentos entregados:</div>
                        <div>{props.submit.files.length > 0 ?
                            <div className="assignmentSubmitDialogFiles">
                                {props.submit.files.map(f => <PostsBoardEntryFile file={f} />)}
                            </div>
                            : <div className="assignmentSubmitDialogSectionContent">No se ha entregado ningún fichero</div>}
                        </div>
                        <div className="assignmentSubmitDialogCommentTitle">Comentario:</div>
                        <div className="assignmentSubmitDialogSectionContent">{props.submit.comment ?? "No se ha añadido ningún comentario"}</div>
                    </>}
            </div>
        </div>
    </div> : <></>
}

export default AssignmentSubmitDialog;