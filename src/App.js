import React from 'react';
import styles from './App.module.scss';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import DataGridWrapper from './components/DataGridWrapper/DataGridWrapper';

const dev = window.location.protocol === 'http:';
const apiUrl = dev ? 'http://0.0.0.0:3001/data' : 'https://datagrid-backend.glitch.me/data';

function App() {
    return (
        <Router>
            <div className={styles.headerContainer}>
                <header className={styles.header}>
                    <h1>DataGrid</h1>
                    <nav className={styles.navItems}>
                        <p className={styles.navItem}>
                            <a href="/datagrid/large">Large Table</a>
                        </p>
                        <p className={styles.navItem}>
                            <a href="/datagrid/small">Small Table</a>
                        </p>
                    </nav>
                </header>
                <Routes>
                    <Route path="/datagrid/large" element={<LargeTable/>}/>
                    <Route path="/datagrid/small" element={<SmallTable/>}/>
                </Routes>
            </div>
        </Router>
    );
}

const LargeTable = () => <DataGridWrapper apiUrl={apiUrl}/>;
const SmallTable = () => <DataGridWrapper apiUrl={apiUrl} lessRows={1}/>;

export default App;
