import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './DataGridWrapper.module.scss';
import DataGrid from '../DataGrid/DataGrid';
import axios from 'axios';
import getColumnWidth from '../../utils/ColumnWidth';

const DataGridWrapper = ({ apiUrl }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
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
    }, [data.length]);

    const fetchAPIData = () => {
        setLoading(true);
        axios.get(apiUrl)
            .then((response) => {
                setData((prevState) => {
                    return [...prevState, ...response.data.data];
                });
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleObserver = useCallback((entries) => {
        console.log('handleObserver rendered');
        const target = entries[0];
        if (target.isIntersecting) {
            fetchAPIData();
        }
    }, []);

    useEffect(() => {
        const option = {
            root: null,
            rootMargin: '0px',
            threshold: 0,
        };
        if (lastRow.current) {
            const observer = new IntersectionObserver(handleObserver, option);
            observer.observe(lastRow.current);
        }
    }, [handleObserver]);

    const columns = [
        'firstName',
        'lastname',
        'number',
        'email',
        'birthdate',
        'address',
        'sex',
        'gender',
        'jobTitle',
        'department',
        'company',
        'subscriptionTier',
        'ipv4',
        'ipv6',
        'mac',
        'creditCard',
        'salary',
        'manufacturer',
        'model',
        'vin'
    ].map((item) => ({
        name: item.toUpperCase(),
        field: item
    }));

    const options = {
        sort: false,
        columns: columns,
        totalRows: 10000,
        loading,
        columnWidths,
        lastRowRef: lastRow
    };

    return (
        <div className={styles.tableContainer}>
            <DataGrid options={options} data={data}/>
        </div>
    );
};

export default DataGridWrapper;
