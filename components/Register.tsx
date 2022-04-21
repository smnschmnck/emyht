import { FormEvent, useState } from 'react';

interface RegisterProps {
  showLogin: boolean;
  setShowLogin: (showLogin: boolean) => void;
  showRegister: boolean;
  setShowRegister: (showRegister: boolean) => void;
  toggleLoginRegister: () => void;
  newLogin: (username: string, firstName: string, lastName: string) => void;
}

const Register: React.FC<RegisterProps> = (props) => {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastname] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');

  const register = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== passwordRepeat) {
      alert('Passwords do not match!');
      return;
    }

    const creds = {
      username: username,
      firstName: firstName,
      lastName: lastName,
      password: password,
    };

    const res = await fetch('/api/register', {
      method: 'post',
      body: JSON.stringify(creds),
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
      <h1>Register</h1>
      <form onSubmit={(e) => register(e)}>
        <input
          type='text'
          placeholder='Username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type='text'
          placeholder='Firstname'
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type='text'
          placeholder='Lastname'
          value={lastName}
          onChange={(e) => setLastname(e.target.value)}
          required
        />
        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type='password'
          placeholder='Repeat Password'
          value={passwordRepeat}
          onChange={(e) => setPasswordRepeat(e.target.value)}
          required
        />
        <button type='submit'>Register</button>
      </form>
      <button onClick={props.toggleLoginRegister}>Login</button>
    </div>
  );
};

export default Register;
