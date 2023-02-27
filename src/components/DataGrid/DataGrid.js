import React, { useEffect, useState } from 'react';
import styles from './DataGrid.module.scss';
import sortBy from 'lodash.sortby';
import filter from 'lodash.filter';
import forEach from 'lodash.foreach';
import { AiOutlineSearch, AiOutlineSortAscending, AiOutlineSortDescending } from 'react-icons/ai';
import { TiArrowUnsorted } from 'react-icons/ti';

const ASCENDING_SORT = 'ASC';
const DESCENDING_SORT = 'DESC';
const NO_SORT = 'NONE';

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
}) => {
    return (
        <div className={styles.dataGrid__row}>
            {
                columns.map(
                    (column, cIndex) => (
                        <DataGridCell
                            data={row}
                            field={column.field}
                            key={`cell-${rIndex}-${cIndex}`}
                            columnWidths={columnWidths}
                        />
                    )
                )
            }
        </div>
    );
};

function DataGrid({
    options,
    data
}) {
    const {
        columns,
        loading,
        totalRows,
        columnWidths,
        lastRowRef,
        searchTerm,
        setSearchTerm,
    } = options;
    const [sortedData, setSortedData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [sortKey, setSortKey] = useState('');
    const [sortingType, setSortingType] = useState(NO_SORT);

    useEffect(() => {
        if (sortKey) {
            if (sortingType === ASCENDING_SORT) {
                setSortedData(sortBy(data, sortKey));
            } else {
                setSortedData(sortBy(data, sortKey)
                    .reverse());
            }
        } else {
            setSortedData(data);
        }
    }, [data.length, sortKey, sortingType]);

    useEffect(() => {
        if (searchTerm) {
            const filtered = filter(sortedData, (item) => {
                let isMatch = false;
                forEach(item, (value) => {
                    if (String(value)
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())) {
                        isMatch = true;
                    }
                });
                return isMatch;
            });
            setTableData(filtered);
        } else {
            setTableData(sortedData);
        }
    }, [searchTerm, JSON.stringify(sortedData)]);

    return (
        <>
            <div className={styles.dataGrid}>
                <div className={styles.dataGrid__header}>
                    {columns.map(column => (
                        <div
                            key={column.field}
                            className={styles.dataGrid__headerCell}
                            style={{
                                width: `${columnWidths[column.field]}px`,
                            }}
                            onClick={
                                () => {
                                    if (sortKey === column.field) {
                                        switch (sortingType) {
                                        case ASCENDING_SORT:
                                            setSortingType(DESCENDING_SORT);
                                            break;
                                        case DESCENDING_SORT:
                                            setSortingType(NO_SORT);
                                            setSortKey('');
                                            break;
                                        default:
                                            setSortingType(ASCENDING_SORT);
                                            setSortKey(column.field);
                                            break;
                                        }
                                    } else {
                                        setSortingType(ASCENDING_SORT);
                                        setSortKey(column.field);
                                    }
                                }}
                        >
                            {column.name}
                            <span className={styles.dataGrid__sortContainer}>
                                {
                                    sortKey === column.field
                                        ? (
                                            sortingType === ASCENDING_SORT
                                                ? <AiOutlineSortAscending/>
                                                : <AiOutlineSortDescending/>
                                        )
                                        : <TiArrowUnsorted/>
                                }
                            </span>
                        </div>
                    ))}
                </div>
                <div className={loading ? `${styles.dataGrid__body} ${styles.loading}` : styles.dataGrid__body}>
                    {tableData.map((row, index) =>
                        (
                            <DataGridRow
                                row={row}
                                key={`row-${index}`}
                                columns={columns}
                                columnWidths={columnWidths}
                            />
                        ))}
                    <div ref={lastRowRef} className={styles.dataGrid__lastRow}>
                        <DataGridRow
                            row={tableData[0] || {}}
                            key={'last-row'}
                            columns={columns}
                            columnWidths={columnWidths}
                        />
                    </div>
                </div>
            </div>
            <div className={styles.dataGrid__footer}>
                <div className={styles.searchContainer}>
                    <AiOutlineSearch className={styles.icon}/>
                    <input
                        className={styles.search}
                        placeholder={'Search'}
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                </div>
                <div className={styles.paginationInfo}>
                    {tableData.length}
                    {' '}
					of
                    {' '}
                    {totalRows}
                </div>
            </div>
        </>
    );
}

export default DataGrid;
