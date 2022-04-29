import { useFormik } from 'formik';
import { useState } from 'react';

interface RegisterProps {
  showLogin: boolean;
  setShowLogin: (showLogin: boolean) => void;
  showRegister: boolean;
  setShowRegister: (showRegister: boolean) => void;
  toggleLoginRegister: () => void;
  newLogin: (username: string, firstName: string, lastName: string) => void;
}

const Register: React.FC<RegisterProps> = (props) => {
  const [passwordRepeat, setPasswordReapeat] = useState('');
  const formik = useFormik({
    initialValues: {
      username: '',
      firstName: '',
      lastName: '',
      password: '',
    },
    onSubmit: async (values) => {
      if (values.password !== passwordRepeat) {
        alert('Passwords do not match!');
        return;
      }

      const res = await fetch('/api/register', {
        method: 'post',
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        alert(await res.text());
        return;
      }
      loadUser();
    },
  });

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
      <form onSubmit={formik.handleSubmit}>
        <input
          type='text'
          placeholder='Username'
          name='username'
          value={formik.values.username}
          onChange={formik.handleChange}
          required
        />
        <input
          type='text'
          placeholder='First Name'
          name='firstName'
          value={formik.values.firstName}
          onChange={formik.handleChange}
          required
        />
        <input
          type='text'
          placeholder='Last Name'
          name='lastName'
          value={formik.values.lastName}
          onChange={formik.handleChange}
          required
        />
        <input
          type='password'
          placeholder='Password'
          name='password'
          value={formik.values.password}
          onChange={formik.handleChange}
          required
        />
        <input
          type='password'
          placeholder='Repeat Password'
          name='passwordRepeat'
          value={passwordRepeat}
          onChange={(e) => setPasswordReapeat(e.target.value)}
          required
        />
        <button type='submit'>Register</button>
      </form>
      <button onClick={props.toggleLoginRegister}>Login</button>
    </div>
  );
};

export default Register;
