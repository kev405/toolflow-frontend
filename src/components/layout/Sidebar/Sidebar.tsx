import { NavLink } from "react-router-dom";

export const Sidebar = () => (
  <div className="flex w-64 flex-col border-r border-gray-200 bg-white">
    <div className="flex h-16 items-center px-4">
      {/* <Logo /> */}
    </div>
    <nav className="flex-1 space-y-1 p-4">
      {/* <NavLink to="/loans" icon={<ToolsIcon />}>Prestamos</NavLink>
        <NavLink to="/vehicles" icon={<ToolsIcon />}>Vehiculos</NavLink>
        <NavLink to="/tools" icon={<ToolsIcon />}>Herramientas</NavLink>
        <NavLink to="/transfers" icon={<ToolsIcon />}>Traslados</NavLink>
        <NavLink to="/users" icon={<ToolsIcon />}>Usuarios</NavLink>
        <NavLink to="/profile" icon={<UserIcon />}>Perfil</NavLink> */}

      <NavLink to="/loans" >Prestamos</NavLink>
      <NavLink to="/vehicles" >Vehiculos</NavLink>
      <NavLink to="/tools" >Herramientas</NavLink>
      <NavLink to="/transfers" >Traslados</NavLink>
      <NavLink to="/users" >Usuarios</NavLink>
      <NavLink to="/profile" >Perfil</NavLink>
    </nav>
  </div>
);