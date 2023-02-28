import React, { useEffect, useState } from 'react';
import styles from './DataGridWrapper.module.scss';
import DataGrid from '../DataGrid/DataGrid';
import axios from 'axios';
import getColumnWidth from '../../utils/ColumnWidth';

const DataGridWrapper = ({ apiUrl }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const fetchAPIData = () => {
        axios.get(apiUrl)
            .then((response) => {
                setData([...data, ...response.data.data]);
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

    const columnsObj = {
        'firstName': 'First Name',
        'lastname': 'Last Name',
        'number': 'Phone Number',
        'email': 'E-mail',
        'birthdate': 'Date of birth',
        'address': 'Address',
        'sex': 'Sex',
        'gender': 'Gender',
        'jobTitle': 'Job Title',
        'department': 'Department',
        'company': 'Company',
        'subscriptionTier': 'Subscription Tier',
        'ipv4': 'IPV4',
        'ipv6': 'IPV6',
        'mac': 'MAC Address',
        'creditCard': ' Create Card No.',
        'salary': 'Salary',
        'manufacturer': 'Manufacturer',
        'model': 'Model',
        'vin': 'VIN',
    };
    const columns = Object.keys(columnsObj)
        .map((key) => ({
            name: columnsObj[key],
            field: key
        }));

    const options = {
        sort: false,
        columns: columns,
        totalRows: 10000,
        loading,
        columnWidths,
        setLoading,
    };

    return (
        <div className={styles.tableContainer}>
            <DataGrid options={options} data={data}/>
        </div>
    );
};

export default DataGridWrapper;
