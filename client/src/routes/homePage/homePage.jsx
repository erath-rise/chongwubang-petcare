import { useContext, useState } from "react";
// import SearchBar from "../../components/searchBar/SearchBar";
import "./homePage.scss";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function HomePage() {

  const { currentUser } = useContext(AuthContext)
  // currentUser
  console.log(currentUser); 
  const navigate = useNavigate();

  // 搜索表单状态
  const [searchForm, setSearchForm] = useState({
    serviceType: "遛狗",
    location: "",
    date: ""
  });

  const handleSearch = (e) => {
    e.preventDefault();
    // 导航到护理员列表页面并传递搜索参数
    const params = new URLSearchParams({
      ...(searchForm.location && { city: searchForm.location }),
      ...(searchForm.serviceType && { type: searchForm.serviceType }),
      ...(searchForm.date && { date: searchForm.date })
    });
    navigate(`/sitters?${params.toString()}`);
  };

  return (
    <div>
      <main className="flex-1">
        {/* Banner */}
        <section className="w-full bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold sm:text-4xl xl:text-5xl/none text-gray-900">
                  一键找遛狗、找照护，让宠物照看不再是难题。
                  </h1>
                  <p className="text-xl text-gray-600 md:text-2xl">
                    像家人一样对待您的宠物
                  </p>
                </div>
                
                {/* 搜索表单 */}
                <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    {/* 我正在寻找 */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        我正在寻找
                      </label>
                      <select 
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8326] bg-white"
                        value={searchForm.serviceType}
                        onChange={(e) => setSearchForm({...searchForm, serviceType: e.target.value})}
                      >
                        <option value="遛狗">遛狗</option>
                        <option value="宠物寄养">宠物寄养</option>
                        <option value="上门照看">上门照看</option>
                        <option value="日间照看">日间照看</option>
                      </select>
                    </div>

                    {/* 地点 */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        地点
                      </label>
                      <select 
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8326] bg-white"
                        value={searchForm.location}
                        onChange={(e) => setSearchForm({...searchForm, location: e.target.value})}
                      >
                        <option value="">选择城市</option>
                        <option value="北京">北京</option>
                        <option value="上海">上海</option>
                        <option value="广州">广州</option>
                        <option value="深圳">深圳</option>
                        <option value="成都">成都</option>
                        <option value="杭州">杭州</option>
                        <option value="重庆">重庆</option>
                        <option value="武汉">武汉</option>
                        <option value="西安">西安</option>
                        <option value="天津">天津</option>
                        <option value="南京">南京</option>
                        <option value="苏州">苏州</option>
                        <option value="长沙">长沙</option>
                        <option value="郑州">郑州</option>
                        <option value="青岛">青岛</option>
                        <option value="沈阳">沈阳</option>
                        <option value="大连">大连</option>
                        <option value="济南">济南</option>
                        <option value="厦门">厦门</option>
                        <option value="福州">福州</option>
                        <option value="昆明">昆明</option>
                        <option value="哈尔滨">哈尔滨</option>
                        <option value="长春">长春</option>
                        <option value="石家庄">石家庄</option>
                        <option value="南昌">南昌</option>
                        <option value="贵阳">贵阳</option>
                        <option value="南宁">南宁</option>
                        <option value="太原">太原</option>
                        <option value="合肥">合肥</option>
                        <option value="宁波">宁波</option>
                        <option value="无锡">无锡</option>
                        <option value="珠海">珠海</option>
                        <option value="东莞">东莞</option>
                        <option value="佛山">佛山</option>
                      </select>
                    </div>

                    {/* 时间 */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        时间
                      </label>
                      <input 
                        type="date"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8326]"
                        value={searchForm.date}
                        onChange={(e) => setSearchForm({...searchForm, date: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* 搜索按钮 */}
                  <button 
                    type="submit"
                    className="w-full md:w-auto bg-[#FFC107] hover:bg-[#FFB300] text-gray-900 font-semibold px-8 py-3 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    查找护理员
                  </button>
                </form>
              </div>
              
              <img
                src="banner.jpg"
                alt="宠物照片"
                className="mx-auto aspect-square overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="w-full py-6 md:py-12 lg:py-16 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                  易于使用的功能
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">用宠物护理中心简化宠物护理</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  宠物护理中心为宠物主人提供一个无缝平台，与值得信赖的护理人员建立联系，并在一个地方管理所有宠物护理需求。
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <img
                src="img1.jpg"
                alt="Image"
                className="mx-auto aspect-auto overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              />
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-10">
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">发布护理需求</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        轻松创建并发布您的宠物护理需求，指定您的需求和偏好。
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">寻找值得信赖的护理人员</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        浏览并联系您所在地区经过审核的可靠宠物护理人员网络。
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">安全预订</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        通过我们的平台安全地预订和管理宠物护理服务，价格透明并附有评论。
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* What Our Customers Say */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6 lg:gap-10">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">客户评价</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                听听信任宠物帮为他们的毛茸茸朋友提供卓越护理的宠物主人的心声。
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-4 rounded-lg border bg-background p-6 shadow-sm transition-shadow hover:shadow-md">
                <blockquote className="text-lg font-semibold leading-snug">
                  &ldquo;宠物帮真是救星！当我不得不突然出差时，我为我的猫咪找到了一位很棒的保姆。这个平台非常易用，我喜欢应用内消息功能&rdquo;
                </blockquote>
                <div>
                  <div className="font-semibold">小李</div>
                  <div className="text-sm text-muted-foreground">宠物主人</div>
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-lg border bg-background p-6 shadow-sm transition-shadow hover:shadow-md">
                <blockquote className="text-lg font-semibold leading-snug">
                  &ldquo;作为一名遛狗师，宠物帮帮助我拓展了业务。这个平台让我轻松与所在地区的宠物主人建立联系，调度系统非常棒！&rdquo;
                </blockquote>
                <div>
                  <div className="font-semibold">王芳</div>
                  <div className="text-sm text-muted-foreground">宠物护理员</div>
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-lg border bg-background p-6 shadow-sm transition-shadow hover:shadow-md">
                <blockquote className="text-lg font-semibold leading-snug">
                  &ldquo;我经常因工作出差，宠物帮改变了一切。我可以在不同城市轻松找到可靠的宠物保姆。就像在各地都有一个喜爱宠物的朋友网络！&rdquo;
                </blockquote>
                <div>
                  <div className="font-semibold">张明</div>
                  <div className="text-sm text-muted-foreground">宠物主人</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;
