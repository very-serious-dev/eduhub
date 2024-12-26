const sizeToHumanReadable = (size) => { // https://stackoverflow.com/a/63032680
    const fileSize = size.toString();
    if (fileSize.length < 7) {
        return `${Math.round(+fileSize / 1024).toFixed(2)}kb`
    }
    return `${(Math.round(+fileSize / 1024) / 1000).toFixed(2)}MB`
}

const beautifullyDisplayDateHour = (date) => {
    const dateObject = new Date(date);
    return `${('0' + dateObject.getHours()).slice(-2)}:${('0' + dateObject.getMinutes()).slice(-2)}`;
}

const footNoteForDateAndAuthor = (date, author) => {
    const dateObject = new Date(date);
    return `${author}, ${dateObject.toLocaleDateString()} (${beautifullyDisplayDateHour(date)})`
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
        }
    }

    const dateObject = new Date(date);
    return `${getWeekDayLiteral(dateObject.getDay())}, ${dateObject.getDate()} de ${getMonthLiteral(dateObject.getMonth())}`;
}

const formatNullableDueDate = (dueDate) => {
    if (dueDate === undefined || dueDate === null) {
        return "Fecha sin definir"
    }
    return beautifullyDisplayDate(dueDate);
}

export { sizeToHumanReadable };
export { footNoteForDateAndAuthor };
export { beautifullyDisplayDate };
export { beautifullyDisplayDateHour };
export { formatNullableDueDate };
