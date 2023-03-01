import React, { useEffect, useRef, useState } from 'react';
import styles from './DataGrid.module.scss';
import sortBy from 'lodash.sortby';
import filter from 'lodash.filter';
import forEach from 'lodash.foreach';
import { AiOutlineSearch, AiOutlineSortAscending, AiOutlineSortDescending } from 'react-icons/ai';
import { TiArrowUnsorted } from 'react-icons/ti';
import { BsPinAngleFill, BsPinFill } from 'react-icons/bs';
import getColumnWidth from '../../utils/ColumnWidth';
import { MdDarkMode, MdLightMode } from 'react-icons/md';

const ASCENDING_SORT = 'ASC';
const DESCENDING_SORT = 'DESC';
const NO_SORT = 'NONE';

const getDarkModeClass = (lightMode, darkMode, theme) => {
    if (theme === 'dark') {
        return `${lightMode} ${darkMode}`;
    }
    return lightMode;
};

const FormattedCellValue = ({
    value,
    type
}) => {
    if (type === 'email') {
        return (<a className={styles.dataGrid__link} href={`mailto:${value}`}>{value}</a>);
    }
    return value;
};

const DarkThemeSwitch = ({
    theme,
    setTheme
}) => {
    return (
        <div
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={styles.themeSwitch}
        >
            {
                theme === 'dark' ?
                    <MdLightMode/>
                    : <MdDarkMode/>
            }
        </div>);
};

