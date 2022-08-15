const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { ExtractJwt, Strategy: JWTStrategy } = require('passport-jwt');
const crypto = require('crypto')

const User = require('../schemas/user');

const makePasswordHashed = (userId, plainPassword) =>
  new Promise(async (resolve, reject) => {
    console.log(userId, plainPassword);
    const salt = await User.findOne({ id: userId })
      .then((result) => { console.log(result); return result.salt });
    console.log(salt)
    crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
      if (err) reject(err);
      resolve(key.toString('base64'));
    });
  });

const JWTConfig = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: process.env.JWT_SECRET,
};

const JWTVerify = async (jwtPayload, done) => {
  try {
    const user = await User.findOne({ where: { id: jwtPayload.id } })

    if (user) {
      return done(null, user);

    }
    done(null, false, { reason: '올바르지 않은 인증 정보입니다.' })
  } catch (error) {
    console.error(error)
    done(error)
  }
}


const passportConfig = { usernameField: 'id', passwordField: 'password' }

const passportVerify = async (id, password, done) => {
  try {
    console.log('id: ' + id + password)
    // 유저 아이디로 일치하는 유저 데이터 검색
    const user = await User.findOne({ where: { id: id } });
    // 검색된 유저 데이터가 없다면 에러 표시
    if (!user) {
      done(null, false, { reason: '존재하지 않는 사용자 입니다.' });
      return;
    }
    // 검색된 유저 데이터가 있다면 유저 해쉬된 비밀번호 비교 
    const compareResult = (await makePasswordHashed(id, password)) === await User.find({ id: id }).then(res => res[0].password)

    // 해쉬된 비밀번호가 같다면 유저 데이터 객체 전송
    if (compareResult) {
      done(null, user);
      return;
    }
    // 비밀번호가 다를경우 에러 표시
    done(null, false, { reason: '올바르지 않은 비밀번호 입니다.' });
  } catch (error) {
    console.error(error);
    done(error);
  }
}

module.exports = () => {
  passport.use('local', new LocalStrategy(passportConfig, passportVerify));
  passport.use('jwt', new JWTStrategy(JWTConfig, JWTVerify));
};
