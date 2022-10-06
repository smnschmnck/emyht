interface GreetingProps {
  username: string;
  email: string;
}

const Greeting: React.FC<GreetingProps> = ({ username, email }) => {
  return (
    <div>
      <h1>Hello {username}</h1>
      <h4>E-Mail: {email}</h4>
    </div>
  );
};

export default Greeting;
