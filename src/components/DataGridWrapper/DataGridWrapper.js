import React, { useEffect, useState } from 'react';
import styles from './DataGridWrapper.module.scss';
import DataGrid from '../DataGrid/DataGrid';
import axios from 'axios';

const DataGridWrapper = ({ apiUrl }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

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

    useEffect(() => {
        fetchAPIData();
    }, []);

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
        callAPI: fetchAPIData,
        loading: loading
    };

    return (
        <div className={styles.tableContainer}>
            <DataGrid options={options} data={data}/>
        </div>
    );
};

export default DataGridWrapper;
