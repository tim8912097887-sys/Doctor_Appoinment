import { Outlet } from "react-router"
import Navbar from "../components/common/Navbar"

const RootLayout = () => {
  return (
    <>
       <div className="mx-4 sm:mx-[10%]">
          <Navbar/>
          <div>
            <Outlet/>
          </div>
       </div>
    </>
  )
}

export default RootLayout