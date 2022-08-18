import axios from 'axios'

const JWT_EXPIRY_TIME = process.env.REACT_APP_JWT_EXPIRY_TIME;

export const onSilentRefresh = () => {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/auth/silentRefresh")
      .then((res) => {
        console.log("silentRefresh 성공");
        onLoginSuccess(res)
        resolve()
      })
      .catch((error) => {
        console.error(error);
        reject()
      });
  })

};

export const onLoginSuccess = (response) => {
  console.log(response);
  const { accessToken } = response.data;
  console.log(accessToken)

  // accessToken 설정
  axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;


  // refreshToken 설정
  // setCookie("refreshToken", refreshToken);

  // accessToken 만료하기 1분 전에 로그인 연장
  setTimeout(onSilentRefresh, JWT_EXPIRY_TIME - 60000);
};

export const onGetAuth = () =>
  new Promise((resolve, reject) => {
    axios.get('/api/auth/check')
      .then((res) => {
        console.log(res.data)
        console.log("정보 가져오기 성공")
        resolve()
      }, (err) => {
        console.log(err)
        console.error('정보 가져오기 실패')
        reject()
      })
  })