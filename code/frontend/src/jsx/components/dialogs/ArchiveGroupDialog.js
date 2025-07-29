import { useContext, useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import { ThemeContext } from "../../main/GlobalContainer";
import { pointableSecondary, primary } from "../../../util/Themes";

const ArchiveGroupDialog = (props) => {
    const theme = useContext(ThemeContext);
    const [formActionType, setFormActionType] = useState() // archive, transfer
    const [formTransferGroupId, setFormTransferGroupId] = useState();
    const [isLoading, setLoading] = useState(false);

    const hintText = () => {
        if (formActionType) {
            return formActionType === "transfer" ? <>Si aún no has creado el nuevo grupo para el próximo curso, debes hacerlo primero.<br/>No olvides mover a los repetidores su nuevo grupo correcto, antes o después de llevar a cabo esta acción</> : `Antes de archivar definitivamente a todos los estudiantes de ${props.group.tag}, asegúrate de haber movido a los repetidores a un nuevo grupo para el próximo año`;
        }
    }

    return <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">Archivar {props.group.tag} ({props.group.year})</div>
                <div className="classInfoDialogContent">Se va a archivar el grupo {props.group.name} ({props.group.year}) y todas las clases vinculadas. Los usuarios ya no podrán acceder a ellas.</div>
                <div className="classInfoDialogContent"><b>Los estudiantes de {props.group.name} ({props.group.year}) deben ser...</b></div>
                <form>
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
                            })
                            }
                        </select>
                    </div>
                    <div className="hint">{hintText()}</div>
                    <div className="formInputContainer">
                        <input type="submit" className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`} value="Proceder" disabled={formActionType === undefined} />
                    </div>
                    {isLoading && <div className="loadingHUDCentered"><LoadingHUD /></div>}
                </form>
            </div>
        </div>
    </div>

}

export default ArchiveGroupDialog;