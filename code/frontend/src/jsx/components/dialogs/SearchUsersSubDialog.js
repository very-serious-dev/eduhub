import { useContext, useEffect, useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import EduAPIFetch from "../../../client/EduAPIFetch";
import { FeedbackContext, ThemeContext } from "../../main/GlobalContainer";
import UserCard from "../common/UserCard";
import { accent, accentFormLabel, pointableSecondary, primary } from "../../../util/Themes";

const SearchUsersSubDialog = (props) => {
    const NUM_CHARS_TO_LOAD_SUGGESTIONS = 3;
    const [formUsername, setFormUsername] = useState("");
    const [isLoadingSubmit, setLoadingSubmit] = useState(false);
    const [isLoadingSearch, setLoadingSearch] = useState(false);
    const [serverSuggestedUsers, setServerSuggestedUsers] = useState([]);
    const [lastSuccessfulSearch, setLastSuccessfulSearch] = useState();
    const setFeedback = useContext(FeedbackContext);
    const theme = useContext(ThemeContext);

    const onSubmitAddUser = (event) => {
        event.preventDefault();
        setLoadingSubmit(true);
        EduAPIFetch("PUT", props.addUsersUrl, { username: formUsername })
            .then(json => {
                setLoadingSubmit(false);
                setFormUsername("");
                if (json.success === true) {
                    props.onUserAdded();
                } else if (json.partial_success === true) {
                    props.onUserAdded(json.error);
                } else {
                    props.onUserAdded("Se ha producido un error");
                }
                props.onDismiss();
            })
            .catch(error => {
                setLoadingSubmit(false);
                setFormUsername("");
                props.onUserAdded(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }

    useEffect(() => {
        if (isLoadingSubmit) { return; }
        if (isLoadingSearch) { return; }
        const search = lastFormUsernameTyped()
        if (search.length >= NUM_CHARS_TO_LOAD_SUGGESTIONS) {
            const shouldNotHitServerBecauseAlreadyDidForASubstring = lastSuccessfulSearch !== undefined ? search.toLowerCase().includes(lastSuccessfulSearch.toLowerCase()) : false
            if (serverSuggestedUsers.length === 0 && !shouldNotHitServerBecauseAlreadyDidForASubstring) {
                // Must perform server-side search
                setLoadingSearch(true);
                EduAPIFetch("GET", `/api/v1/users?search=${search}`)
                    .then(json => {
                        setLoadingSearch(false);
                        setLastSuccessfulSearch(search);
                        setServerSuggestedUsers(json.users);
                    })
                    .catch(error => {
                        setLoadingSearch(false);
                        setLastSuccessfulSearch();
                        setFeedback({ type: "info", message: "Hubo un error cargando sugerencias" });
                    })
            }
        } else {
            setServerSuggestedUsers([]);
            setLastSuccessfulSearch();
        }
    }, [formUsername])

    const lastFormUsernameTyped = () => {
        const maybeVariousUsernames = formUsername.split(",");
        return maybeVariousUsernames[maybeVariousUsernames.length - 1].trim()
    }

    /**
     * We perform a server-side users search for suggestions when the client has typed more
     * than NUM_CHARS_TO_LOAD_SUGGESTIONS. After those suggestions are loaded, we don't
     * load more as the user types. We narrow the suggestions with a client-side filter.
     * 
     * Server side suggestions are cleared if the client removes characters (< NUM_CHARS_TO_LOAD_SUGGESTIONS)
     */
    const clientFilteredSuggestions = () => {
        // TODO: Expand usage of props.usersToIgnore so that in:
        // - ClassParticipantsDialog: Autocomplete users that already belong to a class are filtered out
        // - FilePermissionsDialog: Autocomplete users that already have permission to a file are filtered out
        //    (right now, the logged in user itself is already filtered out)
        const clientText = lastFormUsernameTyped()
        return serverSuggestedUsers.filter(u => {
            return u.username.toLowerCase().includes(clientText.toLowerCase()) || u.name.toLowerCase().includes(clientText.toLowerCase()) || u.surname.toLowerCase().includes(clientText.toLowerCase())
        }).filter(u => {
            return !props.usersToIgnore.includes(u.username)
        })
    }

    const onSuggestionClicked = (username) => {
        if (formUsername.includes(",")) {
            // If user typed test1,test2,tes and then clicked
            // on test3 suggestion, we want to produce a
            // test1,test2,test3 string
            let resultFormUsername = "";
            const variousUsernames = formUsername.split(",");
            for (let i = 0; i < variousUsernames.length - 1; i++) {
                // Here we iterate over every username and append it
                // to a final result, but discarding the last one
                // TODO: Find a more efficient way of doing this
                // (It's not really needed to re-split the string)
                resultFormUsername += variousUsernames[i] + ",";
            }
            resultFormUsername += username + ","; // And here we append the clicked suggestion
            setFormUsername(resultFormUsername);
        } else {
            setFormUsername(username + ",");
            // Note that the trailing comma aims to make it more user-friendly
            // to add several users
        }
    }

    return <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">{props.dialogTitle}</div>
                <form onSubmit={onSubmitAddUser}>
                    <div className="formInputContainer">
                        <input type="text" value={formUsername}
                            className={`formInput ${primary(theme)}`}
                            onChange={e => { setFormUsername(e.target.value) }}
                            onFocus={e => { e.target.placeholder = "pepe.depura"; }}
                            onBlur={e => { e.target.placeholder = ""; }}
                            required />
                        <div className={`underline ${accent(theme)}`} />
                        <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Nombre de usuario</label>
                    </div>
                    <div className="hint">Puedes añadir más de un usuario si los introduces en una lista separados por comas</div>
                    {isLoadingSearch && <div className="loadingHUDCentered"><LoadingHUD /></div>}
                    <div className="participantsSearchContainer">
                        {serverSuggestedUsers.length > 0 ? clientFilteredSuggestions().map(u => <UserCard user={u} onClickWithUsername={onSuggestionClicked} />) : <></>}
                    </div>
                    <div className="formInputContainer formSubmitNoMarginTop">
                        <input type="submit" className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`} value="Añadir" disabled={isLoadingSubmit} />
                    </div>
                    {isLoadingSubmit && <div className="loadingHUDCentered"><LoadingHUD /></div>}
                </form>
            </div>
        </div>
    </div>
}

export default SearchUsersSubDialog;