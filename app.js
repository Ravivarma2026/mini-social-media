import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  // GET POSTS
  useEffect(() => {
    axios.get("http://localhost:5000/api/posts")
      .then(res => {
        setPosts(res.data);
      })
      .catch(err => console.log(err));
  }, []);

  // LOGIN
  const login = () => {
    axios.post("http://localhost:5000/api/login", {
      username,
      password
    })
    .then(res => {
      console.log("Login Success:", res.data);
      setUser(res.data);
    })
    .catch(err => {
      console.log(err.response?.data);
      alert("Login failed");
    });
  };

  // LOGOUT
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

      {posts.map((post, index) => (
        <div key={index} style={{ marginBottom: 10 }}>
          <p><b>{post.username}</b></p>
          <p>{post.caption}</p>
        </div>
      ))}

    </div>
  );
}

export default App;