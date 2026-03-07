import { createBrowserRouter } from "react-router";
import Home from "@pages/Home";
import MyProfile from "@pages/MyProfile";
import Login from "@pages/Login";
import About from "@pages/About";
import Contact from "@pages/Contact";
import MyAppointments from "@pages/MyAppointments";
import Signup from "@pages/Signup";
import RootLayout from "@layouts/RootLayout";
import NotFound from "@pages/NotFound";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: RootLayout,
        children: [
            {
                index: true,
                Component: Home
            },
            {
                path: "about",
                Component: About
            },
            {
                path: "contact",
                Component: Contact
            },
            {
                path: "appointment",
                Component: MyAppointments
            },
                    {
                        path: "profile",
                        Component: MyProfile
                    },
                    {
                        path: "login",
                        Component: Login
                    },
                    {
                        path: "signup",
                        Component: Signup
                    },
            {
                path: "*",
                Component: NotFound
            }
            
        ]
    }
])