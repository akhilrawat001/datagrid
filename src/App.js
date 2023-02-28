import React from 'react';
import styles from './App.module.scss';

import DataGridWrapper from './components/DataGridWrapper/DataGridWrapper';

const dev = window.location.protocol === 'http:';

const App = () => {
    const apiUrl = dev ? 'http://0.0.0.0:3001/data' : 'https://datagrid-backend.glitch.me/data';
    return (
        <>
            <h1 className={styles.appHeading}>DataGrid</h1>
            <DataGridWrapper apiUrl={apiUrl}/>
        </>
    );
};

export default App;
