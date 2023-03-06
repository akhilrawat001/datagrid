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
        // can be changed to const
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
    // these are added for icons and some extra space
    return width + 48 + 30;
};
export default getColumnWidth;
