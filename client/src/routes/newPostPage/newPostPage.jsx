import { useState } from "react";
import "./newPostPage.scss";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import apiRequest from "../../lib/apiRequest";
import UploadWidget from "../../components/uploadWidget/UploadWidget";
import { useNavigate } from "react-router-dom";

function NewPostPage() {
  const [value, setValue] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);

    const postData = {
      title: inputs.title || "",
      price: parseInt(inputs.price) || 0,
      desc: value || "",
      address: inputs.address || "",
      city: inputs.city || "",
      type: inputs.type || "",
      latitude: inputs.latitude || "",
      longitude: inputs.longitude || "",
      images: images,
    };

    const postDetail = {
      utilities: inputs.utilities || "",
      pet: inputs.pet || "",
      age: inputs.age || "",
      gender: parseInt(inputs.gender) || 0,
      rabiesVaccine: parseInt(inputs.rabiesVaccine) || 0,
      healthCondition: parseInt(inputs.healthCondition) || 0,
      times: parseInt(inputs.times) || 0,
    };

    try {
      const res = await apiRequest.post("/posts", {
        ...postData,
        postDetail,
      });
      navigate(`/${res.data.id}`);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="newPostPage">
      <div className="formContainer">
        <p className="text-4xl mb-8">创建新帖子</p>
        <div className="wrapper">
          <form onSubmit={handleSubmit}>
          <div className="item">
            <label htmlFor="title">标题</label>
            <input name="title" type="text" placeholder="标题" required />
          </div>
          <div className="item">
            <label htmlFor="price">价格</label>
            <input name="price" type="number" placeholder="价格" required />
          </div>
          <div className="item">
            <label htmlFor="address">地址</label>
            <input name="address" type="text" placeholder="地址" required />
          </div>
          <div className="item description">
            <label htmlFor="desc">描述</label>
            <ReactQuill theme="snow" value={value} onChange={setValue} />
          </div>
          <div className="item">
            <label htmlFor="city">城市</label>
            <input name="city" type="text" placeholder="城市" required />
          </div>
          <div className="item">
            <label htmlFor="latitude">纬度</label>
            <input name="latitude" type="text" placeholder="纬度" required />
          </div>
          <div className="item">
            <label htmlFor="longitude">经度</label>
            <input name="longitude" type="text" placeholder="经度" required />
          </div>
          <div className="item">
            <label htmlFor="type">类型</label>
            <select name="type">
              <option value="dogwalking" defaultChecked>
                遛狗
              </option>
              <option value="petboarding">宠物寄养</option>
              <option value="petsitting">宠物看护</option>
            </select>
          </div>

            <button type="submit" className="sendButton">提交帖子</button>
          </form>
        </div>
      </div>
      <div className="sideContainer">
        {images.map((image, index) => (
          <img src={image} key={index} alt="" />
        ))}
        <UploadWidget
          uwConfig={{
            multiple: true,
            cloudName: "lamadev",
            uploadPreset: "estate",
            folder: "posts",
          }}
          setState={setImages}
        />
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default NewPostPage;