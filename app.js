import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://mini-social-media-08pz.onrender.com";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  // ================= GET POSTS =================
  useEffect(() => {
    axios.get(`${BASE_URL}/api/posts`)
      .then(res => {
        setPosts(res.data);
      })
      .catch(err => {
        console.log("Posts error:", err);
      });
  }, []);

  // ================= LOGIN =================
  const login = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/api/login`, {
        username,
        password
      });

      console.log("Login Success:", res.data);

      // ✅ FIX: store only user
      setUser(res.data.user);

    } catch (err) {
      console.log(err.response?.data);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  // ================= LOGOUT =================
  const logout = () => {
    setUser(null);
    setUsername("");
    setPassword("");
  };

  return (
    <div style={{ padding: 20 }}>

      {/* LOGIN / USER SECTION */}
      {user ? (
        <div>
          <h2>Welcome {user.username}</h2>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <h2>Login</h2>

          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <br /><br />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br /><br />

          <button onClick={login}>Login</button>
        </div>
      )}

      <hr />

      {/* POSTS */}
      <h2>Posts</h2>

      {posts.length === 0 ? (
        <p>No posts available</p>
      ) : (
        posts.map((post, index) => (
          <div key={index} style={{ marginBottom: 10 }}>
            <p><b>{post.username}</b></p>
            <p>{post.caption}</p>
          </div>
        ))
      )}

    </div>
  );
}

export default App;