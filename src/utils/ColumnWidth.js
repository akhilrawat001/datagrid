// const ALL_POSSIBLE_CHARACTERS = 'abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890+-()^%$#@,./';
// const ALL_POSSIBLE_CHARACTERS = 'abcdefghijklmnopqrstuvwxyz';
const getStringWidth = (string) => {
    const span = document.createElement('span');
    span.style.position = 'absolute';
    span.style.opacity = '0';
    span.innerHTML = string;
    span.style.fontSize = '14px';
    document.body.appendChild(span);
    const width = span.offsetWidth;
    document.body.removeChild(span);
    return width;
};

const getLongestValueForAColumn = (column, data) => {
    let max = 0;
    let longestValue = '';
    for (let index in data) {
        const row = data[index];
        let value = String(row[column]);
        const cellLength = value.length;
        if (cellLength > max) {
            max = cellLength;
            longestValue = value;
        }
    }
    return longestValue;
};

const getColumnWidth = (column, data, header) => {
    const longestValue = getLongestValueForAColumn(column, data);
    const longestValueWidth = getStringWidth(longestValue);
    const headerWidth = getStringWidth(header);
    const width = Math.max(longestValueWidth, headerWidth);
    return width + 40 + 22;
};
export default getColumnWidth;
