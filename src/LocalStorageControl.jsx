function saveInLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getFromLocalStorage(key) {
    const value = localStorage.getItem(key);
    if (key === "duration") {
        return value ? JSON.parse(value) : 30; // default duration is 30 seconds
    }
    return value ? JSON.parse(value) : 1;
}

export { saveInLocalStorage, getFromLocalStorage };