import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import "./adminLayout.scss";

const AdminLayout = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 检查是否为管理员
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/");
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  const menuItems = [
    { path: "/admin/dashboard", label: "数据统计", icon: "📊" },
    { path: "/admin/users", label: "用户管理", icon: "👥" },
    { path: "/admin/orders", label: "订单管理", icon: "📦" },
    { path: "/admin/sitters", label: "护理员管理", icon: "🐾" },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="py-4 px-4">
          <h2>管理后台</h2>
        </div>
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={location.pathname === item.path ? "active" : ""}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto py-4 px-4">
          <Link to="/" className="back-link">
            ← 返回首页
          </Link>
        </div>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

