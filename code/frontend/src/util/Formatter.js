const sizeToHumanReadable = (size) => { // https://stackoverflow.com/a/63032680
    const fileSize = size.toString();
    if (fileSize.length < 7) {
        return `${Math.round(+fileSize / 1024).toFixed(2)}kb`
    }
    return `${(Math.round(+fileSize / 1024) / 1000).toFixed(2)}MB`
}

const beautifullyDisplayHourFromDate = (date) => {
    const dateObject = new Date(date);
    return `${('0' + dateObject.getHours()).slice(-2)}:${('0' + dateObject.getMinutes()).slice(-2)}`;
}

const footNoteDateAuthor = (originalDate, author, modificationDate) => {
    if (modificationDate) {
        const modificationDateObject = new Date(modificationDate);
        return `${author ? `${author}, ` : ""}${modificationDateObject.toLocaleDateString()} (${beautifullyDisplayHourFromDate(modificationDateObject)}) [modificado]`
    } else {
        const dateObject = new Date(originalDate);
        return `${author ? `${author}, ` : ""}${dateObject.toLocaleDateString()} (${beautifullyDisplayHourFromDate(originalDate)})`
    }
}

const beautifullyDisplayDate = (date) => {
    const getWeekDayLiteral = (day) => {
        switch (day) {
            case 0: return "Domingo";
            case 1: return "Lunes";
            case 2: return "Martes";
            case 3: return "Miércoles";
            case 4: return "Jueves";
            case 5: return "Viernes";
            case 6: return "Sábado";
            default: return "";
        }
    }

    const getMonthLiteral = (month) => {
        switch (month) {
            case 0: return "Enero";
            case 1: return "Febrero";
            case 2: return "Marzo";
            case 3: return "Abril";
            case 4: return "Mayo";
            case 5: return "Junio";
            case 6: return "Julio";
            case 7: return "Agosto";
            case 8: return "Septiembre";
            case 9: return "Octubre";
            case 10: return "Noviembre";
            case 11: return "Diciembre"
            default: return "";
        }
    }

    const dateObject = new Date(date);
    return `${getWeekDayLiteral(dateObject.getDay())}, ${dateObject.getDate()} de ${getMonthLiteral(dateObject.getMonth())}`;
}

const beautifullyDisplayDateTime = (date) => {
    return `${beautifullyDisplayDate(date)} (${beautifullyDisplayHourFromDate(date)})`
}

const formatPseudoMarkdown = (wholeText) => {
    const FormatType = { BOLD: "b", ITALIC: "i" , HYPERLINK: "h"}

    const formatText = (string, regex, formatType) => {
        let result = [];
        let remainingString = string;
        for (let match of string.matchAll(regex)) {
            const splitString = remainingString.split(match[0]);
            result.push(splitString[0]);
            if (formatType === FormatType.BOLD) {
                result.push(<b>{match[1]}</b>);
            }
            if (formatType === FormatType.ITALIC) {
                result.push(<i>{match[1]}</i>);
            }
            if (formatType === FormatType.HYPERLINK) {
                const linkWithPrefix = match[0].startsWith('http') ? match[0] : 'https://' + match[0];
                result.push(<a href={linkWithPrefix} target="_blank" rel="noreferrer">{match[0]}</a>) // Security note: https://mathiasbynens.github.io/rel-noopener
            }
            remainingString = splitString[1];
        }
        result.push(remainingString);
        return result;
    }

    const formatTextArray = (input, regex, formatType) => {
        let result = []
        for (let text of input) {
            if (typeof text === 'string') {
                const formattedText = formatText(text, regex, formatType);
                result.push(...formattedText);
            } else {
                // Already JSX, don't reprocess it
                // e.g.: We have <b>Great</b>, so let's preserve it
                result.push(text);
            }
        }
        return result;
    }

    const lines = wholeText.split('\n')
        .filter(line => line.length > 0)
        .map(line => [line])
        .map(lineArray => {
            // Format hyperlinks; https://regex101.com/r/3fYy3x/1
            return formatTextArray(lineArray, /(?:http[s]?:\/\/.)?(?:www\.)?[-a-zA-Z0-9@%._+~#=]{2,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_+.~#?&//=]*)/g, FormatType.HYPERLINK);
        }).map(lineArray => {
            // Bold: ["You _are_ *great*"] -> ["You _are_ ", <b>great</b>]
            return formatTextArray(lineArray, /\*(.*?)\*/g, FormatType.BOLD);
        }).map(lineArray => {
            // Italic: ["You _are_ ", <b>great</b>] -> ["You ", <i>are</i>, " ", <b>great</b>]
            return formatTextArray(lineArray, /_(.*?)_/g, FormatType.ITALIC);
        })

    const linesWithBRsAndULs = []
    let currentUnorderedListItems = []
    for (let lineArray of lines) {
        // This works by storing into currentUnorderedListItems all the
        // lines starting with '- ...' as <li>...</li>, and, after the next line
        // doesn't comply with that, it saves the whole bunch of <li> inside an <ul>
        // in a final result.
        // This also saves regular lines with a <br> at the end.
        if (typeof lineArray[0] === 'string' && lineArray[0].startsWith('- ')) {
            lineArray[0] = lineArray[0].slice(2);
            currentUnorderedListItems.push(<li>{lineArray}</li>);
        } else {
            if (currentUnorderedListItems.length > 0) { // A <ul> has ended, let's add it
                linesWithBRsAndULs.push(<ul>{currentUnorderedListItems}</ul>);
                currentUnorderedListItems = [];
            }
            linesWithBRsAndULs.push(<>{lineArray}<br /></>);
        }
    }
    if (currentUnorderedListItems.length > 0) {
        // If this happens, then the last line was a '- ...' and it was stored
        // inside currentUnorderedListItems but never dumped to linesWithBRsAndULs
        linesWithBRsAndULs.push(<ul>{currentUnorderedListItems}</ul>)
    }
    return linesWithBRsAndULs;
}

const documentIconImgSrc = (mimeType) => {
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/MIME_types/Common_types
    if (mimeType === "application/pdf") {
        return "/small/icon_pdf.png";
    } else if (mimeType.includes("video")) {
        return "/small/icon_vid.png";
    }
    if (mimeType.includes("image")) {
        return "/small/icon_img.png";
    } else if ((mimeType === "application/msword") ||
        (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
        (mimeType === "application/vnd.oasis.opendocument.text")) {
        return "/small/icon_doc.png";
    } else if ((mimeType === "application/vnd.ms-excel") ||
        (mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") ||
        (mimeType === "application/vnd.oasis.opendocument.spreadsheet")) {
        return "/small/icon_xls.png";
    } else {
        return "/small/icon_other.png";
    }
}

const iconImgSrc = (attachment) => {
    if (attachment.type === "document") {
        return documentIconImgSrc(attachment.mime_type);
    }
    if (attachment.type === "questionnaire") {
        return "/small/icon_checklist.png";
    }
}

export { sizeToHumanReadable };
export { footNoteDateAuthor };
export { beautifullyDisplayDate };
export { beautifullyDisplayDateTime };
export { formatPseudoMarkdown };
export { documentIconImgSrc };
export { iconImgSrc };