const DataGridCell = ({
    data,
    field,
    columnWidths,
    type,
    pinnedColumns,
}) => {
    const textAlign = getTextAlignmentForCell(type);
    const isPinned = pinnedColumns.includes(field);
    const leftPosition = getLeftPositionForColumn(isPinned, pinnedColumns, field, columnWidths);
    const isLastPinnedItem = pinnedColumns.length
		&& ((pinnedColumns.indexOf(field) + 1) === pinnedColumns.length);

    return (
        <div
            className={isPinned
                ? `${styles.dataGrid__cell} ${styles.pinned}`
                : styles.dataGrid__cell
            }
            style={{
                width: `${columnWidths[field]}px`,
                textAlign,
                left: isPinned ? `${leftPosition}px` : 'unset',
                borderRight: isLastPinnedItem ? '1px solid' : 'none',
            }}
        >
            <FormattedCellValue type={type} value={data[field] || '-'}/>
        </div>
    );
};
const DataGridRow = ({
    row,
    columns,
    rIndex,
    columnWidths,
    pinnedColumns,
    rowWidth
}) => {
    return (
        <div
            className={styles.dataGrid__row}
            style={{ width: rowWidth }}
        >
            {
                columns.map(
                    (column, cIndex) => (
                        <DataGridCell
                            data={row}
                            field={column.field}
                            key={`cell-${rIndex}-${cIndex}`}
                            columnWidths={columnWidths}
                            type={column.type}
                            pinnedColumns={pinnedColumns}
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

function getLeftPositionForColumn(isPinned, pinnedColumns, field, columnWidths) {
    if (isPinned) {
        const index = pinnedColumns.indexOf(field);
        const pinnedElementsBeforeColumn = pinnedColumns.slice(0, index);
        if (pinnedElementsBeforeColumn.length) {
            return pinnedElementsBeforeColumn.reduce((accumulator, item) => {
                if (pinnedElementsBeforeColumn.includes(item)) {
                    return accumulator + columnWidths[item];
                }
                return accumulator;
            }, 0);
        }
    }
    return 0;
}

function DataGrid({
    options,
    data
}) {
    const {
        columns,
        loading,
        setLoading,
        rowsPerPage,
        setRowsPerPage,
        totalRows
    } = options;

    const [tableData, setTableData] = useState([]);
    const [sortKey, setSortKey] = useState('');
    const [sortingType, setSortingType] = useState(NO_SORT);
    const [pinnedColumns, setPinnedColumns] = useState([]);
    const [tableColumns, setTableColumns] = useState([]);
    const tableRef = useRef(null);
    const [rowWidth, setRowWidth] = useState('fit-content');

    const [searchTerm, setSearchTerm] = useState('');

    const [theme, setTheme] = useState('dark');

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

    const handlePin = (column) => {
        if (pinnedColumns.includes(column)) {
            setPinnedColumns((prevState) => {
                return prevState.filter((item) => item !== column);
            });
        } else {
            setPinnedColumns((prevState) => {
                return [...prevState, column];
            });
        }
    };

    const handleObserver = (entries) => {
        const target = entries[0];
        if (target.isIntersecting && searchTerm === '' && !loading && (totalRows - data.length) > 0) {
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

    }, [JSON.stringify(tableData)]);

    useEffect(() => {
        if (pinnedColumns.length) {
            setTableColumns(sortBy(columns, (item) => {
                const index = pinnedColumns.indexOf(item.field);
                return index !== -1 ? index : Infinity;
            }));
        } else {
            setTableColumns(columns);
        }
    }, [pinnedColumns, data.length]);

    useEffect(() => {
        const colSum = Object.keys(columnWidths)
            .reduce((accumulator, item) => {
                return accumulator + columnWidths[item];
            }, 0);

        if (colSum < tableRef?.current?.clientWidth) {
            setRowWidth('100%');
        } else {
            setRowWidth('fit-content');
        }
    }, [columnWidths]);

    return (
        <div className={getDarkModeClass(styles.dataGrid, styles.dark, theme)} ref={tableRef}>
            <div className={styles.dataGrid__table}>
                <div className={styles.dataGrid__header}>
                    <div className={styles.dataGrid__headerRow} style={{ width: rowWidth }}>
                        {tableColumns.map((column) => {
                            const isPinned = pinnedColumns.includes(column.field);
                            const leftPosition = getLeftPositionForColumn(isPinned, pinnedColumns, column.field, columnWidths);
                            const isLastPinnedItem = pinnedColumns.length && (
                                (pinnedColumns.indexOf(column.field) + 1) === pinnedColumns.length);
                            return (
                                <div
                                    key={column.field}
                                    className={isPinned
                                        ? `${styles.dataGrid__headerCell} ${styles.pinned}`
                                        : styles.dataGrid__headerCell
                                    }
                                    style={{
                                        width: `${columnWidths[column.field]}px`,
                                        justifyContent: getTextAlignmentForColumn(column.type),
                                        left: isPinned ? `${leftPosition}px` : 'unset',
                                        borderRight: isLastPinnedItem ? '1px solid' : 'none',
                                    }}
                                >
                                    {column.name}
                                    <span className={styles.dataGrid__sortContainer} onClick={() => handleSort(column)}>
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
                                    <span
                                        className={styles.dataGrid__pinContainer}
                                        onClick={() => handlePin(column.field)}
                                    >
                                        {
                                            isPinned ? <BsPinFill/> : <BsPinAngleFill/>
                                        }
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className={loading ? `${styles.dataGrid__body} ${styles.loading}` : styles.dataGrid__body}>
                    {

                        tableData.length === 0 ?
                            (
                                <p style={{ textAlign: 'center' }}>
                                    {
                                        searchTerm
                                            ? 'Searched value not found. Please clear search.'
                                            : 'Loading...'
                                    }
                                </p>
                            ) : null
                    }
                    {
                        tableData.map((row, index) =>
                            (
                                <DataGridRow
                                    key={`row-${index}`}
                                    row={row}
                                    rIndex={index}
                                    columns={tableColumns}
                                    columnWidths={columnWidths}
                                    pinnedColumns={pinnedColumns}
                                    rowWidth={rowWidth}
                                />
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
                                        rIndex={tableData.length}
                                        columns={tableColumns}
                                        columnWidths={columnWidths}
                                        pinnedColumns={pinnedColumns}
                                        rowWidth={rowWidth}
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
                <div className={styles.paginationContainer}>
                    <DarkThemeSwitch theme={theme} setTheme={setTheme}/>
                    <div className={styles.rowsPerPage}>
                        <span>Rows Per Page</span>
                        <select
                            value={String(rowsPerPage)}
                            onChange={(event) => setRowsPerPage(event.target.value)}>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div className={styles.paginationInfo}>
						Showing
                        {' '}
                        {tableData.length}
                        {' '}
						of
                        {' '}
                        {totalRows}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DataGrid;
