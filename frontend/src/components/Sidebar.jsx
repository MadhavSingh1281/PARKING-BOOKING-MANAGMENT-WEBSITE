import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("role");

  const adminMenu = [
    { name: "Dashboard", path: "/admin" },
    { name: "Logout", path: "/login" }
  ];

  const userMenu = [
    { name: "Explore", path: "/" },
    { name: "Ride", path: "/ride" },
    { name: "Bookings", path: "/bookings" },
    { name: "Logout", path: "/login" }
  ];

  const menu = role === "admin" ? adminMenu : userMenu;

  const handleClick = (item) => {
    if (item.name === "Logout") {

      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("email");

      window.location.href = "/login";

    } else {
      navigate(item.path);
    }
  };

  return (
    <div className="sidebar">

      <h2 className="logo">
        {role === "admin" ? "Admin Panel" : "ParkSafe"}
      </h2>

      {menu.map((item) => (
        <div
          key={item.name}
          className={`sidebar-item ${
            location.pathname === item.path ? "active" : ""
          }`}
          onClick={() => handleClick(item)}
        >
          {item.name}
        </div>
      ))}

    </div>
  );
};

export default Sidebar;