import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../main/GlobalContainer";
import { pointableSecondary, primary } from "../../../util/Themes";
import AreYouSureDialog from "./AreYouSureDialog";
import { EduAPIFetch } from "../../../client/APIFetch";

const ArchiveGroupDialog = (props) => {
    const theme = useContext(ThemeContext);
    const [formActionType, setFormActionType] = useState() // archive, transfer
    const [formTransferGroupId, setFormTransferGroupId] = useState(props.allGroups[0].id);
    const [showAreYouSure, setShowAreYouSure] = useState(false);
    const [isLoading, setLoading] = useState(false);

    const hintText = () => {
        if (formActionType) {
            return formActionType === "transfer" ? <>Si aún no has creado el nuevo grupo para el próximo curso, debes hacerlo primero.<br />No olvides mover a los repetidores su nuevo grupo correcto, antes o después de llevar a cabo esta acción</> : `Antes de archivar definitivamente a todos los estudiantes de ${props.group.tag}, asegúrate de haber movido a los repetidores a un nuevo grupo para el próximo año`;
        }
    }

    const areYouSureMessage = () => {
        const firstParagraph = "¿Deseas proceder? El grupo y las clases vinculadas dejarán de ser accesibles. Para restablecerlas deberás contactar con un administrador.";
        return <>{firstParagraph} {formActionType === "transfer" ? "Además, los estudiantes se transferirán al grupo que has especificado" : "Los estudiantes vinculados también serán archivados y no podrán acceder a sus cuentas"}</>
    }

    const onActionConfirmed = () => {
        if (isLoading) { return; }
        setLoading(true);
        const body = {}
        if (formActionType === "transfer") {
            body['new_group_id_for_students'] = formTransferGroupId;
        }
        EduAPIFetch("POST", `/api/v1/admin/groups/${props.group.id}`, body)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    props.onGroupArchived();
                } else {
                    props.onGroupArchived("Se ha producido un error");
                    props.onDismiss();
                }
            })
            .catch(error => {
                setLoading(false);
                props.onGroupArchived(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }

    return showAreYouSure ?
        <AreYouSureDialog onActionConfirmed={onActionConfirmed}
            onDismiss={() => { setShowAreYouSure(false) }}
            isLoading={isLoading}
            dialogMode="CONTINUE"
            warningMessage={areYouSureMessage()} />
        : <div className="popupOverlayBackground" onClick={props.onDismiss}>
            <div className="popup" onClick={e => { e.stopPropagation(); }}>
                <div className="card dialogBackground">
                    <div className="dialogTitle">Archivar {props.group.tag} ({props.group.year})</div>
                    <div className="classInfoDialogContent">Se va a archivar el grupo {props.group.name} ({props.group.year}) y todas las clases vinculadas. Los usuarios ya no podrán acceder a ellas.</div>
                    <div className="classInfoDialogContent"><b>Los estudiantes de {props.group.name} ({props.group.year}) deben ser...</b></div>
                    <form onSubmit={(e) => { e.preventDefault(); setShowAreYouSure(true) }}>
                        <div className="formInputRadio">
                            <input type="radio" name="actionType" value="archive"
                                onChange={e => { setFormActionType(e.target.value); }}
                                required />
                            <label htmlFor="">...archivados (finalizan sus estudios)</label>
                        </div>
                        <div className="formInputRadio">
                            <input type="radio" name="actionType" value="transfer"
                                onChange={e => { setFormActionType(e.target.value); }}
                                required />
                            <label htmlFor="">...transferidos a otro grupo nuevo (avanzan de curso)</label>
                        </div>
                        <div className={"formInputSelectContainer selectWithTopMargin addUserSelect" + (formActionType === undefined || formActionType === "archive" ? " formInputSelectHidden" : "")}>
                            <select name="studentGroup"
                                value={formTransferGroupId}
                                className={`formInputSelect ${primary(theme)}`}
                                onChange={e => { setFormTransferGroupId(e.target.value); }}>
                                {props.allGroups.map(g => {
                                    return <option value={g.id} disabled={g.id === props.group.id}>{g.tag} ({g.year})</option>
                                })}
                            </select>
                        </div>
                        <div className="hint">{hintText()}</div>
                        <div className="formInputContainer">
                            <input type="submit" className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`} value="Proceder" disabled={(formActionType === undefined) || ((formActionType === "transfer") && (formTransferGroupId === props.group.id))} />
                        </div>
                    </form>
                </div>
            </div>
        </div>

}

export default ArchiveGroupDialog;