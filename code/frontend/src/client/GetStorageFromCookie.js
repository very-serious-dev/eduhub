const GetStorageFromCookie = () => {
    let result = { folders: 0, documents: 0, bytes: 0 };
    for (let cookie of document.cookie.split(";")) {
        let keyValueArr = cookie.trim().split("=")
        if (keyValueArr[0] === "MaxStorage") {
            const foldersDocsBytesValue = keyValueArr[1].split("-")
            result.folders = foldersDocsBytesValue[0]
            result.documents = foldersDocsBytesValue[1]
            result.bytes = foldersDocsBytesValue[2]
        }
    }
    return result;
}

export default GetStorageFromCookie;