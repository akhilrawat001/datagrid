import React, { useEffect, useState } from 'react';
import styles from './DataGridWrapper.module.scss';
import DataGrid from '../DataGrid/DataGrid';
import axios from 'axios';

const DataGridWrapper = ({ apiUrl }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [columns, setColumns] = useState([]);

    const fetchAPIData = () => {
        axios.get(apiUrl)
            .then((response) => {
                const {
                    rowData,
                    columnData
                } = response.data.data;
                setColumns(columnData);
                setData((prevState) => {
                    setData([...prevState, ...rowData]);
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
        sort: false,
        columns: columns,
        totalRows: 10000,
        loading,
        setLoading,
    };

    return (
        <div className={styles.tableContainer}>
            <DataGrid options={options} data={data}/>
        </div>
    );
};

export default DataGridWrapper;
