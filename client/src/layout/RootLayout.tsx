import { Outlet } from "react-router"
import Navbar from "../components/common/Navbar"

const RootLayout = () => {
  return (
    <>
       <Navbar/>
       <div>
        <Outlet/>
       </div>
    </>
  )
}

export default RootLayout