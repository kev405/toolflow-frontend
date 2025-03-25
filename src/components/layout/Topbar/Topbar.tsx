import { useAuth } from "../../../hooks/useAuth";

export const Topbar = () => {
    const { user } = useAuth();
  
    return (
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4">
        {/* <MobileSidebarButton />
        <SearchBar />
        <UserDropdown user={user} /> */}

        hola
      </header>
    );
  };