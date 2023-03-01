import React from 'react';
import styles from './App.module.scss';
import { Routes, Route, Link } from 'react-router-dom';

import DataGridWrapper from './components/DataGridWrapper/DataGridWrapper';

function App() {
    return (
        <div className={styles.headerContainer}>
            <header className={styles.header}>
                <h1>DataGrid</h1>
                <nav className={styles.navItems}>
                    <p className={styles.navItem}>
                        <Link to="/datagrid">Large Table</Link>
                    </p>
                    <p className={styles.navItem}>
                        <Link to="/datagrid/small">Small Table</Link>
                    </p>
                </nav>
            </header>
            <Routes>
                <Route path="/datagrid" element={<LargeTable/>}/>
                <Route path="/datagrid/small" element={<SmallTable/>}/>
            </Routes>
        </div>
    );
}

const LargeTable = () => <DataGridWrapper/>;
const SmallTable = () => <DataGridWrapper lessRows={1}/>;

export default App;
