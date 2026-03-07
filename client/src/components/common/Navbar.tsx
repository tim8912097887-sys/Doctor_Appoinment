import { Link, NavLink } from "react-router"
import { assets } from "../../assets/assets"

const Navbar = () => {
  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400">
       <img className="w-44 cursor-pointer" src={assets.logo} alt="Logo" />
       <ul className="hidden md:flex items-start gap-5 font-medium">
         <NavLink to={"/"}>
           {
            ({ isActive }) => {
                return isActive?
                  <>
                    <li className="py-1">HOME</li>
                    <hr className="h-0.5 bg-purple-400 w-3/5 m-auto" />
                  </>
                :
                    <li className="py-1">HOME</li>
            }
           }
         </NavLink>
         <NavLink to={"/doctors"}>
           {
            ({ isActive }) => {
                return isActive?
                  <>
                    <li className="py-1">ALL DOCTORS</li>
                    <hr className="h-0.5 bg-purple-400 w-3/5 m-auto" />
                  </>
                :
                    <li className="py-1">ALL DOCTORS</li>
            }
           }
         </NavLink>
         <NavLink to={"/about"}>
           {
            ({ isActive }) => {
                return isActive?
                  <>
                    <li className="py-1">ABOUT</li>
                    <hr className="h-0.5 bg-purple-400 w-3/5 m-auto" />
                  </>
                :
                    <li className="py-1">ABOUT</li>
            }
           }
         </NavLink>
         <NavLink to={"/contact"}>
           {
            ({ isActive }) => {
                return isActive?
                  <>
                    <li className="py-1">CONTACTS</li>
                    <hr className="h-0.5 bg-purple-400 w-3/5 m-auto" />
                  </>
                :
                    <li className="py-1">CONTACTS</li>
            }
           }
         </NavLink>
       </ul>
       <div>
         <Link className="bg-purple-400 text-white font-light px-8 py-3 rounded-full hidden md:block" to="/signup">Create Account</Link>
       </div>
    </div>
  )
}

export default Navbar