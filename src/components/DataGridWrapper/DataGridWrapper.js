import React, { useEffect, useState } from 'react';
import styles from './DataGridWrapper.module.scss';
import DataGrid from '../DataGrid/DataGrid';
import axios from 'axios';

const DataGridWrapper = ({ lessRows = 0 }) => {
    const apiUrl = 'https://datagrid-backend.glitch.me/data';
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [columns, setColumns] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(30);
    const totalRows = 1000;

    const fetchAPIData = () => {
        const numberOfRowsToFetch = Math.min(totalRows - data.length, rowsPerPage);
        axios.get(`${apiUrl}?rows=${numberOfRowsToFetch}&lessRows=${lessRows}`)
            .then((response) => {
                const {
                    rowData,
                    columnData,
                } = response.data.data;
                setColumns(columnData);
                setData((prevState) => {
                    return [...prevState, ...rowData];
                });
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        if (data.length === 0 || loading) {
            fetchAPIData();
        }
    }, [loading]);

    const options = {
        columns,
        loading,
        setLoading,
        rowsPerPage,
        setRowsPerPage,
        totalRows,
    };

    return (
        <div className={styles.tableContainer}>
            <DataGrid options={options} data={data}/>
        </div>
    );
};

export default DataGridWrapper;
