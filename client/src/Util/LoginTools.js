import axios from 'axios'

export const onSilentRefresh = () => {
  return new Promise((resolve, reject) => {
    axios
      .get("/api/auth/silentRefresh")
      .then((res) => {
        console.log(res.data)
        if (res.data.isSilentRefreshSuccess) {
          onLoginSuccess(res)
          resolve()
        } else {
          reject()
        }
      })
  })
};

export const onLoginSuccess = (response) => {
  const { accessToken } = response.data;

  // accessToken 설정
  axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;


  // refreshToken 설정
  // setCookie("refreshToken", refreshToken);

  // accessToken 만료하기 1분 전에 로그인 연장
  setTimeout(onSilentRefresh, process.env.REACT_APP_JWT_EXPIRY_TIME - 60000);
};

export const onGetAuth = () =>
  new Promise((resolve, reject) => {
    axios.get('/api/auth/check')
      .then((res) => {
        if (res.data.isAuthSucess) {
          resolve()
        } else {
          reject()
        }
      })
  })