const session = require("express-session");
const { pool } = require("./db");

class PgSessionStore extends session.Store {
  get(sid, callback) {
    pool.query("SELECT sess FROM session WHERE sid = $1 AND expire > now()", [sid])
      .then((result) => callback(null, result.rows[0] ? result.rows[0].sess : null))
      .catch(callback);
  }

  set(sid, sess, callback) {
    const expire = expiry(sess);
    pool.query(
      `INSERT INTO session (sid, sess, expire)
       VALUES ($1, $2::json, $3)
       ON CONFLICT (sid) DO UPDATE SET sess = EXCLUDED.sess, expire = EXCLUDED.expire`,
      [sid, JSON.stringify(sess), expire]
    ).then(() => callback && callback()).catch(callback);
  }

  destroy(sid, callback) {
    pool.query("DELETE FROM session WHERE sid = $1", [sid])
      .then(() => callback && callback())
      .catch(callback);
  }

  touch(sid, sess, callback) {
    pool.query("UPDATE session SET expire = $2 WHERE sid = $1", [sid, expiry(sess)])
      .then(() => callback && callback())
      .catch(callback);
  }
}

function expiry(sess) {
  const maxAge = sess.cookie && sess.cookie.maxAge ? sess.cookie.maxAge : 24 * 60 * 60 * 1000;
  return new Date(Date.now() + maxAge);
}

module.exports = PgSessionStore;
