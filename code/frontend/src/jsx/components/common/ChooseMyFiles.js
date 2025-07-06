import { useContext } from "react";
import { ThemeContext } from "../../main/GlobalContainer";
import { pointableSecondary, primary } from "../../../util/Themes";

const ChooseMyFiles = (props) => {
    const theme = useContext(ThemeContext);

    return <div className="chooseMyFilesContainer">
        También puedes <div className={`createOrEditPostFormRoundInnerButton pointable ${primary(theme)} ${pointableSecondary(theme)}`}
            onClick={() => { alert("TODO")}}>
            Seleccionar archivos de tu unidad
        </div>
    </div>
}

export default ChooseMyFiles;