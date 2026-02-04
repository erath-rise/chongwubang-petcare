import { useContext, useState, useEffect } from "react";
import "./navbar.scss";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useNotificationStore } from "../../lib/notificationStore";

function Navbar() {
  const [open, setOpen] = useState(false);

  const { currentUser } = useContext(AuthContext);

  const fetch = useNotificationStore((state) => state.fetch);
  const reset = useNotificationStore((state) => state.reset);
  const number = useNotificationStore((state) => state.number);

  useEffect(() => {
    if (currentUser) {
      fetch();
    } else {
      // 用户登出时重置通知数量
      reset();
    }
  }, [currentUser, fetch, reset]);

  return (
    <nav>
      <div className="left">
        <a href="/" className="logo">
          <PawPrintIcon className="h-8 w-8 text-primary" />
          <span>宠物帮</span>
        </a>
        {/* <a href="/list">查找遛狗、照护需求</a>
        <a href="/add">发布遛狗、照护需求</a> */}
        {/* <a href="/">Become a caretaker</a> */}
      </div>
      <div className="right">
        {currentUser ? (
          <div className="user">
            <img src={currentUser.avatar || "/noavatar.jpg"} alt="" />
            <span>{currentUser.username}</span>
            <Link to="/profile" className="profile">
              {number > 0 && <div className="notification">{number}</div>}
              <span>个人中心</span>
            </Link>
          </div>
        ) : (
          <>
            <a href="/login">登录</a>
            <a href="/register" className="register">
              注册
            </a>
          </>
        )}
        <div className="menuIcon">
          <img
            src="/menu.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
        </div>
        <div className={open ? "menu active" : "menu"}>
          <a href="/">首页</a>
          <a href="/">关于</a>
          <a href="/">联系</a>
          <a href="/">服务商</a>
          <a href="/">登录</a>
          <a href="/">注册</a>
        </div>
      </div>
    </nav>
  );
}


function PawPrintIcon(props) {
  return (
      <svg
          {...props}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
      >
          <circle cx="11" cy="4" r="2" />
          <circle cx="18" cy="8" r="2" />
          <circle cx="20" cy="16" r="2" />
          <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
      </svg>
  )
}

export default Navbar;
