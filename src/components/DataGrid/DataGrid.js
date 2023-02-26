import React from 'react';
import styles from './DataGrid.module.scss';

const DataGridCell = ({
    data,
    field,
}) => {
    return (
        <div className={styles.dataGrid__cell}>
            {data[field] || '-'}
        </div>
    );
};
const DataGridRow = ({
    row,
    columns,
    rIndex
}) => {

    return (
        <div className={styles.dataGrid__row}>
            {columns.map((column, cIndex) => (
                <DataGridCell
                    data={row}
                    field={column.field}
                    key={`cell-${rIndex}-${cIndex}`}
                />
            )
            )}
        </div>
    );
};

function DataGrid({
    options,
    data
}) {
    const { columns } = options;
    return (
        <div className={styles.dataGrid}>
            <div className={styles.dataGrid__header}>
                {columns.map(column => (
                    <div key={column.field} className={styles.dataGrid__headerCell}>
                        {column.headerName}
                    </div>
                ))}
            </div>
            <div className={styles.dataGrid__body}>
                {data.map((row, index) => <DataGridRow row={row} key={`row-${index}`} columns={columns}/>)}
            </div>
        </div>
    );

}

export default DataGrid;
