import { useFormik } from 'formik';

interface LoginProps {
  showLogin: boolean;
  setShowLogin: (showLogin: boolean) => void;
  showRegister: boolean;
  setShowRegister: (showRegister: boolean) => void;
  toggleLoginRegister: () => void;
  newLogin: (username: string, firstName: string, lastName: string) => void;
}

const Login: React.FC<LoginProps> = (props) => {
  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    onSubmit: async (values) => {
      console.log(values);
      const res = await fetch('/api/login', {
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
      <h1>Login</h1>
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
          type='password'
          placeholder='Password'
          name='password'
          value={formik.values.password}
          onChange={formik.handleChange}
          required
        />
        <button type='submit'>Log In</button>
      </form>
      <button onClick={props.toggleLoginRegister}>Sign Up</button>
    </div>
  );
};

export default Login;
