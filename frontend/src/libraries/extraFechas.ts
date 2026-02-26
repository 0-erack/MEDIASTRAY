const timestampAInputDate = (timestamp) => {
    if (typeof timestamp !== "string" && typeof timestamp !== "number") return "";
    const date = new Date(Number(timestamp));
    const year = String(date.getFullYear()).padStart(4, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const timestampAFecha = (timestamp) => {
    //if (typeof timestamp !== "string" && typeof timestamp !== "number") return "";
    return new Date(Number(timestamp)).toLocaleDateString();
}

export { timestampAInputDate, timestampAFecha }