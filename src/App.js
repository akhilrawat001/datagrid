import React, { useState } from 'react';
import styles from './App.module.scss';

import DataGridWrapper from './components/DataGridWrapper/DataGridWrapper';

function App() {

    const [table,setTable] = useState('large');
    return (
        <div className={styles.headerContainer}>
            <header className={styles.header}>
                <h1>DataGrid</h1>
                <nav className={styles.navItems}>
                    <p className={styles.navItem}>
                        <button onClick={() => setTable('large')}>Large Table</button>
                    </p>
                    <p className={styles.navItem}>
                        <button onClick={() => setTable('small')}>Small Table</button>
                    </p>
                </nav>
            </header>
            {table === 'large' ? <LargeTable/> : <SmallTable/>}
        </div>
    );
}

const LargeTable = () => <DataGridWrapper/>;
const SmallTable = () => <DataGridWrapper lessRows={1}/>;

export default App;
