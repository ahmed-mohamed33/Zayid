import { useState, useEffect } from "react";
import {
  registerUser,
  writeUserData,
  subscribeToAllUsers,
  subscribeToAuthState
} from "../utils/firebaseUtils";

function LoginPageFireBaseTest() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [usersData, setUsersData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuthState((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to all users data
  useEffect(() => {
    const unsubscribe = subscribeToAllUsers(({ data, error, exists }) => {
      if (error) {
        console.error("Error reading users:", error);
        setUsersData(null);
        return;
      }
      
      if (exists) {
        setUsersData(data);
      } else {
        setUsersData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const { user, error: registerError } = await registerUser(email, password);
      
      if (registerError) {
        setError(registerError);
        return;
      }

      const { error: writeError } = await writeUserData(user.uid, {
        username: name,
        email: email,
      });

      if (writeError) {
        setError(writeError);
        return;
      }

      // Clear form
      setEmail("");
      setName("");
      setPassword("");
      setError("");
      
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {currentUser && (
        <div className="mb-4 text-green-600">
          Logged in as: {currentUser.email}
        </div>
      )}

      <input
        type="name"
        placeholder="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-2 p-2 border rounded"
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-2 p-2 border rounded"
      />
      
      <input 
        type="password" 
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-2 p-2 border rounded"
      />
      
      <button 
        onClick={handleLogin}
        className="mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Register
      </button>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <h2 className="mt-4 mb-2 text-xl font-semibold">Real-time Database Users:</h2>
      {usersData && (
        <pre
          className="bg-gray-100 p-4 rounded"
          style={{
            textAlign: "left",
            marginTop: "1rem",
            maxWidth: "400px",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(usersData, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default LoginPageFireBaseTest;
