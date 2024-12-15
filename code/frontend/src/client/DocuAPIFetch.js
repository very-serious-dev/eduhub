// TO-DO: Antipattern, copied from EduAPIFetch !!

import DocuURL from "./DocuURL";

const DocuAPIFetch = (httpMethod, urlPath, body) => {
    const options = {
        method: httpMethod,
        body: JSON.stringify(body),
        credentials: "include"
    };

    return fetch(DocuURL + urlPath, options).then(response => {
        return response.json().then(json => {
            return response.ok ? json : Promise.reject(json);
        });
    })
}

export default DocuAPIFetch;