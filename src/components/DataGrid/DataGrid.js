import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './DataGrid.module.scss';
import getColumnWidth from '../../utils/ColumnWidth';

const DataGridCell = ({
    data,
    field,
    columnWidths,
}) => {
    return (
        <div className={styles.dataGrid__cell} style={{ width: `${columnWidths[field]}px`, }}>
            {data[field] || '-'}
        </div>
    );
};
const DataGridRow = ({
    row,
    columns,
    rIndex,
    columnWidths,
    isLastRow,
    lastRowRef
}) => {
    return (
        <div className={styles.dataGrid__row} ref={isLastRow ? lastRowRef : null}>
            {columns.map((column, cIndex) => (
                <DataGridCell
                    data={row}
                    field={column.field}
                    key={`cell-${rIndex}-${cIndex}`}
                    columnWidths={columnWidths}
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
    const {
        columns,
        callAPI,
        loading,
    } = options;
    const [columnWidths, setColumnWidths] = useState({});
    const lastRow = useRef(null);

    useEffect(() => {
        for (let index in columns) {
            const column = columns[index];
            const field = column.field;
            const width = getColumnWidth(field, data, column.name);
            setColumnWidths((prevState) => {
                return {
                    ...prevState,
                    [field]: width
                };
            });
        }
    }, [JSON.stringify(options)]);

    const handleObserver = useCallback((entries) => {
        const target = entries[0];
        if (target.isIntersecting && data.length) {
            // Timeout to avoid flickering.
            setTimeout(() => {
                callAPI();
            }, 500);
        }
    }, [data.length]);

    useEffect(() => {
        const option = {
            root: null,
            rootMargin: '20px',
            threshold: 0,
        };
        const observer = new IntersectionObserver(handleObserver, option);
        if (lastRow.current) observer.observe(lastRow.current);
    }, [handleObserver]);

    return (
        <div className={styles.dataGrid}>
            <div className={styles.dataGrid__header}>
                {columns.map(column => (
                    <div
                        key={column.field}
                        className={styles.dataGrid__headerCell}
                        style={{
                            width: `${columnWidths[column.field]}px`,
                        }}
                    >
                        {column.name}
                    </div>
                ))}
            </div>
            <div className={loading ? `${styles.dataGrid__body} ${styles.loading}` : styles.dataGrid__body}>
                {data.map((row, index) =>
                    (
                        <DataGridRow
                            row={row}
                            key={`row-${index}`}
                            columns={columns}
                            columnWidths={columnWidths}
                            isLastRow={index === (data.length - 1)}
                            lastRowRef={lastRow}
                        />
                    ))}
            </div>
        </div>
    );
}

export default DataGrid;
