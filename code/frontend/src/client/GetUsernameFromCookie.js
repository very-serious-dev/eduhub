const GetUsernameFromCookie = () => {
    for (let cookie of document.cookie.split(";")) {
        let keyValueArr = cookie.trim().split("=")
        if (keyValueArr[0] === "UserName") {
            return keyValueArr[1];
        }
    }
    return null;
}

export default GetUsernameFromCookie;