import { FormEvent, useState } from 'react';

interface LoginProps {
  showLogin: boolean;
  setShowLogin: (showLogin: boolean) => void;
  showRegister: boolean;
  setShowRegister: (showRegister: boolean) => void;
  toggleLoginRegister: () => void;
  newLogin: (username: string, firstName: string, lastName: string) => void;
}

const Login: React.FC<LoginProps> = (props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = async (e: FormEvent) => {
    e.preventDefault();
    const credentials = {
      username: username,
      password: password,
    };
    const creds = JSON.stringify(credentials);
    const res = await fetch('/api/login', {
      method: 'post',
      body: creds,
    });
    if (!res.ok) {
      alert(await res.text());
      return;
    }
    loadUser();
  };

  const loadUser = async () => {
    const res = await fetch('/api/user');
    if (!res.ok) {
      alert(await res.text());
      return;
    }
    const json = await res.json();
    props.newLogin(json.username, json.firstName, json.lastName);
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={(e) => login(e)}>
        <input
          type='text'
          placeholder='Username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type='submit'>Log In</button>
      </form>
      <button onClick={props.toggleLoginRegister}>Sign Up</button>
    </div>
  );
};

export default Login;
