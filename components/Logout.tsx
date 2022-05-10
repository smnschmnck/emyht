import Router from 'next/router';

const Logout: React.FC = () => {
  const handleLogout = async () => {
    const res = await fetch('/api/logout');
    if (res.ok) {
      Router.push('/');
    } else {
      alert(await res.text());
    }
  };
  return (
    <>
      <button onClick={handleLogout}>Logout</button>
    </>
  );
};

export default Logout;
