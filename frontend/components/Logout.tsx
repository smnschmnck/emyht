import Router from 'next/router';

interface LogoutProps {
  type?: 'button' | 'submit';
  children: React.ReactNode;
  className: string;
}

const Logout: React.FC<LogoutProps> = ({ children, className, type }) => {
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
      <button
        onClick={handleLogout}
        className={className}
        title="Log Out"
        type={type}
      >
        {children}
      </button>
    </>
  );
};

export default Logout;
