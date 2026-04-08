import {Button} from "@/components/ui/button.jsx";
import Navbar from "@/components/layout/Navbar.jsx";
import {useDispatch} from "react-redux";
import {increment, setUser} from "@/features/user/userSlice.js";
import {Navigate, Route, Routes, useLocation, useNavigate} from "react-router-dom";
import React, {lazy, Suspense, useEffect, useState} from "react";
import TestPage from "@/components/pages/TestPage.jsx";
import Loader from "@/components/ui/Loader.jsx";
import {useQuery} from "@tanstack/react-query";
import GuidePage from "@/components/pages/GuidePage.jsx";

const AddTopicsPage = lazy(()=> import("./components/pages/AddTopicsPage.jsx"))
const NotFoundPage = lazy(()=> import("./components/pages/NotFoundPage.jsx"))
const AllResultsPage = lazy(()=> import("./components/pages/AllResultsPage.jsx"))
const SettingsPage = lazy(()=> import("./components/pages/SettingsPage.jsx"))
const TestToPdf = lazy(()=> import("./components/pages/TestToPdf.jsx"))
const UsersPage = lazy(()=> import("./components/pages/UsersPage.jsx"))
const EachResultPage = lazy(()=> import("./components/pages/EachResultPage.jsx"))
const ResultsPage = lazy(()=> import("./components/pages/ResultsPage.jsx"))
const DefiningTestPage = lazy(()=> import("./components/pages/DefiningTestPage.jsx"))
const HomePage = lazy(()=> import("./components/pages/HomePage.jsx"))
const LoginForm = lazy(()=> import("./components/layout/LoginForm.jsx"))
const SignupForm = lazy(()=> import("./components/layout/SignupForm.jsx"))

function App() {
    const dispatch = useDispatch();
    const location = useLocation()
    const token = localStorage.getItem("token")
    const navigate = useNavigate()
    const [data, setData] = useState(null);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (token) {
                    await fetch(`${import.meta.env.VITE_SERVER}/auth/getuser/${token}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Credentials':'true',
                            'Access-Control-Allow-Origin':'http://localhost:5173'
                        }
                    })
                        .then(res => res.json())
                        .then(data => {
                            setData(data);
                        });
                    }
            } catch (error) {
                console.error("User fetch error:", error);
            }
        };

        fetchUser();
    }, [token]);

    useEffect(() => {
        if ((!token) && window.location.pathname !== '/signup' && window.location.pathname !== '/guide' && window.location.pathname !== '/') {
            navigate("/signin");
        }
    }, [token, navigate]);

    useEffect(() => {
        if (data) {
            dispatch(setUser(data));
        }
    }, [data, dispatch]);

  return (
    <>

        <Navbar />
        <Suspense fallback={<Loader variant={"big"} />}>
            <Routes>
                <Route path={"/"} element={<HomePage/>} />
                <Route path={"/definetest"} element={<DefiningTestPage/>}/>
                <Route path={"/test/:testId"} element={<TestPage/>} />
                <Route path={"/signup"} element={<SignupForm/>} />
                <Route path={"/signin"} element={<LoginForm/>} />
                <Route path={"/results"} element={<ResultsPage />} />
                <Route path={"/results/:testId"} element={<EachResultPage />} />
                <Route path={"/users"} element={<UsersPage />} />
                <Route path={`/testtopdf`} element={<TestToPdf />} />
                <Route path={"/addtopic"} element={<AddTopicsPage/>} />
                <Route path={"/profile/settings"} element={<SettingsPage />} />
                <Route path={"/allresults"} element={<AllResultsPage />}/>
                <Route path={"/guide"} element={<GuidePage/>}/>
                <Route path={"*"} element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    </>
  )
}

export default App
