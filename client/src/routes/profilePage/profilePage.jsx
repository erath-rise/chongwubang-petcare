import Chat from "../../components/chat/Chat";
import List from "../../components/list/List";
import "./profilePage.scss";
import apiRequest from "../../lib/apiRequest";
import { Await, Link, useLoaderData, useNavigate } from "react-router-dom";
import { Suspense, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

function ProfilePage() {
  const data = useLoaderData();

  const { updateUser, currentUser } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiRequest.post("/auth/logout");
      updateUser(null);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="profilePage">
      <div className="details">
        <div className="wrapper">
          <div className="title">
            <p className="text-4xl">用户信息</p>
            <Link to="/profile/update">
              <button>更新资料</button>
            </Link>
          </div>
          <div className="info">
            <span>
              头像:
              <img src={currentUser.avatar || "noavatar.jpg"} alt="" />
            </span>
            <span>
              用户名: <b>{currentUser.username}</b>
            </span>
            <span>
              邮箱: <b>{currentUser.email}</b>
            </span>
            <button onClick={handleLogout}>退出登录</button>
          </div>
          <div className="title">
            <p className="text-4xl">我的列表</p>
            <Link to="/add">
              <button>创建新帖子</button>
            </Link>
          </div>
          <Suspense fallback={<p>加载中...</p>}>
            <Await
              resolve={data.postResponse}
              errorElement={<p>加载帖子失败！</p>}
            >
              {(postResponse) => <List posts={postResponse.data.userPosts} />}
            </Await>
          </Suspense>
          {/* <div className="title">
            <h1>Saved List</h1>
          </div> */}
          <Suspense fallback={<p>加载中...</p>}>
            <Await
              resolve={data.postResponse}
              errorElement={<p>加载帖子失败！</p>}
            >
              {(postResponse) => <List posts={postResponse.data.savedPosts} />}
            </Await>
          </Suspense>
        </div>
      </div>
      <div className="chatContainer">
        <div className="wrapper">
          <Suspense fallback={<p>加载中...</p>}>
            <Await
              resolve={data.chatResponse}
              errorElement={<p>加载聊天失败！</p>}
            >
              {(chatResponse) => <Chat chats={chatResponse.data}/>}
            </Await>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
