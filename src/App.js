import React from 'react';
import styles from './App.module.scss';
import DataGrid from './components/DataGrid/DataGrid';

function App() {

    const data = [];
    for (let i = 1; i <= 10; i++) {
        const row = { id: i };

        for (let j = 1; j <= 15; j++) {
            row[`column_${j}`] = `Row ${i}, Column ${j}`;
        }

        data.push(row);
    }

    const columns = [];
    for (let i = 1; i <= 15; i++) {
        columns.push({
            name: `Column ${i}`,
            field: `column_${i}`
        });
    }

    const options = {
        sort: false,
        columns: columns
    };

    return (
        <div className={styles.app}>
            <h1 className={styles.appHeading}>DataGrid</h1>
            <DataGrid options={options} data={data}/>
        </div>
    );
}

export default App;
