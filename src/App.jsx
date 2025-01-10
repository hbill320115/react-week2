import axios from 'axios'
import { useState } from 'react'
const { VITE_API_PATH , VITE_BASE_URL } = import.meta.env


function App() {
  const [isAuth,setIsAuth]=useState(false);
  const [tempProduct, setTempProduct] = useState({});
  const [products,setProducts]=useState([]);
  const [account,setAccount] = useState({
    username: "example@test.com",
    password: "example"
  })

  // input值轉到account裡
  function handleInput(e){
    const {value,name} =e.target
    setAccount({
      ...account,
      [name]:value
    })
  }

  // 登入API
  const handleLogin = async (e)=>{
    e.preventDefault();
    try{
      const loginResponse = await axios.post(`${VITE_BASE_URL}/v2/admin/signin`,account)
      const {token,expired} = loginResponse.data;
      // 儲存 token
      document.cookie = `myToken=${token}; expires=${new Date(expired)}`;
      setIsAuth(true) // 認證

      // 撈取token(發送token請求前加入，只需加入一次)
      axios.defaults.headers.common['Authorization'] = token;

      // 撈取產品資料
      ( async ()=>{
          const productResponse = await axios.get(`${VITE_BASE_URL}/v2/api/${VITE_API_PATH}/admin/products`);
          setProducts(productResponse.data.products)
      })()
    }
    catch{
      alert(`登入失敗`)
    }
  }
  
  // 檢查登入API
  const checkUserLogin = async () => {
    try{
      await axios.post(`${VITE_BASE_URL}/v2/api/user/check`)
      alert("使用者已登入")
    }catch(error){
      console.error(error)
    }
  }

  return (
    <>
    {isAuth 
// 後臺頁面
    ? <div className="container py-5">
      <div className="row">
        <div className="col-6">
          <button type="button" className="btn btn-info mb-4 text-white"
          onClick={checkUserLogin}>檢查是否登入</button>
          <h2>產品列表</h2>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">產品名稱</th>
                <th scope="col">原價</th>
                <th scope="col">售價</th>
                <th scope="col">是否啟用</th>
                <th scope="col">查看細節</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <th scope="row">{product.title}</th>
                  <td>{product.origin_price}</td>
                  <td>{product.price}</td>
                  <td>{product.is_enabled}</td>
                  <td>
                    <button
                      onClick={() => setTempProduct(product)}
                      className="btn btn-primary"
                      type="button"
                    >
                      查看細節
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="col-6">
          <h2>單一產品細節</h2>
          {tempProduct.title ? (
            <div className="card">
              <img
                src={tempProduct.imageUrl}
                className="card-img-top img-fluid"
                alt={tempProduct.title}
              />
              <div className="card-body">
                <h5 className="card-title">
                  {tempProduct.title}
                  <span className="badge text-bg-primary">
                    {tempProduct.category}
                  </span>
                </h5>
                <p className="card-text">商品描述：{tempProduct.description}</p>
                <p className="card-text">商品內容：{tempProduct.content}</p>
                <p className="card-text">
                  <del>{tempProduct.origin_price} 元</del> / {tempProduct.price}{" "}
                  元
                </p>
                <h5 className="card-title">更多圖片：</h5>
                {tempProduct.imagesUrl?.map((image) => (image && (<img key={image} src={image} className="img-fluid" />)))}
              </div>
            </div>
          ) : (
            <p>請選擇一個商品查看</p>
          )}
        </div>
      </div>
    </div>
// 登入頁面
    :<div className="d-flex flex-column justify-content-center align-items-center vh-100">
      <h1 className="mb-5">請先登入</h1>
      <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
        <div className="form-floating mb-3">
          <input type="email" className="form-control" id="username" placeholder="請輸入email" 
            defaultValue={account.username} name="username" onChange={handleInput}/>
          <label htmlFor="username">Email address</label>
        </div>
        <div className="form-floating">
          <input type="password" className="form-control" id="password" placeholder="請輸入密碼"
            defaultValue={account.password} name="password" onChange={handleInput}/>
          <label htmlFor="password">Password</label>
        </div>
        <button type="submit"className="btn btn-primary">登入</button>
      </form>
      </div>}
    </>
  )
}

export default App
