const GetRolesFromCookie = () => {
    let result = [];
    for (let cookie of document.cookie.split(";")) {
        let keyValueArr = cookie.trim().split("=")
        if (keyValueArr[0] === "UserRoles") {
            for (let value of keyValueArr[1].split("-")) {
                result.push(value);
            }
        }
    }
    return result;
}

export default GetRolesFromCookie;