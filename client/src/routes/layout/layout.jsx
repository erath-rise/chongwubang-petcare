import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer.jsx";
import { Outlet } from "react-router-dom";
import './layout.scss';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';


function Layout() {
    return (
        <div className="layout">
            <div className="navbar">
                <Navbar />
            </div>
            <div className="content">
                <Outlet />
            </div>
            <Footer />
        </div>
    )
}

function RequireAuth() {
    const { currentUser } = useContext(AuthContext);

    // useEffect(() => {
    //     if (!currentUser) {
    //         navigate('/login');
    //     }
    // }, [currentUser]);

    return (
        !currentUser ? <Navigate to="/login"/> : (
            <div className="layout">
                <div className="navbar">
                    <Navbar />
                </div>
                <div className="content">
                    <Outlet />
                </div>
                <Footer />
            </div>
        )
    )
}


export {Layout, RequireAuth};

