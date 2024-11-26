import { useContext, useEffect, useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import EduAPIFetch from "../../../client/EduAPIFetch";
import { FeedbackContext } from "../../main/GlobalContainer";
import UserCard from "../common/UserCard";

const AddParticipantToClassDialog = (props) => {
    const NUM_CHARS_TO_LOAD_SUGGESTIONS = 3;
    const [formUsername, setFormUsername] = useState("");
    const [isLoadingSubmit, setLoadingSubmit] = useState(false);
    const [isLoadingSearch, setLoadingSearch] = useState(false);
    const [serverSuggestedUsers, setServerSuggestedUsers] = useState([]);
    const [lastSuccessfulSearch, setLastSuccessfulSearch] = useState();
    const setFeedback = useContext(FeedbackContext);
    
    const onSubmitAddUser = (event) => {
        event.preventDefault();
        const options = {
            method: "PUT",
            body: JSON.stringify({
                username: formUsername
            }),
            credentials: "include"
        };
        setLoadingSubmit(true);
        EduAPIFetch(`/api/v1/classes/${props.classId}/users`, options)
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
                const options = {
                    method: "GET",
                    credentials: "include"
                };
                setLoadingSearch(true);
                EduAPIFetch(`/api/v1/users?search=${search}`, options)
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
        const clientText = lastFormUsernameTyped()
        return serverSuggestedUsers.filter(u => {
            return u.username.toLowerCase().includes(clientText.toLowerCase()) || u.name.toLowerCase().includes(clientText.toLowerCase()) || u.surname.toLowerCase().includes(clientText.toLowerCase())
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
                // FIX-ME: Find a more efficient way of doing this
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

    return props.show === true ? <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">Añadir usuario a {props.classroomName}</div>
                <form onSubmit={onSubmitAddUser}>
                    <div className="formInput">
                        <input type="text" value={formUsername}
                            onChange={e => { setFormUsername(e.target.value) }}
                            onFocus={e => { e.target.placeholder = "pepe.depura"; }}
                            onBlur={e => { e.target.placeholder = ""; }}
                            required />
                        <div className="underline"></div>
                        <label htmlFor="">Nombre de usuario</label>
                    </div>
                    <div className="hint">Puedes añadir más de un estudiante a la vez si los introduces en una lista separados por comas</div>
                    {isLoadingSearch && <div className="dialogHUDCentered"><LoadingHUD /></div>}
                    <div className="participantsSearchContainer">
                        {serverSuggestedUsers.length > 0 ? clientFilteredSuggestions().map(u => <UserCard user={u} onClickWithUsername={onSuggestionClicked}/>) : <></>}
                    </div>
                    <div className="formSubmit formSubmitNoMarginTop">
                        <input type="submit" value="Añadir" disabled={isLoadingSubmit} />
                    </div>
                    {isLoadingSubmit && <div className="dialogHUDCentered"><LoadingHUD /></div>}
                </form>
            </div>
        </div>
    </div> : <></>
}

export default AddParticipantToClassDialog;