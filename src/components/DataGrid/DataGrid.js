import React, { useEffect, useRef, useState } from 'react';
import styles from './DataGrid.module.scss';
import sortBy from 'lodash.sortby';
import filter from 'lodash.filter';
import forEach from 'lodash.foreach';
import { AiOutlineSearch, AiOutlineSortAscending, AiOutlineSortDescending } from 'react-icons/ai';
import { TiArrowUnsorted } from 'react-icons/ti';
import getColumnWidth from '../../utils/ColumnWidth';

const ASCENDING_SORT = 'ASC';
const DESCENDING_SORT = 'DESC';
const NO_SORT = 'NONE';

const FormattedCellValue = ({
    value,
    type
}) => {
    if (type === 'email') {
        return (<a className={styles.dataGrid__link} href={`mailto:${value}`}>{value}</a>);
    }
    return value;
};

const DataGridCell = ({
    data,
    field,
    columnWidths,
    type,
}) => {
    const textAlign = getTextAlignmentForCell(type);
    return (
        <div className={styles.dataGrid__cell} style={{
            width: `${columnWidths[field]}px`,
            textAlign,
        }}>
            <FormattedCellValue type={type} value={data[field] || '-'}/>
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
                            type={column.type}
                        />
                    )
                )
            }
        </div>
    );
};

const getTextAlignmentForColumn = (type) => {
    if (type === 'number') {
        return 'flex-end';
    }
    return 'flex-start';
};
const getTextAlignmentForCell = (type) => {
    if (type === 'number') {
        return 'right';
    }
    return 'left';
};

const DATA_GRID_LAST_ROW_ID = 'data-grid-last-row-id';

function DataGrid({
    options,
    data
}) {
    const {
        columns,
        loading,
        totalRows,
        setLoading,
    } = options;

    const [tableData, setTableData] = useState([]);
    const [sortKey, setSortKey] = useState('');
    const [sortingType, setSortingType] = useState(NO_SORT);

    const [searchTerm, setSearchTerm] = useState('');

    const observer = useRef(null);

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0
    };

    const [columnWidths, setColumnWidths] = useState({});

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
    }, [data.length]);

    const handleSort = (column) => {
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
    };

    const handleObserver = (entries) => {
        const target = entries[0];
        if (target.isIntersecting && searchTerm === '' && !loading) {
            setLoading(true);
        }
    };

    const getSortedData = (rawData) => {
        if (sortKey) {
            if (sortingType === ASCENDING_SORT) {
                return sortBy(rawData, sortKey);
            } else {
                return sortBy(rawData, sortKey)
                    .reverse();
            }
        }
        return rawData;
    };

    const getFilteredData = (rawData) => {
        if (observer.current) {
            observer.current.disconnect();
        }
        observer.current = new IntersectionObserver(handleObserver, observerOptions);
        const term = searchTerm;

        if (term) {
            return filter(rawData, (item) => {
                let isMatch = false;
                forEach(item, (value) => {
                    if (String(value)
                        .toLowerCase()
                        .includes(term.toLowerCase())) {
                        isMatch = true;
                    }
                });
                return isMatch;
            });
        }
        return rawData;
    };

    useEffect(() => {
        if (data.length) {
            const filteredData = getFilteredData(data);
            const sortedData = getSortedData(filteredData);
            setTableData(sortedData);
        }

    }, [data.length, sortKey, sortingType, searchTerm]);

    useEffect(() => {
        if (observer.current) {
            observer.current.disconnect();
        }
        observer.current = new IntersectionObserver(handleObserver, observerOptions);

        if (tableData.length > 0) {
            observer.current.observe(document.querySelector(`#${DATA_GRID_LAST_ROW_ID}`));
        }
        return () => observer.current.disconnect();

    }, [tableData.length]);

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
                                justifyContent: getTextAlignmentForColumn(column.type)
                            }}
                            onClick={() => handleSort(column)}
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
                    {
                        tableData.map((row, index) =>
                            (
                                <React.Fragment key={`row-${index}`}>
                                    <DataGridRow
                                        row={row}
                                        rIndex={index}
                                        columns={columns}
                                        columnWidths={columnWidths}
                                    />
                                </React.Fragment>
                            ))
                    }
                    {
                        tableData.length
                            ? (
                                <div
                                    className={styles.dataGrid__lastRow}
                                    id={DATA_GRID_LAST_ROW_ID}
                                    key={'last-row'}
                                >
                                    <DataGridRow
                                        row={tableData[0]}
                                        columns={columns}
                                        columnWidths={columnWidths}
                                    />
                                </div>
                            ) : null
                    }
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
