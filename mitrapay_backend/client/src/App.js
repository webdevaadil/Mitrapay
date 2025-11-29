import React, { Suspense, useEffect, useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import useSound from 'use-sound';
import { CSpinner, useColorModes } from '@coreui/react';
import './scss/style.scss';
import './scss/examples.scss';
import notificationSound from './assets/WhatsApp Audio 2025-08-19 at 6.54.18 PM.aac';

const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));
const Login = React.lazy(() => import('./views/pages/login/Login'));
const Register = React.lazy(() => import('./views/pages/register/Register'));
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'));
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'));

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { loaduser } from './actions/userAction';
import { io } from 'socket.io-client';
import useUnlockAudio from "./useUnlockAudio.jsx";
import { socket } from './socket.js';
// ✅ Create single socket instance



const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('dark');
  const storedTheme = useSelector((state) => state.theme);
  const { user,server } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [enabled, setEnabled] = useState(false);



  const playNotificationSound = () => {
    const audio = new Audio(notificationSound);
    audio.play().catch((err) => {
      console.warn("Audio play failed:", err);
    });
  };
  useUnlockAudio(); // unlocks audio after 1st click
 useEffect(() => {
  setColorMode('dark')
    let intervalId;

    if (server === "down") {
      // Show toast immediately
      toast.error("🚨 Bank server is Down", {
        position: "top-center",
        autoClose: 3000,
        closeOnClick: true,
      });

      // Keep re-triggering toast every 5 sec until server is UP
      intervalId = setInterval(() => {
        toast.error("🚨 Bank server is Down", {
          position: "top-center",
          autoClose: 3000,
          closeOnClick: true,
        });
      }, 5000);
    }

    return () => clearInterval(intervalId);
  }, [server]);
  // theme setup
  // useEffect(() => {
    // const urlParams = new URLSearchParams(window.location.href.split('?')[1]);
    // const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0];
    // if (theme) setColorMode(theme);
    // else if (!isColorModeSet()) setColorMode(storedTheme);
  // }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // load user on app start
  useEffect(() => {
    dispatch(loaduser());
    console.log("User loaded");
  }, [dispatch]);

  // ✅ Connect socket after user is loaded
  useEffect(() => {
    if (user?.role) {
      socket.connect();
      socket.emit('joinRoleRoom', user.role)
      // console.log(`Joined socket.io room for role: ${user.role}`)
    }
  }, [user])




  useEffect(() => {
    
    socket.on("notification", (data) => {
      playNotificationSound();
      toast.info(` ${data.message}`, {
        autoClose: 30000,
        pauseOnHover: true,
      });
    });

    return () => {
      socket.off("notification");
    };
  }, []);

  return (
    <HashRouter>
      {/* <button onClick={()=>{dispatch(loaduser())}}> test</button> */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
      <Suspense fallback={<div className="pt-3 text-center"><CSpinner color="primary" variant="grow" /></div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/404" element={<Page404 />} />
          <Route exact path="/500" element={<Page500 />} />
          <Route path="*" element={<DefaultLayout />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
};

export default App;
