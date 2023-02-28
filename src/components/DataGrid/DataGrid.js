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
        <div onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ cursor: 'pointer' }}>
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
        <div className={styles.dataGrid__cell} style={{
            width: `${columnWidths[field]}px`,
            textAlign,
            position: 'sticky',
            top: isPinned ? 0 : 'unset',
            left: isPinned ? `${leftPosition}px` : 'unset',
            zIndex: isPinned ? 1 : 'unset',
            borderRight: isLastPinnedItem ? '1px solid' : 'none',
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
    pinnedColumns,
}) => {
    return (
        <div
            className={styles.dataGrid__row}
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
        totalRows,
        setLoading,
    } = options;

    const [tableData, setTableData] = useState([]);
    const [sortKey, setSortKey] = useState('');
    const [sortingType, setSortingType] = useState(NO_SORT);
    const [pinnedColumns, setPinnedColumns] = useState([]);
    const [tableColumns, setTableColumns] = useState([]);

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

    console.log(pinnedColumns);

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

    return (
        <div className={getDarkModeClass(styles.dataGrid, styles.dark, theme)}>
            <div className={styles.dataGrid__table}>
                <div className={styles.dataGrid__header}>
                    <div className={styles.dataGrid__headerRow}>
                        {tableColumns.map((column) => {
                            const isPinned = pinnedColumns.includes(column.field);
                            const leftPosition = getLeftPositionForColumn(isPinned, pinnedColumns, column.field, columnWidths);
                            const isLastPinnedItem = pinnedColumns.length && (
                                (pinnedColumns.indexOf(column.field) + 1) === pinnedColumns.length);
                            return (
                                <div
                                    key={column.field}
                                    className={styles.dataGrid__headerCell}
                                    style={{
                                        width: `${columnWidths[column.field]}px`,
                                        justifyContent: getTextAlignmentForColumn(column.type),
                                        position: 'sticky',
                                        top: isPinned ? 0 : 'unset',
                                        left: isPinned ? `${leftPosition}px` : 'unset',
                                        zIndex: isPinned ? 1 : 'unset',
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
                        tableData.map((row, index) =>
                            (
                                <DataGridRow
                                    row={row}
                                    rIndex={index}
                                    columns={tableColumns}
                                    columnWidths={columnWidths}
                                    key={`row-${index}`}
                                    pinnedColumns={pinnedColumns}
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
                                        columns={tableColumns}
                                        columnWidths={columnWidths}
                                        pinnedColumns={pinnedColumns}
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
                <DarkThemeSwitch theme={theme} setTheme={setTheme}/>
                <div className={styles.paginationInfo}>
                    {tableData.length}
                    {' '}
					of
                    {' '}
                    {totalRows}
                </div>
            </div>
        </div>
    );
}

export default DataGrid;
